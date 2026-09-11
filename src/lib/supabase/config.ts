/**
 * ⚙️ [Supabase 설정 및 활성화 여부 확인]
 * 환경변수 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되어 있는지 검사합니다.
 */
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      anonKey &&
      url.startsWith("https://") &&
      anonKey.length > 20 &&
      !url.includes("your-supabase-project-id")
  );
};

export const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const getSupabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const getSupabaseServiceRoleKey = () =>
  process.env.SUPABASE_SERVICE_ROLE_KEY || getSupabaseAnonKey();
