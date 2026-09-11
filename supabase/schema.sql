-- ==========================================================
-- 🚀 Supabase (PostgreSQL) 스키마 및 Realtime 활성화 스크립트
-- Supabase 대시보드 -> SQL Editor에 붙여넣고 [Run]을 누르세요!
-- ==========================================================

-- 1. 유저 테이블 (users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nickname TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- 🌟 핵심 요구사항: 로그인 타임스탬프 기록 필드
  last_login_at TIMESTAMPTZ
);

-- 2. 채팅방 테이블 (rooms)
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 메시지 테이블 (messages)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. 성능 최적화 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_messages_room_created 
  ON public.messages(room_id, created_at);

-- 5. 🌟 [핵심] Supabase Realtime 활성화 (Postgres CDC -> WebSockets)
-- messages 테이블에 변경사항(INSERT)이 생기면 연결된 클라이언트에 즉시 웹소켓으로 브로드캐스트합니다.
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 6. Row Level Security (RLS) 및 접근 정책 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- API 및 Anon Key에서 CRUD를 허용하도록 기본 정책 부여
CREATE POLICY "Allow all access to users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to rooms" ON public.rooms
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to messages" ON public.messages
  FOR ALL USING (true) WITH CHECK (true);
