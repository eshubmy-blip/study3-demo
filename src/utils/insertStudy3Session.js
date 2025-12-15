// src/utils/insertStudy3Session.js
import { supabase } from "./supabase";

/**
 * 创建或更新实验会话记录
 * 用于统计参与人数和完成率
 * 
 * 注意：study3_sessions 表的主键是 user_id，每个 user_id 只能有一行 session
 * 使用 onConflict: 'user_id' 按主键进行 upsert，确保同一 user_id 的多次调用会更新同一行
 */
export async function insertOrUpdateStudy3Session(payload) {
  const { data, error } = await supabase
    .from("study3_sessions")
    .upsert([payload], {
      onConflict: 'user_id', // 按主键 upsert：user_id 是主键
      ignoreDuplicates: false // false 表示冲突时更新，而不是忽略
    })
    .select()
    .single();

  if (error) {
    console.error("[SESSION DONE ERROR]", error);
    throw error;
  }

  console.log("[SESSION DONE OK]", data);
  return data;
}

