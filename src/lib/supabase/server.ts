import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, getSupabaseUrl, getSupabaseServiceRoleKey } from "./config";

/**
 * 🖥️ [서버용 Supabase 클라이언트]
 * API Route Handler에서 PostgreSQL 쿼리를 수행할 때 사용합니다.
 */
export function getServerSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
