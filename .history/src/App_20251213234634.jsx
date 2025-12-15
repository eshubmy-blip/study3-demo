import { useState, useEffect } from 'react'
import StartPage from './components/StartPage'
import VideoExperiment from './components/VideoExperiment'
import Questionnaire from './components/Questionnaire'
import { generateUserId } from './utils/uuid'
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

  useEffect(() => {
    const id = generateUserId()
    setUserId(id)
    console.log('用户ID已生成:', id)
  }, [])

  const handleStart = () => {
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
    
    // 重置交互状态（新开始实验）
    setInteractionState({
      likeClicked: false,
      cartClicked: false
    })
    setCurrentStep('video')
  }

  const handleVideoComplete = (data) => {
    console.log('行为数据已记录:', data)
    setBehaviorData(data)
    setCurrentStep('questionnaire')
  }

  const handleBackToVideo = () => {
    // 从 behaviorData 恢复交互状态（如果存在）
    if (behaviorData) {
      setInteractionState({
        likeClicked: behaviorData.like === 1,
        cartClicked: behaviorData.cart === 1
      })
    }
    setCurrentStep('video')
  }

  // 处理交互状态变化
  const handleInteractionChange = (type, value) => {
    setInteractionState(prev => ({
      ...prev,
      [type]: value
    }))
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

      {currentStep === 'video' && (
        <VideoExperiment 
          onComplete={handleVideoComplete}
          initialLikeState={interactionState.likeClicked}
          initialCartState={interactionState.cartClicked}
          onInteractionChange={handleInteractionChange}
        />
      )}

      {currentStep === 'questionnaire' && behaviorData && (
        <Questionnaire 
          behaviorData={behaviorData} 
          userId={userId}
          onBack={handleBackToVideo}
        />
      )}
    </div>
  )
}

export default App
