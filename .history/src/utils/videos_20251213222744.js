// src/utils/videos.js
const BASE = import.meta.env.VITE_SUPABASE_URL;
const BUCKET = "study3-videos"; // <-- 改成你真实的 bucket 名

export const videos = [
  { id: 1, url: `${BASE}/storage/v1/object/public/${BUCKET}/P306-C.mov` },
  { id: 2, url: `${BASE}/storage/v1/object/public/${BUCKET}/P306-M.mov` },
];

export function getRandomVideo() {
  const idx = Math.floor(Math.random() * videos.length);
  return videos[idx];
}
