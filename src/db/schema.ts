import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * 🧑‍💻 [1단계: 사용자 테이블 정의 - Users]
 * - username: 고유 사용자 계정 ID
 * - passwordHash: 단방향 암호화된 비밀번호 (bcrypt)
 * - nickname: 화면에 표시될 별명
 * - lastLoginAt: 요구사항인 "로그인 했을 때 로그인 타임스탬프를 기억"하기 위한 필드
 */
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  nickname: text("nickname").notNull(),
  avatarColor: text("avatar_color").notNull().default("#6366f1"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  // 로그인 성공 시마다 UPDATE 되는 타임스탬프 필드 (ISO 문자열)
  lastLoginAt: text("last_login_at"),
});

/**
 * 💬 [2단계: 채팅방 테이블 정의 - Rooms]
 * - name: 채팅방 제목
 * - description: 채팅방 소개
 * - createdBy: 방 생성자 사용자 ID (users.id 외래키 역할)
 */
export const rooms = sqliteTable("rooms", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").default(""),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * ✉️ [3단계: 채팅 메시지 테이블 정의 - Messages]
 * - roomId: 속한 채팅방 ID
 * - userId: 메시지 작성자 ID
 * - content: 메시지 내용
 */
export const messages = sqliteTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  roomId: text("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 타입 추론 익스포트 (TypeScript Type Safety 지원)
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
