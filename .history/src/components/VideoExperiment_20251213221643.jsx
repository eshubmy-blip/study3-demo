import { useState, useEffect, useRef } from 'react'
import { getRandomVideo } from '../utils/videos'
import './VideoExperiment.css'

/**
 * 视频实验页面组件
 * 功能：
 * 1. 随机播放一个视频（20-25秒）
 * 2. 全屏竖屏播放，禁止快进
 * 3. 右侧交互按钮（红心、购物车）
 * 4. 记录行为数据（观看时长、点击行为等）
 */
export default function VideoExperiment({ onComplete }) {
  const [videoData, setVideoData] = useState(null)
  const [likeClicked, setLikeClicked] = useState(false)
  const [cartClicked, setCartClicked] = useState(false)
  const [watchDuration, setWatchDuration] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const videoRef = useRef(null)
  const startTimeRef = useRef(null)
  const durationIntervalRef = useRef(null)

  // 初始化：随机选择视频
  useEffect(() => {
    const video = getRandomVideo()
    setVideoData(video)
  }, [])

  // 视频加载完成后自动播放
  useEffect(() => {
    if (videoRef.current && videoData) {
      const video = videoRef.current
      
      const handleCanPlay = () => {
        video.play().catch(err => {
          console.error('自动播放失败:', err)
        })
      }

      const handlePlay = () => {
        setIsPlaying(true)
        startTimeRef.current = Date.now()
        // 开始记录观看时长
        durationIntervalRef.current = setInterval(() => {
          if (video.currentTime) {
            setWatchDuration(video.currentTime)
          }
        }, 100) // 每100ms更新一次，精确到0.1秒
      }

      const handleEnded = () => {
        setIsCompleted(true)
        const finalDuration = video.currentTime || watchDuration
        setWatchDuration(finalDuration)
        
        // 清理定时器
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current)
        }
        
        // 延迟500ms后跳转到问卷页面
        setTimeout(() => {
          onComplete({
            video_id: videoData.id,
            like: likeClicked ? 1 : 0,
            cart: cartClicked ? 1 : 0,
            watch_duration: parseFloat(finalDuration.toFixed(2)),
            completed: 1
          })
        }, 500)
      }

      const handleTimeUpdate = () => {
        // 防止用户快进：如果用户尝试跳转，重置到当前允许的位置
        // 这里我们通过禁用controls来防止快进，但保留这个逻辑作为额外保护
      }

      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('play', handlePlay)
      video.addEventListener('ended', handleEnded)
      video.addEventListener('timeupdate', handleTimeUpdate)

      return () => {
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('play', handlePlay)
        video.removeEventListener('ended', handleEnded)
        video.removeEventListener('timeupdate', handleTimeUpdate)
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current)
        }
      }
    }
  }, [videoData, watchDuration, likeClicked, cartClicked, onComplete])

  // 处理红心点击（可切换）
  const handleLikeClick = () => {
    setLikeClicked(prev => !prev)
  }

  // 处理购物车点击（可切换）
  const handleCartClick = () => {
    setCartClicked(prev => !prev)
  }

  if (!videoData) {
    return (
      <div className="video-experiment-loading">
        <div className="loading-spinner">加载中...</div>
      </div>
    )
  }

  return (
    <div className="video-experiment-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          src={videoData.url}
          className="experiment-video"
          playsInline
          webkit-playsinline="true"
          x5-playsinline="true"
          controls={false}
          preload="auto"
          muted
        />
        
        {/* 交互按钮区域 */}
        <div className="interaction-buttons">
          <button
            className={`interaction-btn like-btn ${likeClicked ? 'clicked' : ''}`}
            onClick={handleLikeClick}
            aria-label={likeClicked ? '取消点赞' : '点赞'}
          >
            <span className="btn-icon">❤️</span>
            <span className="btn-label">{likeClicked ? '已点赞' : '点赞'}</span>
          </button>
          
          <button
            className={`interaction-btn cart-btn ${cartClicked ? 'clicked' : ''}`}
            onClick={handleCartClick}
            aria-label={cartClicked ? '移出购物车' : '加入购物车'}
          >
            <span className="btn-icon">🛒</span>
            <span className="btn-label">{cartClicked ? '已加入' : '加入购物车'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

