# 📋 작업 및 학습 목표 관리 (Tasks & Learning Objectives)

본 문서는 프로젝트의 세부 진행 상황과 각 단계별 핵심 학습 목표를 관리합니다.

---

## 🏃 Doing (현재 진행 중)
- 없음 (모든 구현, Supabase 연동 및 검증 완료)

---

## ⏳ Todo (사용자 설정 가이드)
- [ ] Supabase 프로젝트 대시보드의 SQL Editor에 `supabase/schema.sql` 붙여넣고 [Run] 실행
- [ ] Vercel 및 `.env.local`에 Supabase `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 입력

---

## ✅ Done (완료된 작업)
- [x] **Supabase (PostgreSQL & Realtime) 연동 구현**:
  - `@supabase/supabase-js`, `@supabase/ssr` 패키지 설치
  - 브라우저 및 서버용 Supabase 클라이언트 (`src/lib/supabase/*`) 모듈화
  - `supabase/schema.sql` DDL 및 Realtime Publication 스크립트 작성
  - 🎯 **학습 목표**: BaaS(Backend as a Service) 아키텍처와 Postgres CDC(Change Data Capture) 기반 웹소켓 통신 원리 이해
- [x] **하이브리드 Data Service 레포지토리 패턴 도입**:
  - `src/lib/data-service.ts`를 통해 Supabase와 로컬 SQLite를 조건부로 스위칭
  - 🎯 **학습 목표**: OCP(개방-폐쇄 원칙)와 단일 책임 원칙(SRP)을 만족하는 데이터 접근 계층 추상화
- [x] **프론트엔드 Supabase Realtime 구독 적용**:
  - `ChatArea.tsx`에 `supabase.channel()` 실시간 구독 및 `🟢 Supabase Realtime` 뱃지 적용
  - 🎯 **학습 목표**: WebSocket 채널 라이프사이클 및 실시간 리액티브 UI 설계
- [x] **Next.js 14 프로덕션 빌드 및 E2E 테스트 100% 통과**:
  - 회원가입, 로그인 타임스탬프(`last_login_at`) 기록, 방 생성, 메시지 전송 및 조회 검증 완료
