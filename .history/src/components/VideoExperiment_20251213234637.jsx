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
export default function VideoExperiment({ 
  onComplete, 
  initialLikeState = false, 
  initialCartState = false,
  onInteractionChange 
}) {
  const [videoData, setVideoData] = useState(null)
  const [likeClicked, setLikeClicked] = useState(initialLikeState)
  const [cartClicked, setCartClicked] = useState(initialCartState)
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
    console.log("[VIDEO PICKED]", video)         // ✅ 新增
    console.log("[VIDEO URL]", video?.url)       // ✅ 新增

  }, [])

  // 视频加载完成后自动播放
  useEffect(() => {
    if (!videoRef.current || !videoData) return
    const video = videoRef.current
  
    // 确保视频不是静音的，音量设置为最大
    video.muted = false
    video.volume = 1.0
    
    // 等待视频可以播放后立即尝试播放
    const handleCanPlay = () => {
      video.play().then(() => {
        console.log('视频播放成功，声音已启用')
      }).catch(err => {
        console.error('自动播放失败:', err)
        // 如果自动播放失败，尝试静音播放作为备选
        if (err.name === 'NotAllowedError') {
          console.warn('浏览器阻止自动播放，尝试静音播放')
          video.muted = true
          video.play().catch(e => {
            console.error('静音播放也失败:', e)
          })
        }
      })
    }
    
    // 如果视频已经可以播放，立即尝试
    if (video.readyState >= 3) { // HAVE_FUTURE_DATA
      handleCanPlay()
    } else {
      video.addEventListener('canplay', handleCanPlay, { once: true })
    }
  
    const handlePlay = () => {
      setIsPlaying(true)
  
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = setInterval(() => {
        setWatchDuration(video.currentTime || 0)
      }, 100)
    }
  
    const handleEnded = () => {
      setIsCompleted(true)
      const finalDuration = video.currentTime || watchDuration
      setWatchDuration(finalDuration)
  
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
  
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
  
    video.addEventListener('play', handlePlay)
    video.addEventListener('ended', handleEnded)
  
    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('ended', handleEnded)
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
    }
  }, [videoData, likeClicked, cartClicked, onComplete])
  

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

