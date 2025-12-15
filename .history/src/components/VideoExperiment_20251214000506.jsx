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
  onInteractionChange,
  initialVideoData = null
}) {
  const [videoData, setVideoData] = useState(initialVideoData)
  const [likeClicked, setLikeClicked] = useState(initialLikeState)
  const [cartClicked, setCartClicked] = useState(initialCartState)
  const [watchDuration, setWatchDuration] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState(null)
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  
  const videoRef = useRef(null)
  const startTimeRef = useRef(null)
  const durationIntervalRef = useRef(null)
  // 使用 ref 存储最新的交互状态，避免在 useEffect 依赖中频繁重新设置事件监听器
  const interactionStateRef = useRef({ likeClicked, cartClicked })

  // 当初始状态变化时，同步更新本地状态（用于从问卷返回时恢复状态）
  useEffect(() => {
    setLikeClicked(initialLikeState)
    setCartClicked(initialCartState)
    interactionStateRef.current = { 
      likeClicked: initialLikeState, 
      cartClicked: initialCartState 
    }
  }, [initialLikeState, initialCartState])

  // 同步更新 ref 中的状态值
  useEffect(() => {
    interactionStateRef.current = { likeClicked, cartClicked }
  }, [likeClicked, cartClicked])

  // 初始化：如果提供了初始视频数据就使用，否则随机选择
  useEffect(() => {
    if (initialVideoData) {
      // 从问卷返回，使用之前的视频
      setVideoData(initialVideoData)
      console.log("[VIDEO RESTORED]", initialVideoData)
    } else {
      // 新开始实验，随机选择视频
      const video = getRandomVideo()
      setVideoData(video)
      console.log("[VIDEO PICKED]", video)
      console.log("[VIDEO URL]", video?.url)
    }
  }, [initialVideoData])

  // 视频加载完成后自动播放
  useEffect(() => {
    if (!videoRef.current || !videoData) return
    const video = videoRef.current
  
    setIsVideoLoading(true)
    setVideoError(null)
    
    // 确保视频不是静音的，音量设置为最大
    video.muted = false
    video.volume = 1.0
    
    // 视频加载开始
    const handleLoadStart = () => {
      console.log('视频开始加载...')
      setIsVideoLoading(true)
    }
    
    // 视频可以播放
    const handleCanPlay = () => {
      console.log('视频可以播放')
      setIsVideoLoading(false)
      video.play().then(() => {
        console.log('视频播放成功，声音已启用')
      }).catch(err => {
        console.error('自动播放失败:', err)
        setIsVideoLoading(false)
        // 如果自动播放失败，尝试静音播放作为备选
        if (err.name === 'NotAllowedError') {
          console.warn('浏览器阻止自动播放，尝试静音播放')
          video.muted = true
          video.play().catch(e => {
            console.error('静音播放也失败:', e)
            setVideoError('视频播放失败，请点击视频手动播放')
          })
        } else {
          setVideoError('视频播放失败，请点击视频手动播放')
        }
      })
    }
    
    // 视频加载错误
    const handleError = (e) => {
      console.error('视频加载错误:', e)
      setIsVideoLoading(false)
      const error = video.error
      if (error) {
        let errorMsg = '视频加载失败'
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            errorMsg = '视频加载被中止'
            break
          case error.MEDIA_ERR_NETWORK:
            errorMsg = '网络错误，请检查网络连接'
            break
          case error.MEDIA_ERR_DECODE:
            errorMsg = '视频格式不支持，请使用其他浏览器'
            break
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMsg = '视频格式不支持'
            break
        }
        setVideoError(errorMsg)
      }
    }
    
    // 视频加载完成
    const handleLoadedData = () => {
      console.log('视频数据加载完成')
      setIsVideoLoading(false)
    }
    
    // 如果视频已经可以播放，立即尝试
    if (video.readyState >= 3) { // HAVE_FUTURE_DATA
      handleCanPlay()
    } else {
      video.addEventListener('loadstart', handleLoadStart)
      video.addEventListener('canplay', handleCanPlay, { once: true })
      video.addEventListener('loadeddata', handleLoadedData)
      video.addEventListener('error', handleError)
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
        // 使用 ref 获取最新的交互状态
        const currentState = interactionStateRef.current
        onComplete({
          video_id: videoData.id,
          like: currentState.likeClicked ? 1 : 0,
          cart: currentState.cartClicked ? 1 : 0,
          watch_duration: parseFloat(finalDuration.toFixed(2)),
          completed: 1,
          videoData: videoData // 传递视频数据，以便从问卷返回时恢复
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
  }, [videoData, onComplete])
  

  // 处理红心点击（可切换）
  const handleLikeClick = () => {
    const newValue = !likeClicked
    setLikeClicked(newValue)
    // 通知父组件状态变化
    if (onInteractionChange) {
      onInteractionChange('likeClicked', newValue)
    }
  }

  // 处理购物车点击（可切换）
  const handleCartClick = () => {
    const newValue = !cartClicked
    setCartClicked(newValue)
    // 通知父组件状态变化
    if (onInteractionChange) {
      onInteractionChange('cartClicked', newValue)
    }
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

