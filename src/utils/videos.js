// src/utils/videos.js
const BASE = import.meta.env.VITE_SUPABASE_URL;
const BUCKET = "study3-videos"; // <-- 改成你真实的 bucket 名

/**
 * 视频配置列表
 * video_id: 稳定的视频标识符（用于数据库记录）
 * video_url: Supabase Storage 中的视频 URL
 */
export const videos = [
  {
    video_id: "P306_C",
    video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P306-C/index.m3u8`,
  },
  {
    video_id: "P306_M",
    video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P306-M/index.m3u8`,
  },{
    video_id: "P312_C",
    video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P312-C/index.m3u8`,
  },
  {
    video_id: "P318_C",
    video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P318-M/index.m3u8`,
  },
];

/**
 * 随机选择一个视频
 * @returns {Object} 包含 video_id 和 video_url 的视频对象
 */
export function getRandomVideo() {
  const idx = Math.floor(Math.random() * videos.length);
  return videos[idx];
}
