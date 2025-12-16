import { useState, useEffect, useRef, useCallback } from 'react'
import StartPage from './components/StartPage'
import VideoExperiment from './components/VideoExperiment'
import Questionnaire from './components/Questionnaire'
import { generateUserId } from './utils/uuid'
import { insertOrUpdateStudy3Session } from './utils/insertStudy3Session'
import { getLeastCompletedVideo } from './utils/videos'
import './App.css'

function App() {
  const [currentStep, setCurrentStep] = useState('start') // 'start' | 'video' | 'questionnaire'
  const [userId, setUserId] = useState(null)
  const [behaviorData, setBehaviorData] = useState(null)
  // 交互状态管理（状态提升）
  const [interactionState, setInteractionState] = useState({
    likeClicked: false,
    cartClicked: false
  })
  // 当前视频数据（用于从问卷返回时恢复）
  const [currentVideoData, setCurrentVideoData] = useState(null)
  // 问卷答案暂存（提升到 App 层）
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState({})
  // 返回观看次数
  const [returnCount, setReturnCount] = useState(0)
  // Session 是否已创建
  const sessionCreatedRef = useRef(false)
  // 视频是否已选择（防止重复选择）
  const videoPickedRef = useRef(false)

  useEffect(() => {
    const id = generateUserId()
    setUserId(id)
    console.log('用户ID已生成:', id)
    
    // 如果刷新页面，重置所有状态
    videoPickedRef.current = false
    sessionCreatedRef.current = false
  }, [])

  const handleStart = async () => {
    // 这一次点击 = 用户交互
    // 立即创建一个临时视频元素来解锁音频播放权限
    const tempVideo = document.createElement('video')
    tempVideo.muted = false
    tempVideo.volume = 1.0
    // 尝试播放一个空视频来解锁权限
    tempVideo.play().then(() => {
      tempVideo.pause()
      tempVideo.remove()
    }).catch(() => {
      tempVideo.remove()
    })
    
    // 重置交互状态和视频数据（新开始实验）
    setInteractionState({
      likeClicked: false,
      cartClicked: false
    })
    setQuestionnaireAnswers({}) // 清除问卷答案
    setReturnCount(0) // 重置返回次数
    sessionCreatedRef.current = false // 重置 session 创建标志
    videoPickedRef.current = false // 重置视频选择标志
    
    // 新开始实验时，基于“最少完成数优先”策略选择视频（只执行一次，使用 useRef 防止重复）
    if (!videoPickedRef.current) {
      const video = await getLeastCompletedVideo()
      setCurrentVideoData(video)
      videoPickedRef.current = true
      console.log("[VIDEO PICKED IN APP]", video.video_id)
      
      // 创建 session 记录（使用 useRef 防止重复创建）
      if (!sessionCreatedRef.current && userId && video?.video_id) {
        const createSession = async () => {
          try {
            await insertOrUpdateStudy3Session({
              user_id: userId,
              video_id: video.video_id,
              completed: 0,
              return_count: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            sessionCreatedRef.current = true
            console.log('✅ Session 记录已创建 (首次进入视频)')
          } catch (error) {
            console.error('❌ Session 记录创建失败:', error)
          }
        }
        createSession()
      }
    }
    
    setCurrentStep('video')
  }

  const handleVideoComplete = useCallback(async (data) => {
    console.log('行为数据已记录:', data)
    setBehaviorData(data)
    // currentVideoData 已经在 App 层管理，不需要从 data 中获取
    // 从问卷返回时会自动使用相同的 currentVideoData

    // 更新 session 记录（视频播放完成，但问卷未完成）
    if (sessionCreatedRef.current && userId && data.video_id) {
      try {
        await insertOrUpdateStudy3Session({
          user_id: userId,
          video_id: data.video_id,
          completed: 0, // 问卷还未完成
          return_count: returnCount,
          updated_at: new Date().toISOString()
        })
        console.log('✅ Session 记录已更新（视频完成）')
      } catch (error) {
        console.error('❌ Session 记录更新失败:', error)
        // 不阻止流程继续
      }
    }

    setCurrentStep('questionnaire')
  }, [returnCount, userId])

  const handleBackToVideo = async () => {
    // 从 behaviorData 恢复交互状态（如果存在）
    if (behaviorData) {
      setInteractionState({
        likeClicked: behaviorData.like === 1,
        cartClicked: behaviorData.cart === 1
      })
    }
    
    // 增加返回观看次数
    const newReturnCount = returnCount + 1
    setReturnCount(newReturnCount)
    
    // 更新 session 记录中的 return_count
    // 使用 currentVideoData.video_id 而不是 behaviorData.video_id，确保一致性
    if (sessionCreatedRef.current && userId && currentVideoData?.video_id) {
      try {
        await insertOrUpdateStudy3Session({
          user_id: userId,
          video_id: currentVideoData.video_id,
          completed: 0,
          return_count: newReturnCount,
          updated_at: new Date().toISOString()
        })
        console.log('✅ 返回次数已更新:', newReturnCount)
      } catch (error) {
        console.error('❌ 返回次数更新失败:', error)
        // 不阻止流程继续
      }
    }
    
    // 不重新选择视频，使用相同的 currentVideoData
    // videoPickedRef 保持为 true，确保不会重新随机选择
    setCurrentStep('video')
  }

  // 处理交互状态变化
  const handleInteractionChange = (type, value) => {
    setInteractionState(prev => ({
      ...prev,
      [type]: value
    }))
  }

  // 处理问卷答案变化
  const handleQuestionnaireAnswerChange = (questionId, value) => {
    setQuestionnaireAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  // 处理问卷提交完成（在 study3_data 插入成功后调用）
  const handleQuestionnaireSubmitComplete = async () => {
    // 更新 session 记录为已完成状态
    if (sessionCreatedRef.current && userId && currentVideoData?.video_id) {
      try {
        await insertOrUpdateStudy3Session({
          user_id: userId,
          video_id: currentVideoData.video_id,
          stage: 'done', // 标记阶段为完成
          completed: 1, // 标记为已完成
          return_count: returnCount,
          updated_at: new Date().toISOString()
        })
        console.log("[SESSION DONE OK]")
      } catch (error) {
        console.error("[SESSION DONE ERROR]", error)
        throw error // 抛出错误，让调用方知道更新失败
      }
    } else {
      console.warn("[SESSION DONE WARNING] Session not found or missing data")
    }
  }

  if (!userId) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">初始化中...</div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {currentStep === 'start' && (
        <StartPage onStart={handleStart} />
      )}

      {currentStep === 'video' && currentVideoData && (
        <VideoExperiment 
          onComplete={handleVideoComplete}
          initialLikeState={interactionState.likeClicked}
          initialCartState={interactionState.cartClicked}
          onInteractionChange={handleInteractionChange}
          videoData={currentVideoData}
        />
      )}
      
      {currentStep === 'questionnaire' && behaviorData && (
        <Questionnaire 
          behaviorData={behaviorData} 
          userId={userId}
          onBack={handleBackToVideo}
          answers={questionnaireAnswers}
          onAnswerChange={handleQuestionnaireAnswerChange}
          returnCount={returnCount}
          onSubmitComplete={handleQuestionnaireSubmitComplete}
        />
      )}
    </div>
  )
}

export default App
