import { useState, useEffect, useRef } from 'react'
import './VideoExperiment.css'
import Bilingual from './Bilingual'
import { TEXT } from '../i18n/text'

/**
 * 视频实验页面组件
 * 功能：
 * 1. 播放指定视频（20-25秒）
 * 2. 全屏竖屏播放，禁止快进
 * 3. 右侧交互按钮（红心、购物车）
 * 4. 记录行为数据（观看时长、点击行为等）
 */
export default function VideoExperiment({ 
  onComplete, 
  initialLikeState = false, 
  initialCartState = false,
  onInteractionChange,
  videoData // 视频数据由父组件传入，不再在组件内选择
}) {
  const [likeClicked, setLikeClicked] = useState(initialLikeState)
  const [cartClicked, setCartClicked] = useState(initialCartState)
  const [watchDuration, setWatchDuration] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoErrorKey, setVideoErrorKey] = useState(null) // 使用 key 映射到文案
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [needsUserUnmute, setNeedsUserUnmute] = useState(false)
  
  const videoRef = useRef(null)
  const durationIntervalRef = useRef(null)
  const loadingTimeoutRef = useRef(null)
  const hasStartedPlayingRef = useRef(false)
  // 使用 ref 存储最新的交互状态，避免在 useEffect 依赖中频繁重新设置事件监听器
  const interactionStateRef = useRef({ likeClicked, cartClicked })
  // 保存最新的 onComplete 引用，避免作为依赖导致初始化 effect 重跑
  const onCompleteRef = useRef(onComplete)
  // 防止双触发（pointer + click）
  const likeClickHandledRef = useRef(false)
  const cartClickHandledRef = useRef(false)
  // 记录是否已经自动尝试过取消静音
  const triedAutoUnmuteRef = useRef(false)

  // 根据 HLS 播放地址推导封面图 poster（与 index.m3u8 同级）
  const posterUrl = videoData?.video_url
    ? videoData.video_url.split('?')[0].replace('index.m3u8', 'poster.jpg')
    : undefined

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

  // 同步最新的 onComplete 引用，避免 useEffect 依赖它
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // 统一的开启有声播放逻辑
  const tryEnableSound = async ({ fromUserGesture }) => {
    const video = videoRef.current
    if (!video) return

    try {
      video.muted = false
      video.volume = 1
      setIsMuted(false)
      await video.play()
      setNeedsUserUnmute(false)
    } catch (err) {
      console.error('尝试开启有声播放失败:', err)
      // 仅在非用户手势的自动尝试失败时，回退为静音并提示需要用户手动开启
      if (!fromUserGesture) {
        video.muted = true
        video.volume = 0
        setIsMuted(true)
        setNeedsUserUnmute(true)
      }
    }
  }

  // 视频加载完成后自动播放
  // 注意：此 effect 不依赖会频繁变化的状态（如 likeClicked, cartClicked）
  useEffect(() => {
    if (!videoRef.current || !videoData) return
    const video = videoRef.current
    
    setIsVideoLoading(true)
    setVideoErrorKey(null)
    
    console.log('开始加载视频:', videoData.video_id, videoData.video_url)
    console.log('视频 readyState:', video.readyState)
    
    // 初始静音，配合 <video autoPlay muted />，避免 iOS 因非静音自动播放被拦截
    video.muted = true
    setIsMuted(true)
    hasStartedPlayingRef.current = false
    // 每次切换视频时，重置自动静音相关状态
    setNeedsUserUnmute(false)
    triedAutoUnmuteRef.current = false

    // 统一的“结束 loading”工具函数
    const stopLoading = () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
      setIsVideoLoading(false)
    }
    
    // 设置超时处理（30秒）
    // 先清除之前的 timeout（如果存在）
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
    loadingTimeoutRef.current = setTimeout(() => {
      setIsVideoLoading(prev => {
        if (prev) {
          console.warn('视频加载超时')
          setVideoErrorKey('timeout')
          return false
        }
        return prev
      })
    }, 30000)
    
    // 视频加载开始
    const handleLoadStart = () => {
      console.log('视频开始加载...', videoData.video_id, videoData.video_url)
      setIsVideoLoading(true)
    }
    
    // 视频加载进度
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const duration = video.duration
        if (duration > 0) {
          const percent = (bufferedEnd / duration * 100).toFixed(1)
          console.log(`视频加载进度: ${percent}%`)
        }
      }
    }
    
    // 视频可以播放：这里只负责结束 loading
      const handleCanPlay = () => {
      console.log('视频可以播放', videoData.video_id, videoData.video_url)
      stopLoading()
    }
    
    // 视频可以开始播放（更早的事件）
    const handleCanPlayThrough = () => {
      console.log('视频可以完整播放')
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
    
    // 视频加载错误
    const handleError = (e) => {
      console.error('视频加载错误:', e)
      console.error('视频 ID:', videoData.video_id)
      console.error('视频 URL:', videoData.video_url)
      setIsVideoLoading(false)
      const error = video.error
      if (error) {
        let errorKey = 'failed'
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            errorKey = 'aborted'
            break
          case error.MEDIA_ERR_NETWORK:
            errorKey = 'network'
            break
          case error.MEDIA_ERR_DECODE:
            errorKey = 'decode'
            break
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorKey = 'notSupported'
            break
          default:
            errorKey = 'failed'
        }
        setVideoErrorKey(errorKey)
      }
    }
    
    // 视频加载完成
    const handleLoadedData = () => {
      console.log('视频数据加载完成')
      stopLoading()
    }
    
    // 视频元数据加载完成（这里只做日志，不结束 loading）
    const handleLoadedMetadata = () => {
      console.log('视频元数据加载完成，时长:', video.duration, '秒')
    }

    // 视频开始播放：最可靠的结束 loading 时机
    const handlePlaying = () => {
      console.log('视频开始播放 playing')
      hasStartedPlayingRef.current = true
      stopLoading()

      // 尝试在首次播放时，根据 sessionStorage 自动开启有声播放
      try {
        if (
          !triedAutoUnmuteRef.current &&
          typeof sessionStorage !== 'undefined' &&
          sessionStorage.getItem('study3_sound_unlocked') === '1'
        ) {
          triedAutoUnmuteRef.current = true
          tryEnableSound({ fromUserGesture: false })
        }
      } catch (e) {
        console.warn('自动尝试开启声音时出现异常:', e)
      }
    }

    // 视频缓冲：仅在尚未开始播放前显示 loading 遮罩
    const handleWaiting = () => {
      console.log('视频缓冲中 waiting')
      if (!hasStartedPlayingRef.current) {
        setIsVideoLoading(true)
      }
    }

    // 统一绑定事件监听
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('progress', handleProgress)
    // 移除 once:true，避免部分移动端只触发一次后无法再次响应
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('canplaythrough', handleCanPlayThrough)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('error', handleError)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('waiting', handleWaiting)

      const handlePlay = () => {
        setIsPlaying(true)
  
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = setInterval(() => {
        setWatchDuration(video.currentTime || 0)
      }, 100)
      }

      const handleEnded = () => {
        setIsCompleted(true)
      
        const finalDuration = Number.isFinite(video.currentTime) ? video.currentTime : 0
        setWatchDuration(finalDuration)
      
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current)
          durationIntervalRef.current = null
        }
      
        setTimeout(() => {
          const currentState = interactionStateRef.current
          if (onCompleteRef.current) {
            onCompleteRef.current({
              video_id: videoData.video_id,
              like: currentState.likeClicked ? 1 : 0,
              cart: currentState.cartClicked ? 1 : 0,
              watch_duration: parseFloat(finalDuration.toFixed(2)),
              completed: 1
            })
          }
        }, 500)
      }

    video.addEventListener('play', handlePlay)
    video.addEventListener('ended', handleEnded)

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('progress', handleProgress)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('canplaythrough', handleCanPlayThrough)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('error', handleError)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('ended', handleEnded)
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
    }
  }, [videoData]) // 只在视频切换时重新初始化，避免 onComplete 变化触发
  

  // 处理红心点击（可切换）- 核心逻辑
  const handleLikeToggle = () => {
    // 防止重复触发
    if (likeClickHandledRef.current) return
    likeClickHandledRef.current = true
    
    const newValue = !likeClicked
    setLikeClicked(newValue)
    // 通知父组件状态变化
    if (onInteractionChange) {
      onInteractionChange('likeClicked', newValue)
    }
    
    // 短暂延迟后重置标志，允许下次点击
    setTimeout(() => {
      likeClickHandledRef.current = false
    }, 100)
  }

  // 红心按钮 - Pointer 事件（移动端优先）
  const handleLikePointerUp = (e) => {
    e.preventDefault()
    e.stopPropagation()
    handleLikeToggle()
  }

  // 红心按钮 - Touch 事件（iOS 兼容）
  const handleLikeTouchEnd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    handleLikeToggle()
  }

  // 红心按钮 - Click 事件（桌面端兜底）
  const handleLikeClick = (e) => {
    // 如果已经被 pointer/touch 处理过，跳过
    if (likeClickHandledRef.current) {
      e.preventDefault()
      return
    }
    handleLikeToggle()
  }

  // 处理购物车点击（可切换）- 核心逻辑
  const handleCartToggle = () => {
    // 防止重复触发
    if (cartClickHandledRef.current) return
    cartClickHandledRef.current = true
    
    const newValue = !cartClicked
    setCartClicked(newValue)
    // 通知父组件状态变化
    if (onInteractionChange) {
      onInteractionChange('cartClicked', newValue)
    }
    
    // 短暂延迟后重置标志，允许下次点击
    setTimeout(() => {
      cartClickHandledRef.current = false
    }, 100)
  }

  // 购物车按钮 - Pointer 事件（移动端优先）
  const handleCartPointerUp = (e) => {
    e.preventDefault()
    e.stopPropagation()
    handleCartToggle()
  }

  // 购物车按钮 - Touch 事件（iOS 兼容）
  const handleCartTouchEnd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    handleCartToggle()
  }

  // 购物车按钮 - Click 事件（桌面端兜底）
  const handleCartClick = (e) => {
    // 如果已经被 pointer/touch 处理过，跳过
    if (cartClickHandledRef.current) {
      e.preventDefault()
      return
    }
    handleCartToggle()
  }

  if (!videoData) {
    return (
      <div className="video-experiment-loading">
        <div className="loading-spinner">
          <Bilingual
            en={TEXT.video.loading.en}
            zh={TEXT.video.loading.zh}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="video-experiment-container">
      <div className="video-wrapper">
        {isVideoLoading && (
          <div className="video-loading-overlay" style={{ pointerEvents: 'none' }}>
            <div className="video-overlay-content">
              <div className="loading-spinner">
                <Bilingual
                  en={TEXT.video.loading.en}
                  zh={TEXT.video.loading.zh}
                />
              </div>
              <div className="video-overlay-hint">
                <Bilingual
                  en={TEXT.video.hint.en}
                  zh={TEXT.video.hint.zh}
                />
              </div>
            </div>
          </div>
        )}
        {videoErrorKey && (
          <div className="video-error-overlay" style={{ pointerEvents: 'auto' }}>
            <div className="video-overlay-content">
              <div className="error-message">
                <Bilingual
                  en={TEXT.video[videoErrorKey].en}
                  zh={TEXT.video[videoErrorKey].zh}
                />
              </div>
              <button 
                className="retry-button"
                onClick={() => {
                  setVideoErrorKey(null)
                  setIsVideoLoading(true)
                  setIsPlaying(false)
                  setIsCompleted(false)
                  setWatchDuration(0)
                
                  const video = videoRef.current
                  if (!video) return
                
                  // 1) 彻底断开旧 source（iOS/HLS 很关键）
                  try { video.pause() } catch {}
                  try { video.removeAttribute('src') } catch {}
                  try { video.src = '' } catch {}
                  try { video.load() } catch {}
                
                  // 2) cache-bust
                  const baseUrl = (videoData.video_url || '').split('?')[0]
                  const bustedUrl = `${baseUrl}?cb=${Date.now()}`
                
                  // 3) 重新挂载 + 重新加载 + 尝试播放（重新静音，避免自动播放被拦）
                  video.src = bustedUrl
                  video.muted = true
                  video.load()

                  try { video.currentTime = 0 } catch {}

                  video.play().catch(() => {
                    // iOS 可能仍要求用户点一下视频
                  })
                }}
              >
                <Bilingual
                  en={TEXT.video.retry.en}
                  zh={TEXT.video.retry.zh}
                />
              </button>
            </div>
          </div>
        )}
        <video
          ref={videoRef}
          src={videoData.video_url}
          className="experiment-video"
          playsInline
          webkit-playsinline="true"
          x5-playsinline="true"
          controls={false}
          preload="metadata"
          autoPlay
          muted={isMuted}
          poster={posterUrl}
          style={{ cursor: isPlaying ? 'default' : 'pointer' }}
        />

        {/* 需要用户手动开启声音时的提示浮层 */}
        {needsUserUnmute && !videoErrorKey && (
          <div
            className="video-sound-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto'
            }}
          >
            <button
              type="button"
              className="sound-button"
              onClick={() => tryEnableSound({ fromUserGesture: true })}
              style={{
                padding: '10px 18px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                color: '#fff',
                fontSize: '14px'
              }}
            >
              <Bilingual
                en={TEXT.video.enableSound.en}
                zh={TEXT.video.enableSound.zh}
              />
            </button>
          </div>
        )}

        
        {/* 交互按钮区域 */}
        <div className="interaction-buttons">
          <button
            className={`interaction-btn like-btn ${likeClicked ? 'clicked' : ''}`}
            onPointerUp={handleLikePointerUp}
            onTouchEnd={handleLikeTouchEnd}
            onClick={handleLikeClick}
            aria-label={likeClicked ? '取消点赞' : '点赞'}
            type="button"
          >
            <span className="btn-icon">❤️</span>
            <span className="btn-label">
              <Bilingual
                en={likeClicked ? TEXT.video.liked.en : TEXT.video.like.en}
                zh={likeClicked ? TEXT.video.liked.zh : TEXT.video.like.zh}
              />
            </span>
          </button>
          
          <button
            className={`interaction-btn cart-btn ${cartClicked ? 'clicked' : ''}`}
            onPointerUp={handleCartPointerUp}
            onTouchEnd={handleCartTouchEnd}
            onClick={handleCartClick}
            aria-label={cartClicked ? '移出购物车' : '加入购物车'}
            type="button"
          >
            <span className="btn-icon">🛒</span>
            <span className="btn-label">
              <Bilingual
                en={cartClicked ? TEXT.video.added.en : TEXT.video.addToCart.en}
                zh={cartClicked ? TEXT.video.added.zh : TEXT.video.addToCart.zh}
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

