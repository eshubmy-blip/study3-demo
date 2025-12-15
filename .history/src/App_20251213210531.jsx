import { useState, useEffect } from 'react'
import VideoExperiment from './components/VideoExperiment'
import Questionnaire from './components/Questionnaire'
import { generateUserId } from './utils/uuid'
import './App.css'

/**
 * 主应用组件
 * 功能：
 * 1. 流程控制（视频实验 -> 问卷）
 * 2. 用户ID管理
 * 3. 行为数据收集和传递
 */
function App() {
  const [currentStep, setCurrentStep] = useState('video') // 'video' | 'questionnaire'
  const [userId, setUserId] = useState(null)
  const [behaviorData, setBehaviorData] = useState(null)

  // 初始化：生成用户ID
  useEffect(() => {
    const id = generateUserId()
    setUserId(id)
    console.log('用户ID已生成:', id)
  }, [])

  // 视频实验完成回调
  const handleVideoComplete = (data) => {
    console.log('行为数据已记录:', data)
    setBehaviorData(data)
    setCurrentStep('questionnaire')
  }

  // 如果用户ID还未生成，显示加载状态
  if (!userId) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">初始化中...</div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {currentStep === 'video' && (
        <VideoExperiment onComplete={handleVideoComplete} />
      )}
      
      {currentStep === 'questionnaire' && behaviorData && (
        <Questionnaire 
          behaviorData={behaviorData} 
          userId={userId}
        />
      )}
    </div>
  )
}

export default App

