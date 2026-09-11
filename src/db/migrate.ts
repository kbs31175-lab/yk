import { client } from "./index";

/**
 * 🛠 [자동 마이그레이션 스크립트]
 * 테이블이 아직 없는 환경(신규 배포 또는 로컬 최초 실행)에서
 * 필요한 SQLite 테이블을 안전하게 생성합니다.
 */
export async function runMigration() {
  console.log("⏳ [DB 마이그레이션] SQLite 테이블 스키마 초기화 시작...");

  // 1단계: 사용자 테이블 생성 (last_login_at 포함)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      nickname TEXT NOT NULL,
      avatar_color TEXT NOT NULL DEFAULT '#6366f1',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login_at TEXT
    );
  `);

  // 2단계: 채팅방 테이블 생성
  await client.execute(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3단계: 메시지 테이블 생성
  await client.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4단계: 성능 최적화를 위한 인덱스 생성
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_messages_room_created 
    ON messages(room_id, created_at);
  `);

  console.log("✅ [DB 마이그레이션 완료] 모든 테이블 및 인덱스가 성공적으로 준비되었습니다.");
}

// 직접 스크립트로 실행될 경우 실행
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ 마이그레이션 에러:", err);
      process.exit(1);
    });
}
