import { useState, useEffect } from 'react'
import './Questionnaire.css'
import { insertStudy3Row } from "../utils/insertStudy3Row";

/**
 * 问卷页面组件 - Study 3 正式问卷
 * 功能：
 * 1. 显示所有问卷题目（Q1-Q15）
 * 2. 收集用户回答
 * 3. 提交数据（行为数据 + 问卷数据）
 */
export default function Questionnaire({ 
  behaviorData, 
  userId, 
  onBack,
  answers: initialAnswers = {},
  onAnswerChange,
  returnCount = 0,
  onSubmitComplete
}) {
  const [answers, setAnswers] = useState(initialAnswers)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null
  const [missingQuestionIds, setMissingQuestionIds] = useState(new Set()) // 显示错误提示的题目ID集合

  // 当外部传入的 answers 变化时，同步更新本地状态（用于从视频返回时恢复答案）
  useEffect(() => {
    setAnswers(initialAnswers)
  }, [initialAnswers])

  // Study 3 正式问卷题目配置
  const questions = [
    // Q1: 语义差异量表
    {
      id: 'Q1',
      type: 'semantic',
      textEn: 'This AI streamer appears to be culturally closer to…',
      textCn: '这个AI主播看起来像…',
      scale: 7,
      labels: {
        left: '1非常像中国人/Very Chinese',
        right: '7非常像马来人/Very Malaysian'
      }
    },
    // Q2: 语义差异量表
    {
      id: 'Q2',
      type: 'semantic',
      textEn: 'This product is more strongly associated with…',
      textCn: '这个产品与……的联系更紧密。',
      scale: 7,
      labels: {
        left: '1非常中国文化/Chinese culture',
        right: '7非常马来文化/Malaysian culture',
        middle: '4非常中性文化/Culturally neutral'
      }
    },
    // Q3: 文化匹配 (3题)
    {
      id: 'Q3_1',
      type: 'likert',
      textEn: 'I think this AI streamer is a cultural match for this product.',
      textCn: '我觉得这位 AI 主播与这个产品在文化上很匹配。',
      scale: 7,
      labels: {
        left: '1非常不匹配/Very mismatched',
        right: '7非常匹配/Very well matched'
      }
    },
    {
      id: 'Q3_2',
      type: 'likert',
      textEn: "I think it's appropriate for this AI live-streamer to recommend this product",
      textCn: '我觉得这位 AI 主播来推荐这个产品是合适的。',
      scale: 7,
      labels: {
        left: '1非常不合适/Very inappropriate',
        right: '7非常合适/Very appropriate'
      }
    },
    {
      id: 'Q3_3',
      type: 'likert',
      textEn: 'The combination of the live-streamer and the product makes me feel natural and not jarring.',
      textCn: '主播与产品的组合让我感觉自然、不突兀。',
      scale: 7,
      labels: {
        left: '1非常不自然/Very unnatural',
        right: '7非常自然/Very natural'
      }
    },
    // Q4: 期望一致性 (3题)
    {
      id: 'Q4_1',
      type: 'likert',
      textEn: "This AI streamer's recommendation of this product aligns with my common expectations for live-streaming sales.",
      textCn: '这位 AI 主播推荐这个产品符合我对直播带货的常见期待。',
      scale: 7,
      labels: {
        left: '1非常不符合/Strongly disagree',
        right: '7非常符合/Strongly agree'
      }
    },
    {
      id: 'Q4_2',
      type: 'likert',
      textEn: 'The combination of AI streamer and products is in line with my original expectations.',
      textCn: 'AI主播与产品的组合与我原本的预期是一致的。',
      scale: 7,
      labels: {
        left: '1非常不一致/Strongly disagree',
        right: '7非常一致/Strongly agree'
      }
    },
    {
      id: 'Q4_3',
      type: 'likert',
      textEn: "It's very easy for me to accept this AI streamer's recommendation of this product.",
      textCn: '我很容易接受这位 AI 主播来推荐这个产品。',
      scale: 7,
      labels: {
        left: '1非常不容易/Strongly disagree',
        right: '7非常容易/Strongly agree'
      }
    },
    // Q5: 处理流畅性 (3题)
    {
      id: 'Q5_1',
      type: 'likert',
      textEn: 'I think this recommendation is very easy to understand.',
      textCn: '我觉得这段推荐信息很容易理解。',
      scale: 7,
      labels: {
        left: '1非常不容易/Strongly disagree',
        right: '7非常容易/Strongly agree'
      }
    },
    {
      id: 'Q5_2',
      type: 'likert',
      textEn: 'I can almost effortlessly determine whether this product is worth buying.',
      textCn: '我几乎不需要费力就能判断这个产品是否值得购买。',
      scale: 7,
      labels: {
        left: '1非常不同意/Strongly disagree',
        right: '7非常同意/Strongly agree'
      }
    },
    {
      id: 'Q5_3',
      type: 'likert',
      textEn: 'During the viewing process, I felt that the information transmission was very smooth.',
      textCn: '观看过程中，我感到信息传递非常顺畅。',
      scale: 7,
      labels: {
        left: '1非常不顺畅/Strongly disagree',
        right: '7非常顺畅/Strongly agree'
      }
    },
    // Q6: 认知失调 (3题)
    {
      id: 'Q6_1',
      type: 'likert',
      textEn: 'During the viewing process, I felt a bit out of place or unnatural.',
      textCn: '在观看过程中，我感到有些不协调或不自然。',
      scale: 7,
      labels: {
        left: '1非常不同意/Strongly disagree',
        right: '7非常同意/Strongly agree'
      }
    },
    {
      id: 'Q6_2',
      type: 'likert',
      textEn: 'The combination of AI live-streamers and products has left me somewhat confused.',
      textCn: 'AI主播与产品的组合让我感到有些困惑。',
      scale: 7,
      labels: {
        left: '1非常不困惑/Not confused at all',
        right: '7非常困惑/Very confused'
      }
    },
    {
      id: 'Q6_3',
      type: 'likert',
      textEn: "I'm a bit torn about whether I should believe this recommendation.",
      textCn: '我在是否应该相信这段推荐上感到有些纠结。',
      scale: 7,
      labels: {
        left: '1非常不纠结/Not conflicted at all',
        right: '7非常纠结/Very conflicted'
      }
    },
    // Q7: 可信度 (3题)
    {
      id: 'Q7_1',
      type: 'likert',
      textEn: 'I think the recommendation of this AI live-streamer is reliable.',
      textCn: '我认为这位 AI 主播的推荐是可信的。',
      scale: 7,
      labels: {
        left: '1非常不可信/Very untrustworthy',
        right: '7非常可信/Very trustworthy'
      }
    },
    {
      id: 'Q7_2',
      type: 'likert',
      textEn: 'I think this AI live-streamer is reliable when introducing products.',
      textCn: '我觉得这位 AI 主播在介绍产品时是可靠的。',
      scale: 7,
      labels: {
        left: '1非常不可靠/Very unreliable',
        right: '7非常可靠/Very reliable'
      }
    },
    {
      id: 'Q7_3',
      type: 'likert',
      textEn: 'I am willing to believe the product information provided by this AI live-streamer.',
      textCn: '我愿意相信这位 AI 主播提供的产品信息。',
      scale: 7,
      labels: {
        left: '1非常不愿意/Very unwilling',
        right: '7非常愿意/Very willing'
      }
    },
    // Q8: 购买意愿 (3题)
    {
      id: 'Q8_1',
      type: 'likert',
      textEn: "If I see this product in the live stream, I'm willing to buy it.",
      textCn: '如果在直播间看到这个产品，我愿意购买它。',
      scale: 7,
      labels: {
        left: '1非常不愿意/Very unwilling',
        right: '7非常愿意/Very willing'
      }
    },
    {
      id: 'Q8_2',
      type: 'likert',
      textEn: 'I am willing to learn more and consider purchasing this product.',
      textCn: '我愿意进一步了解并考虑购买这个产品。',
      scale: 7,
      labels: {
        left: '1非常不考虑/Very unwilling',
        right: '7非常考虑/Very willing'
      }
    },
    {
      id: 'Q8_3',
      type: 'likert',
      textEn: "If I have the chance in the future, I'm very likely to purchase this product.",
      textCn: '如果将来有机会，我很可能会购买这个产品。',
      scale: 7,
      labels: {
        left: '1非常不会/Very unlikely',
        right: '7非常会/Very likely'
      }
    },
    // Q9: 注意力检验题
    {
      id: 'Q9',
      type: 'single',
      textEn: 'To ensure data quality, please select the number 5.',
      textCn: '为了确认数据质量，请选择数字5。',
      options: [
        { value: '2', label: '2' },
        { value: '5', label: '5' },
        { value: '10', label: '10' }
      ]
    },
    // Q10: 性别
    {
      id: 'Q10',
      type: 'single',
      textEn: 'Your Gender:',
      textCn: '您的性别：',
      options: [
        { value: '0', label: '女性 Female' },
        { value: '1', label: '男性 Male' },
        { value: '2', label: '其他或不愿透露 Other' }
      ]
    },
    // Q11: 年龄
    {
      id: 'Q11',
      type: 'single',
      textEn: 'Your Age:',
      textCn: '您的年龄：',
      options: [
        { value: '18-29', label: '18-29' },
        { value: '30-45', label: '30-45' },
        { value: '46-59', label: '46-59' },
        { value: '60+', label: '60 and above' }
      ]
    },
    // Q12: 族群
    {
      id: 'Q12',
      type: 'single',
      textEn: 'Your Ethnicity:',
      textCn: '您的族群：',
      options: [
        { value: '1', label: '华人 Chinese' },
        { value: '2', label: '马来人 Malay' },
        { value: '3', label: '印度人 Indian' },
        { value: '4', label: '其他 Other' },
        { value: '5', label: '不愿透露 Prefer not to say' }
      ]
    },
    // Q13: 居住地
    {
      id: 'Q13',
      type: 'single',
      textEn: 'Your Place of Residence:',
      textCn: '您的居住地：',
      options: [
        { value: '1', label: '城市 Urban' },
        { value: '2', label: '郊区 Suburban' },
        { value: '3', label: '农村 Rural' }
      ]
    },
    // Q14: 跨国直播购物频率
    {
      id: 'Q14',
      type: 'likert',
      textEn: 'Cross-border Live-streaming Shopping:',
      textCn: '您的跨国直播购物频率：',
      scale: 7,
      labels: {
        left: '1从不/Never',
        right: '7非常经常/Very often'
      }
    },
    // Q15: AI主播了解程度
    {
      id: 'Q15',
      type: 'likert',
      textEn: 'Familiarity with AI Streamers:',
      textCn: '对AI主播了解程度：',
      scale: 7,
      labels: {
        left: '1完全不了解/Very unfamiliar',
        right: '7非常了解/Very familiar'
      }
    }
  ]

  // 处理单选题选择
  const handleSingleChoice = (questionId, value) => {
    const newAnswers = {
      ...answers,
      [questionId]: value
    }
    setAnswers(newAnswers)
    // 通知父组件答案变化
    if (onAnswerChange) {
      onAnswerChange(questionId, value)
    }
    // 清除该题的错误提示
    setMissingQuestionIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(questionId)
      return newSet
    })
  }

  // 处理Likert量表选择
  const handleLikertChoice = (questionId, value) => {
    const intValue = parseInt(value)
    const newAnswers = {
      ...answers,
      [questionId]: intValue
    }
    setAnswers(newAnswers)
    // 通知父组件答案变化
    if (onAnswerChange) {
      onAnswerChange(questionId, intValue)
    }
    // 清除该题的错误提示
    setMissingQuestionIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(questionId)
      return newSet
    })
  }

  // 检查是否所有题目都已回答
  const isAllAnswered = () => {
    return questions.every(q => {
      const answer = answers[q.id]
      return answer !== undefined && answer !== '' && answer !== null
    })
  }

  // 找出未作答的题目ID列表（按题目顺序）
  const findMissingQuestions = () => {
    return questions
      .filter(q => {
        const answer = answers[q.id]
        return answer === undefined || answer === '' || answer === null
      })
      .map(q => q.id)
  }

  // 滚动到指定题目
  const scrollToQuestion = (questionId) => {
    const element = document.getElementById(`question-${questionId}`)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }

  // 提交问卷（写入 Supabase）
  const handleSubmit = async () => {
    if (isSubmitting) return // 防抖/锁：防止重复提交

    // 清除之前的错误提示
    setMissingQuestionIds(new Set())

    // 找出未作答的题目
    const missingIds = findMissingQuestions()

    if (missingIds.length > 0) {
      // 显示第一个未答题的错误提示
      setMissingQuestionIds(new Set([missingIds[0]]))
      
      // 滚动到第一个未答题
      setTimeout(() => {
        scrollToQuestion(missingIds[0])
      }, 100)
      
      return
    }

    // 所有题目都已回答，开始提交
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // 构建 payload，确保与数据库列严格一致
      const payload = {
        user_id: userId,

        // 行为数据
        video_id: behaviorData?.video_id ?? null,
        liked: behaviorData?.like === 1 ? 1 : 0, // int (0/1)，不是 boolean
        cart: behaviorData?.cart === 1 ? 1 : 0, // int (0/1)，不是 boolean
        watch_time: behaviorData?.watch_duration ?? 0, // 秒为单位，不是 watch_time_ms
        completed: behaviorData?.completed === 1 ? 1 : 0,

        // 问卷答案（整体 JSON）
        questionnaire: answers,

        created_at: new Date().toISOString()
      }

      // 提交前打印最终 payload
      console.log("[FINAL PAYLOAD]", JSON.stringify(payload, null, 2))

      // 步骤 1: 插入 study3_data
      const insertResult = await insertStudy3Row(payload)

      // 验证插入结果：只有当返回 OK 且 data 非空时，才继续
      if (!insertResult) {
        throw new Error("Insert returned no data")
      }

      console.log("[STUDY3_DATA INSERT OK]", insertResult)

      // 步骤 2: 在 study3_data 插入成功后，更新 sessions 为 done 状态
      if (onSubmitComplete) {
        try {
          await onSubmitComplete()
          console.log("[SESSION DONE OK]")
        } catch (sessionError) {
          // sessions 更新失败不影响成功状态，但记录错误
          console.error("[SESSION DONE ERROR]", sessionError)
          // 注意：这里不抛出错误，因为 study3_data 已经成功插入
        }
      }

      // 只有 study3_data 插入成功且 data 非空时，才显示成功页面
      setSubmitStatus('success')
    } catch (error) {
      console.error("[STUDY3_DATA INSERT ERROR]", error)
      setSubmitStatus('error')
      // 错误时不丢失已填答案，用户可以重试
    } finally {
      setIsSubmitting(false)
    }
  }

  // 渲染单选题
  const renderSingleChoice = (question) => {
    const showError = missingQuestionIds.has(question.id)
    return (
      <div className="question-item" id={`question-${question.id}`}>
        <div className="question-text">
          <div className="question-text-en">{question.textEn}</div>
          <div className="question-text-cn">{question.textCn}</div>
        </div>
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
        {showError && (
          <div className="question-error-message">
            <div className="error-text-en">Required — please answer this question before submitting.</div>
            <div className="error-text-cn">必答题——请先完成本题再提交。</div>
          </div>
        )}
      </div>
    )
  }

  // 渲染语义差异量表
  const renderSemanticScale = (question) => {
    const scalePoints = Array.from({ length: question.scale }, (_, i) => i + 1)
    const showError = missingQuestionIds.has(question.id)
    
    return (
      <div className="question-item" id={`question-${question.id}`}>
        <div className="question-text">
          <div className="question-text-en">{question.textEn}</div>
          <div className="question-text-cn">{question.textCn}</div>
        </div>
        <div className="likert-container">
          <div className="likert-labels">
            <span className="likert-label-left">{question.labels.left}</span>
            {question.labels.middle && (
              <span className="likert-label-middle">{question.labels.middle}</span>
            )}
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
        {showError && (
          <div className="question-error-message">
            <div className="error-text-en">Required — please answer this question before submitting.</div>
            <div className="error-text-cn">必答题——请先完成本题再提交。</div>
          </div>
        )}
      </div>
    )
  }

  // 渲染Likert量表
  const renderLikertScale = (question) => {
    const scalePoints = Array.from({ length: question.scale }, (_, i) => i + 1)
    const showError = missingQuestionIds.has(question.id)
    
    return (
      <div className="question-item" id={`question-${question.id}`}>
        <div className="question-text">
          <div className="question-text-en">{question.textEn}</div>
          <div className="question-text-cn">{question.textCn}</div>
        </div>
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
        {showError && (
          <div className="question-error-message">
            <div className="error-text-en">Required — please answer this question before submitting.</div>
            <div className="error-text-cn">必答题——请先完成本题再提交。</div>
          </div>
        )}
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
          <h1 className="questionnaire-title">
            <div className="title-en">Experimental Questionnaire</div>
            <div className="title-cn">实验问卷</div>
          </h1>
        </div>
        <div className="questionnaire-intro">
          <div className="intro-en">Please answer the following questions based on the video you just watched.</div>
          <div className="intro-cn">请根据刚才观看的视频回答以下问题</div>
        </div>

        <div className="questions-list">
          {questions.map(question => (
            <div key={question.id} className="question-wrapper">
              {question.type === 'single' 
                ? renderSingleChoice(question)
                : question.type === 'semantic'
                ? renderSemanticScale(question)
                : renderLikertScale(question)
              }
            </div>
          ))}
        </div>

        <div className="submit-section">
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? '提交中...' 
              : isAllAnswered() 
                ? 'Submit / 提交' 
                : 'Check required questions / 检查必答题'
            }
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
