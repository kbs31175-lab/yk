import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, getSupabaseUrl, getSupabaseAnonKey } from "./config";

let clientInstance: SupabaseClient | null = null;

/**
 * 🌐 [브라우저용 Supabase 클라이언트]
 * Supabase Realtime 웹소켓 채널 구독 및 실시간 메시지 수신을 담당합니다.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  return clientInstance;
}
