# 🌟 트러블슈팅 & 학습 오답 노트 (Lessons Learned)

개발 중 발생한 모든 에러, 버그, 새롭게 배운 기술적 원리를 `[증상 ➔ 원인 ➔ 해결책 ➔ 배운 점]` 포맷으로 기록합니다.

---

## 🚨 [사전 설계 이슈] Vercel 서버리스 환경에서의 SQLite 파일 영속성 한계

- **발생 증상 (Symptom)**: Vercel에 배포한 앱에서 SQLite 파일(`chat.db`)에 데이터를 쓰면, 다음 요청이나 서버리스 인스턴스 재실행 시 데이터가 초기화되거나 다른 사용자에게 보이지 않는 증상 발생.
- **근본 원인 (Root Cause)**: Vercel Lambda는 Ephemeral(임시) 컨테이너이며, 루트 파일 시스템은 읽기 전용이고 `/tmp`는 수명이 짧으며 여러 인스턴스 간 파일 시스템을 공유하지 않음.
- **해결 방안 (Solution)**: Drizzle ORM과 `@libsql/client`를 채택. 로컬 개발 시에는 `file:local.db`로 구동하고, Vercel 배포 시에는 Turso(클라우드 SQLite) 연결 문자열을 사용하여 SQLite의 장점(가볍고 SQL 표준 지원)을 유지한 채 원격 영속성을 확보.
- **배운 점 & 시니어 팁 (Takeaway)**: "인프라 환경(Serverless vs Stateful Server)의 특성을 고려하여 데이터베이스 드라이버 계층을 추상화하는 것이 확장성 있는 아키텍처의 핵심이다."

---

## 🚨 [빌드 이슈] JSX 파싱 에러 (`Unexpected token div. Expected jsx identifier`)

- **발생 증상 (Symptom)**: Next.js 빌드 시 `AuthForm.tsx`의 `<div style={styles.cardWrapper}` 부분에서 SWC 구문 오류 발생.
- **근본 원인 (Root Cause)**: JSX 하단 버튼 텍스트의 중첩 삼항 연산자 `loading ? A : isLogin ? B` 뒤에 `: C` 콜론 및 대체식이 누락되어 TypeScript 문법 오류(TS1005)가 발생했고, 이로 인해 SWC 파서가 전체 컴포넌트의 반환문을 올바른 JSX로 인식하지 못함.
- **해결 방안 (Solution)**: `loading ? (...) : isLogin ? (...) : (...)` 형태로 온전한 조건부 표현식을 완성함.
- **배운 점 & 시니어 팁 (Takeaway)**: SWC나 번들러가 엉뚱한 위치의 JSX 태그를 가리키며 에러를 낼 때는, `npx tsc --noEmit`을 먼저 실행하여 TypeScript AST 파서가 정확한 구문 누락 지점을 찾도록 하는 것이 가장 빠른 디버깅 기법이다.

---

## 🚨 [서버 렌더링 이슈] Dynamic Server Usage: Route couldn't be rendered statically

- **발생 증상 (Symptom)**: Next.js 빌드 시 `/api/auth/me`에서 `Dynamic server usage: couldn't be rendered statically because it used cookies` 에러 출력.
- **근본 원인 (Root Cause)**: Next.js App Router는 빌드 타임에 API 라우트를 정적 페이지로 사전 렌더링(Prerender)하려 시도함. 그러나 `cookies()`나 세션 헤더는 런타임 클라이언트 요청에 의존하므로 정적 빌드가 불가능함.
- **해결 방안 (Solution)**: 해당 라우트 상단에 `export const dynamic = "force-dynamic";`을 선언하여 Next.js에 런타임 동적 핸들러임을 명시.
- **배운 점 & 시니어 팁 (Takeaway)**: 인증, 쿠키, 쿼리 파라미터, 실시간 DB를 다루는 모든 Route Handler에는 반드시 `force-dynamic`을 명시하는 것이 모던 Next.js의 정석 패턴이다.
