# 📜 기술적 변경 이력 (Changelog)

본 문서는 프로젝트의 모든 아키텍처 및 코드 변경 내역과, 시간/공간 복잡도(Big-O) 및 렌더링 최적화 관점의 이점을 기록합니다.

---

## [v1.0.0] - 2026-09-11 (전체 풀스택 챗 구현 및 E2E 검증 완료)

### 🚀 추가 및 변경 사항 (Added & Changed)
- **데이터 모델링 (`src/db/schema.ts`)**:
  - `users`: `id`, `username`, `password_hash`, `nickname`, `avatar_color`, `created_at`, `last_login_at` (로그인 타임스탬프 필드)
  - `rooms`: `id`, `name`, `description`, `created_by`, `created_at`
  - `messages`: `id`, `room_id`, `user_id`, `content`, `created_at`
  - 인덱스 추가: `idx_messages_room_created (room_id, created_at)`
- **인증 및 보안 시스템 (`src/lib/auth.ts`, `/api/auth/*`)**:
  - `bcryptjs`를 통한 솔트(Salt) 10라운드 패스워드 해싱
  - `jose`를 활용한 표준 HS256 웹 암호화 JWT 세션 토큰 생성
  - HTTP-Only 쿠키 세션(`auth_session_token`, Max-Age 7일, SameSite Lax) 적용
  - 로그인 시 `users.last_login_at` 현재 시각(ISO 8601) 자동 갱신
- **채팅 API 및 UI 컴포넌트**:
  - `/api/rooms`: 방 목록 조회(GET) 및 신규 방 생성(POST)
  - `/api/rooms/[roomId]/messages`: 방별 메시지 시간순 조회(GET) 및 실시간 메시지 발송(POST)
  - `AuthForm.tsx`: 로그인/회원가입 동적 전환 탭 및 인터랙티브 피드백
  - `ChatSidebar.tsx`: 로그인 타임스탬프 뱃지(`Clock` 아이콘 및 상대 시간), 채팅 채널 목록, 새 방 개설 모달 트리거
  - `ChatArea.tsx`: 말풍선 그라데이션, 작성자 아바타, 3초 자동 동기화(Polling), Enter 전송 지원
  - `globals.css`: 다크 글래스모피즘(`backdrop-filter: blur(16px)`), 커스텀 스크롤바, 발광 애니메이션

### ⚡ 성능 및 복잡도 분석 (Complexity & Optimization)
- **시간 복잡도 (Time Complexity)**:
  - 사용자 인증 및 중복 체크: $O(1)$ ~ $O(\log N)$ (인덱스 탐색)
  - 채팅방 메시지 쿼리: 복합 인덱스 `(room_id, created_at)` 적용으로 특정 방의 최근 메시지 조회가 테이블 풀 스캔($O(N)$)에서 인덱스 레인지 스캔($O(K)$)으로 대폭 최적화.
- **렌더링 최적화**:
  - 컴포넌트 분리 (`ChatSidebar`, `ChatArea`, `CreateRoomModal`)로 입력창 타이핑 시 사이드바나 모달이 불필요하게 리렌더링되지 않도록 상태 격리.
  - Vercel API 라우트에 `export const dynamic = "force-dynamic"`을 적용하여 빌드 타임 오류 방지 및 실시간 DB 응답 보장.
