# 🚀 Vercel-Ready SQLite Fullstack Chat Application

> **"로컬에서는 가벼운 파일 DB, Vercel 클라우드에서는 분산 서버리스 DB로 확장되는 모던 채팅 앱"**

본 프로젝트는 **Next.js (App Router)**와 **Drizzle ORM + libSQL (SQLite)**을 기반으로 제작된 풀스택 실시간 채팅 웹 애플리케이션입니다.

---

## 🎯 이 프로젝트의 학습 목표 (Learning Objectives)

1. **서버리스(Serverless)와 로컬 파일 DB의 딜레마 극복**: Vercel의 Ephemeral 파일 시스템 제약을 이해하고, libSQL 드라이버를 통해 로컬 SQLite 파일과 원격 분산 SQLite(Turso)를 단일 코드베이스로 유연하게 스위칭하는 아키텍처를 학습합니다.
2. **단방향 암호화와 세션 보안**: `bcryptjs`를 통한 패스워드 솔팅(Salting) 및 해싱과, HTTP-Only 쿠키 세션을 활용한 안전한 인증 체계를 구축합니다.
3. **상태 추적 및 관계형 데이터 모델링**: 사용자의 로그인 타임스탬프(`last_login_at`) 갱신 및 1:N 관계(유저-채팅방-메시지)를 Drizzle ORM으로 타입 세이프하게 설계합니다.
4. **프리미엄 UI/UX 엔지니어링**: 외부 CSS 프레임워크 없이 순수 Vanilla CSS로 글래스모피즘(Glassmorphism), 마이크로 인터랙션, 반응형 레이아웃을 구현합니다.

---

## 🛠 기술 스택 및 선정 이유 (Tech Stack & ADR)

| 기술 | 역할 | 선정 이유 (Why this tech?) |
| :--- | :--- | :--- |
| **Next.js 14+ (App Router)** | Fullstack Framework | 프론트엔드와 백엔드 API(Route Handlers)를 일원화하고 Vercel에 최적화된 배포 파이프라인 제공 |
| **Supabase (Postgres & Realtime)** | Cloud Database & WebSocket | Vercel의 파일 휘발성 제약을 완벽히 극복하며, Postgres CDC 기반 웹소켓 실시간 브로드캐스트 제공 |
| **Drizzle ORM & libSQL** | Local Fallback DB | 로컬 환경에서 가볍고 빠르게 오프라인 개발이 가능한 하이브리드 지원 |
| **Jose (JWT)** | Edge-ready Session | Vercel Edge 런타임 및 Node.js 런타임 모두에서 가볍고 안전하게 구동되는 웹 표준 암호화 라이브러리 |
| **Vanilla CSS** | Styling System | 런타임 오버헤드가 없으며, 고유한 디자인 토큰과 글래스모피즘 시각 효과를 정밀하게 제어 |

---

## ⚡ Supabase 1분 연동 방법
1. [Supabase](https://supabase.com) 프로젝트 생성
2. **SQL Editor**에 [`supabase/schema.sql`](./supabase/schema.sql) 파일 내용을 붙여넣고 **Run** 실행
3. `.env.local`에 Supabase URL과 Key 입력:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. 앱 실행 시 상단에 **`🟢 Supabase Realtime`** 뱃지가 뜨며 실시간 웹소켓 채팅이 시작됩니다!

---

## 🚀 빠른 시작 (Quick Start)

### 1. 의존성 설치
```bash
npm install
```

### 2. 데이터베이스 초기화 (마이그레이션)
```bash
npm run db:push
```
*로컬 환경에서는 루트 경로에 `local.db` SQLite 파일이 자동 생성됩니다.*

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000` 접속

---

## 🌐 Vercel 배포 가이드
1. [Turso](https://turso.tech)에서 무료 SQLite 데이터베이스 생성
2. Vercel 프로젝트 환경변수에 다음 값 추가:
   - `TURSO_DATABASE_URL`: `libsql://your-db-name.turso.io`
   - `TURSO_AUTH_TOKEN`: `your-turso-auth-token`
   - `JWT_SECRET`: `your-random-secret-key`
3. Git Push를 통해 Vercel에 자동 배포 완료!
