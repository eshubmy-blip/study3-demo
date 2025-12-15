// src/utils/insertStudy3Row.js
import { supabase } from "./supabase";

export async function insertStudy3Row(payload) {
  const { data, error } = await supabase
    .from("study3_data")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("[SUPABASE INSERT ERROR]", error);
    throw error;
  }

  console.log("[SUPABASE INSERT OK]", data);
  return data;
}
