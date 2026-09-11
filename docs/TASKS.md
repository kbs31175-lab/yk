# 📋 작업 및 학습 목표 관리 (Tasks & Learning Objectives)

본 문서는 프로젝트의 세부 진행 상황과 각 단계별 핵심 학습 목표를 관리합니다.

---

## 🏃 Doing (현재 진행 중)
- [ ] 전체 완료 및 최종 멘토링 브리핑 제공

---

## ⏳ Todo (예정된 작업)
- [ ] (사용자 배포 단계) Vercel 대시보드에서 Turso SQLite 연결 환경변수 등록 및 프로덕션 배포

---

## ✅ Done (완료된 작업)
- [x] **프로젝트 자아 정립 및 아키텍처 수립**: 루트 `README.md` 및 `docs/CONTEXT.md` 작성
  - 🎯 **학습 목표**: Vercel 서버리스 환경과 SQLite 파일 시스템 제약의 상관관계 및 Turso/libSQL 해결책 도출
- [x] **Next.js 14 및 Drizzle ORM 환경 셋업**: `package.json`, `tsconfig.json`, `next.config.mjs` 구성 및 의존성 설치
  - 🎯 **학습 목표**: Next.js App Router와 Drizzle Kit의 설정 구조 및 SQLite 드라이버 통합 방식 이해
- [x] **SQLite 데이터베이스 스키마 및 마이그레이션**: `users`, `rooms`, `messages` 테이블 모델링
  - 🎯 **학습 목표**: 1:N 관계형 데이터베이스 스키마 설계 및 외래키(Foreign Key) 캐스케이드 정책 수립
- [x] **인증 API 및 타임스탬프 로직 구현**: 회원가입, 로그인(`last_login_at` 갱신), 로그아웃, 현재 세션 조회
  - 🎯 **학습 목표**: `bcryptjs` 단방향 해싱과 `jose` JWT 토큰을 활용한 HTTP-Only 쿠키 세션 구현
- [x] **채팅방 및 메시지 API 구현**: 방 생성/목록 조회, 메시지 송수신 API
  - 🎯 **학습 목표**: Drizzle ORM의 `leftJoin`과 정렬(`orderBy`) 쿼리를 통한 복합 데이터 패칭 패턴 학습
- [x] **프리미엄 글래스모피즘 디자인 시스템 구축**: `globals.css` 디자인 토큰 및 반응형 챗 UI
  - 🎯 **학습 목표**: Vanilla CSS 변수(Custom Properties)를 활용한 현대적 다크 테마 및 글래스모피즘 스타일링
- [x] **실시간 인터랙션 및 프론트엔드 통합**: 채팅방 뷰, 메시지 오토 스크롤, 주기적 데이터 동기화
  - 🎯 **학습 목표**: React 상태 관리와 클라이언트 사이드 주기적 갱신(Polling)을 통한 실시간 UX 체득
- [x] **E2E 및 빌드 검증**: 회원가입/로그인/타임스탬프/채팅방/메시지 전체 플로우 100% 통과
  - 🎯 **학습 목표**: 실제 프로덕션 서버 구동 환경에서의 엔드투엔드 세션 유지 및 메시징 동작 검증
