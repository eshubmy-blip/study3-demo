// src/utils/insertStudy3Session.js
import { supabase } from "./supabase";

/**
 * 创建或更新实验会话记录
 * 以 (user_id, video_id) 作为唯一定位（复合唯一约束）
 */
export async function insertOrUpdateStudy3Session(payload) {
  const { data, error } = await supabase
    .from("study3_sessions")
    .upsert([payload], {
      onConflict: "user_id,video_id", // ✅ 复合键 upsert，避免覆盖不同 video_id
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error("[SESSION UPSERT ERROR]", error);
    throw error;
  }

  console.log("[SESSION UPSERT OK]", data);
  return data;
}
