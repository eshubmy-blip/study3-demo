// src/utils/insertStudy3Row.js
import { supabase } from "./supabase";

export async function insertStudy3Row(payload) {
  const { data, error } = await supabase
    .from("study3_data")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("[STUDY3_DATA INSERT ERROR]", error);
    throw error;
  }

  if (!data) {
    console.error("[STUDY3_DATA INSERT ERROR] Data is null or empty");
    throw new Error("Insert returned no data");
  }

  console.log("[STUDY3_DATA INSERT OK]", data);
  return data;
}
