import { useState } from 'react'
import './Questionnaire.css'
import { insertStudy3Row } from "../utils/insertStudy3Row";


/**
 * 问卷页面组件
 * 功能：
 * 1. 显示单选题和Likert量表题
 * 2. 收集用户回答
 * 3. 提交数据（行为数据 + 问卷数据）
 */
export default function Questionnaire({ behaviorData, userId, onBack }) {
  const [answers, setAnswers] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null

  // 问卷题目配置（后续可扩展）
  // 这里先提供示例题目，您可以根据需要修改
  const questions = [
    {
      id: 'q1',
      type: 'single', // 单选题
      text: '您对这个视频的总体印象如何？',
      options: [
        { value: '1', label: '非常不喜欢' },
        { value: '2', label: '不喜欢' },
        { value: '3', label: '一般' },
        { value: '4', label: '喜欢' },
        { value: '5', label: '非常喜欢' }
      ]
    },
    {
      id: 'q2',
      type: 'likert', // Likert量表
      text: '这个视频的内容很有趣',
      scale: 7, // 7点量表
      labels: {
        left: '完全不同意',
        right: '完全同意'
      }
    },
    {
      id: 'q3',
      type: 'likert',
      text: '我会推荐这个视频给朋友',
      scale: 7,
      labels: {
        left: '完全不同意',
        right: '完全同意'
      }
    },
    {
      id: 'q4',
      type: 'single',
      text: '您观看这个视频时的情绪状态是？',
      options: [
        { value: '1', label: '非常消极' },
        { value: '2', label: '消极' },
        { value: '3', label: '中性' },
        { value: '4', label: '积极' },
        { value: '5', label: '非常积极' }
      ]
    }
  ]

  // 处理单选题选择
  const handleSingleChoice = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  // 处理Likert量表选择
  const handleLikertChoice = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value)
    }))
  }

  // 检查是否所有题目都已回答
  const isAllAnswered = () => {
    return questions.every(q => answers[q.id] !== undefined && answers[q.id] !== '')
  }

  // 提交问卷（写入 Supabase）
const handleSubmit = async () => {
  if (!isAllAnswered()) {
    alert('请回答所有题目后再提交')
    return
  }

  if (isSubmitting) return

  setIsSubmitting(true)
  setSubmitStatus(null)

  try {
    const payload = {
      user_id: userId,

      // 行为数据（⚠️ 字段名以你 VideoExperiment 为准）
      video_id: behaviorData?.videoId ?? null,
      liked: !!behaviorData?.liked,
      cart: !!behaviorData?.cart,
      watch_time_ms: Math.round(behaviorData?.watchTimeMs ?? 0),
      completed: !!behaviorData?.completed,

      // 问卷答案（整体 JSON，最稳）
      answers_json: answers,

      created_at: new Date().toISOString()
    }

    console.log('📦 写入 Supabase 的数据：', payload)

    await insertStudy3Row(payload)

    setSubmitStatus('success')
  } catch (error) {
    console.error('❌ Supabase 写入失败:', error)
    setSubmitStatus('error')
  } finally {
    setIsSubmitting(false)
  }
}


  // 渲染单选题
  const renderSingleChoice = (question) => {
    return (
      <div className="question-item">
        <div className="question-text">{question.text}</div>
        <div className="options-group">
          {question.options.map(option => (
            <label key={option.value} className="option-label">
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={answers[question.id] === option.value}
                onChange={() => handleSingleChoice(question.id, option.value)}
              />
              <span className="option-text">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  // 渲染Likert量表
  const renderLikertScale = (question) => {
    const scalePoints = Array.from({ length: question.scale }, (_, i) => i + 1)
    
    return (
      <div className="question-item">
        <div className="question-text">{question.text}</div>
        <div className="likert-container">
          <div className="likert-labels">
            <span className="likert-label-left">{question.labels.left}</span>
            <span className="likert-label-right">{question.labels.right}</span>
          </div>
          <div className="likert-scale">
            {scalePoints.map(point => (
              <label key={point} className="likert-option">
                <input
                  type="radio"
                  name={question.id}
                  value={point}
                  checked={answers[question.id] === point}
                  onChange={() => handleLikertChoice(question.id, point)}
                />
                <span className="likert-number">{point}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (submitStatus === 'success') {
    return (
      <div className="questionnaire-container">
        <div className="submit-success">
          <div className="success-icon">✓</div>
          <h2>提交成功！</h2>
          <p>感谢您的参与，实验数据已成功记录。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-content">
        <div className="questionnaire-header">
          {onBack && (
            <button 
              className="back-button"
              onClick={onBack}
              aria-label="返回视频"
              title="返回视频"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          )}
          <h1 className="questionnaire-title">实验问卷</h1>
        </div>
        <p className="questionnaire-intro">请根据刚才观看的视频回答以下问题</p>

        <div className="questions-list">
          {questions.map(question => (
            <div key={question.id} className="question-wrapper">
              {question.type === 'single' 
                ? renderSingleChoice(question)
                : renderLikertScale(question)
              }
            </div>
          ))}
        </div>

        <div className="submit-section">
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!isAllAnswered() || isSubmitting}
          >
            {isSubmitting ? '提交中...' : '提交问卷'}
          </button>
          
          {submitStatus === 'error' && (
            <div className="error-message">
              提交失败，请重试
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

