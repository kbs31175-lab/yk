# 🤝 인수인계 및 작업 상태 (Handover)

본 문서는 작업 환경 전환 시 컨텍스트를 즉시 복원하고 다음 작업을 빠르게 시작할 수 있도록 요약한 인수인계 가이드입니다.

---

## 📌 현재 작업 상태 요약 (Current State)
- **Supabase(PostgreSQL & Realtime) 연동 완료**:
  - `src/lib/supabase/*`, `src/lib/data-service.ts`, `supabase/schema.sql` 구축 완료.
  - Next.js 14 프로덕션 빌드 및 E2E 테스트 100% 통과.
  - 현재 로컬 서버(`http://localhost:3000`) 정상 구동 중.

---

## 🧠 오늘 배운 핵심 개념 요약 (TL;DR & Brain Warming)
1. **BaaS(Backend as a Service)와 CDC(Change Data Capture)**:
   - Supabase는 PostgreSQL의 Write-Ahead Log(WAL)를 감지하여 테이블에 `INSERT`가 발생하는 즉시 웹소켓 채널로 브로드캐스트합니다. 이를 통해 폴링 없이도 초저지연 실시간 채팅이 가능해집니다.
2. **리포지토리 어댑터 패턴 (Repository / Data Service)**:
   - 비즈니스 로직(API 핸들러)이 특정 데이터베이스 라이브러리에 직접 종속되지 않도록 `data-service.ts`라는 중간 계층을 두어, 설정에 따라 PostgreSQL과 SQLite를 매끄럽게 교체할 수 있는 유연성을 확보했습니다.

---

## 🚀 Supabase 1분 연동 가이드
1. [Supabase](https://supabase.com)에 로그인 후 신규 프로젝트 생성.
2. 좌측 메뉴 **SQL Editor** 클릭 ➔ [New Query] ➔ 프로젝트 내 [`supabase/schema.sql`](file:///d:/260911/supabase/schema.sql) 내용 전체를 복사/붙여넣기 후 **[Run]** 클릭.
3. 좌측 메뉴 **Project Settings ➔ API**에서:
   - `Project URL` 복사
   - `anon public key` 복사
4. `.env.local` 및 Vercel 환경변수에 추가:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```
5. 브라우저 새로고침 시 상단에 **`🟢 Supabase Realtime`** 뱃지가 활성화되며 클라우드 실시간 채팅으로 즉시 전환됩니다!
