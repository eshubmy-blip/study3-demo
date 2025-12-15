/**
 * 视频配置
 * 后续替换为Supabase Storage的真实链接
 */

// 生成18个占位视频URL（当前使用示例视频）
export const VIDEO_LIST = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  // 占位URL：后续替换为Supabase Storage链接
  url: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
  // 示例：url: `https://your-project.supabase.co/storage/v1/object/public/videos/video_${i + 1}.mp4`,
  duration: 20 + Math.random() * 5, // 20-25秒（示例）
}));

/**
 * 随机选择一个视频
 */
export function getRandomVideo() {
  const randomIndex = Math.floor(Math.random() * VIDEO_LIST.length);
  return VIDEO_LIST[randomIndex];
}

