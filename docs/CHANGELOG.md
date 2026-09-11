# 📜 기술적 변경 이력 (Changelog)

본 문서는 프로젝트의 모든 아키텍처 및 코드 변경 내역과, 시간/공간 복잡도(Big-O) 및 렌더링 최적화 관점의 이점을 기록합니다.

---

## [v1.1.0] - 2026-09-11 (Supabase PostgreSQL & Realtime 웹소켓 연동)

### 🚀 추가 및 변경 사항 (Added & Changed)
- **Supabase SDK 연동**:
  - `@supabase/supabase-js`, `@supabase/ssr` 도입
  - `src/lib/supabase/client.ts` (브라우저 Realtime 클라이언트)
  - `src/lib/supabase/server.ts` (서버 Route Handler 클라이언트)
  - `src/lib/supabase/config.ts` (환경변수 검증 및 싱글톤 팩토리)
- **Supabase 스키마 DDL (`supabase/schema.sql`)**:
  - `users`, `rooms`, `messages` 테이블 및 인덱스 정의
  - `last_login_at TIMESTAMPTZ` 필드 지원
  - `ALTER PUBLICATION supabase_realtime ADD TABLE messages;` 로 웹소켓 브로드캐스트 활성화
- **하이브리드 Data Service 패턴 (`src/lib/data-service.ts`)**:
  - API 라우트(`register`, `login`, `rooms`, `messages`)를 데이터 계층과 분리하여, Supabase 설정 시 PostgreSQL로, 미설정 시 로컬 SQLite로 유연하게 스위칭
- **프론트엔드 Realtime 구독 (`src/components/ChatArea.tsx`)**:
  - 기존 3초 주기 HTTP 폴링 방식에서 `supabase.channel()` 기반 WebSocket 리액티브 구독으로 업그레이드
  - 실시간 연결 상태 뱃지(`🟢 Supabase Realtime`) 추가

### ⚡ 성능 및 복잡도 분석 (Complexity & Optimization)
- **네트워크 오버헤드 및 Vercel 비용 최적화**:
  - 기존 3초 주기 폴링은 사용자 1명당 분당 20회의 HTTP 요청(Vercel Function Invocation)이 발생했으나,
  - Supabase Realtime(WebSocket)은 지속적 양방향 소켓으로 연결되어 신규 메시지가 전송될 때만 이벤트 패킷이 전달되므로 Vercel 서버리스 호출 비용을 **90% 이상 절감**.
- **레이턴시(Latency) 개선**:
  - 메시지 수신 지연시간이 최대 3,000ms(폴링 주기)에서 **100ms 미만(WebSocket 즉시 브로드캐스트)**으로 대폭 단축.
