// src/utils/videos.js
import { supabase } from './supabase';
const BASE = import.meta.env.VITE_SUPABASE_URL;
const BUCKET = "study3-videos"; // <-- 改成你真实的 bucket 名

/**
 * 视频配置列表
 * video_id: 稳定的视频标识符（用于数据库记录）
 * video_url: Supabase Storage 中的视频 URL
 */
export const videos = [
  { video_id: "P306_C", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P306-C/index.m3u8` },
  { video_id: "P306_M", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P306-M/index.m3u8` },

  { video_id: "P312_C", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P312-C/index.m3u8` },
  { video_id: "P312_M", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P312-M/index.m3u8` },

  { video_id: "P318_C", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P318-C/index.m3u8` },
  { video_id: "P318_M", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P318-M/index.m3u8` },

  { video_id: "P324_C", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P324-C/index.m3u8` },
  { video_id: "P324_M", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P324-M/index.m3u8` },

  { video_id: "P326_C", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P326-C/index.m3u8` },
  { video_id: "P326_M", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P326-M/index.m3u8` },

  { video_id: "P332_C", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P332-C/index.m3u8` },
  { video_id: "P332_M", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P332-M/index.m3u8` },

  { video_id: "P337_C", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P337-C/index.m3u8` },
  { video_id: "P337_M", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P337-M/index.m3u8` },

  { video_id: "P344_C", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P344-C/index.m3u8` },
  { video_id: "P344_M", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P344-M/index.m3u8` },

  { video_id: "P347_C", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P347-C/index.m3u8` },
  { video_id: "P347_M", video_url: `${BASE}/storage/v1/object/public/${BUCKET}/hls/P347-M/index.m3u8` },
]


/**
 * 随机选择一个视频
 * @returns {Object} 包含 video_id 和 video_url 的视频对象
 */
export function getRandomVideo() {
  const idx = Math.floor(Math.random() * videos.length);
  return videos[idx];
}

/**
 * 基于 study3_data 中已完成样本数的“最少完成数优先”视频选择：
 * 1. 查询 completed = 1 的记录
 * 2. 按 video_id 统计完成次数
 * 3. 在当前完成次数最少的 video 中随机选择一个
 * 4. 出错时回退到完全随机
 */
export async function getLeastCompletedVideo() {
  try {
    const { data, error } = await supabase
      .from('study3_video_counts')
      .select('video_id, completed_count');

    if (error) {
      console.error('[getLeastCompletedVideo] view 查询出错:', error);
      return getRandomVideo();
    }

    const countMap = new Map();
    for (const row of data || []) {
      if (!row?.video_id) continue;
      countMap.set(row.video_id, Number(row.completed_count || 0));
    }

    let minCount = Infinity;
    const withCounts = videos.map(v => {
      const c = countMap.get(v.video_id) ?? 0;
      if (c < minCount) minCount = c;
      return { video: v, count: c };
    });

    const candidates = withCounts
      .filter(x => x.count === minCount)
      .map(x => x.video);

    if (!candidates.length) return getRandomVideo();

    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    console.log('[getLeastCompletedVideo] picked=', picked.video_id, 'minCount=', minCount);
    return picked;
  } catch (e) {
    console.error('[getLeastCompletedVideo] 未知错误:', e);
    return getRandomVideo();
  }
}