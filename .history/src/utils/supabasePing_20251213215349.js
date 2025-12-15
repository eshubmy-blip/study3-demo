// src/utils/supabasePing.js
import { supabase } from "./supabase";

export async function supabasePing() {
  const { data, error } = await supabase
    .from("study3_data")
    .select("id")
    .limit(1);

  if (error) {
    console.error("[SUPABASE PING ERROR]", error);
    return { ok: false, error };
  }

  console.log("[SUPABASE PING OK]", data);
  return { ok: true, data };
}
