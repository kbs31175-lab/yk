import { getServerSupabase } from "./supabase/server";
import { db } from "@/db";
import { users, rooms, messages } from "@/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";

/**
 * 🏛️ [데이터 접근 서비스 계층 - Data Service Repository]
 * Supabase가 설정되어 있으면 Supabase PostgreSQL을 쿼리하고,
 * 아직 설정 전이거나 로컬 모드일 때는 Drizzle SQLite로 안전하게 동작하는 하이브리드 어댑터입니다.
 */

// 1. 유저 조회 (username 기반)
export async function getUserByUsername(username: string) {
  const supabase = getServerSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (error) console.error("Supabase getUserByUsername 에러:", error);
    if (!data) return null;
    return {
      id: data.id,
      username: data.username,
      passwordHash: data.password_hash,
      nickname: data.nickname,
      avatarColor: data.avatar_color,
      createdAt: data.created_at,
      lastLoginAt: data.last_login_at,
    };
  }

  // SQLite Fallback
  const list = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return list[0] || null;
}

// 2. 유저 조회 (id 기반)
export async function getUserById(id: string) {
  const supabase = getServerSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, nickname, avatar_color, created_at, last_login_at")
      .eq("id", id)
      .maybeSingle();

    if (error) console.error("Supabase getUserById 에러:", error);
    if (!data) return null;
    return {
      id: data.id,
      username: data.username,
      nickname: data.nickname,
      avatarColor: data.avatar_color,
      createdAt: data.created_at,
      lastLoginAt: data.last_login_at,
    };
  }

  // SQLite Fallback
  const list = await db
    .select({
      id: users.id,
      username: users.username,
      nickname: users.nickname,
      avatarColor: users.avatarColor,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return list[0] || null;
}

// 3. 신규 유저 생성
export async function createUser(params: {
  username: string;
  passwordHash: string;
  nickname: string;
  avatarColor: string;
}) {
  const supabase = getServerSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("users")
      .insert({
        username: params.username,
        password_hash: params.passwordHash,
        nickname: params.nickname,
        avatar_color: params.avatarColor,
      })
      .select("id, username, nickname, avatar_color, created_at")
      .single();

    if (error) throw new Error(error.message);
    return {
      id: data.id,
      username: data.username,
      nickname: data.nickname,
      avatarColor: data.avatar_color,
      createdAt: data.created_at,
    };
  }

  // SQLite Fallback
  const [newUser] = await db
    .insert(users)
    .values({
      username: params.username,
      passwordHash: params.passwordHash,
      nickname: params.nickname,
      avatarColor: params.avatarColor,
    })
    .returning({
      id: users.id,
      username: users.username,
      nickname: users.nickname,
      avatarColor: users.avatarColor,
      createdAt: users.createdAt,
    });
  return newUser;
}

// 4. 🌟 [핵심 요구사항] 로그인 타임스탬프 기록
export async function updateUserLastLogin(userId: string, timestamp: string) {
  const supabase = getServerSupabase();
  if (supabase) {
    const { error } = await supabase
      .from("users")
      .update({ last_login_at: timestamp })
      .eq("id", userId);

    if (error) console.error("Supabase updateUserLastLogin 에러:", error);
    return;
  }

  // SQLite Fallback
  await db
    .update(users)
    .set({ lastLoginAt: timestamp })
    .where(eq(users.id, userId));
}

// 5. 채팅방 목록 조회
export async function getRoomsList() {
  const supabase = getServerSupabase();
  if (supabase) {
    // rooms와 users 조인 및 메시지 개수 조회
    const { data, error } = await supabase
      .from("rooms")
      .select(`
        id,
        name,
        description,
        created_at,
        created_by,
        users ( nickname ),
        messages ( count )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase getRoomsList 에러:", error);
      return [];
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      createdAt: r.created_at,
      createdBy: r.created_by,
      creatorNickname: r.users?.nickname || "익명",
      messageCount: Array.isArray(r.messages) ? r.messages.length : (r.messages?.[0]?.count || 0),
    }));
  }

  // SQLite Fallback
  return await db
    .select({
      id: rooms.id,
      name: rooms.name,
      description: rooms.description,
      createdAt: rooms.createdAt,
      createdBy: rooms.createdBy,
      creatorNickname: users.nickname,
      messageCount: sql<number>`(SELECT COUNT(*) FROM messages WHERE messages.room_id = rooms.id)`.mapWith(Number),
    })
    .from(rooms)
    .leftJoin(users, eq(rooms.createdBy, users.id))
    .orderBy(desc(rooms.createdAt));
}

// 6. 채팅방 생성
export async function createRoomRecord(params: {
  name: string;
  description?: string;
  createdBy: string;
}) {
  const supabase = getServerSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("rooms")
      .insert({
        name: params.name,
        description: params.description || "",
        created_by: params.createdBy,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // SQLite Fallback
  const [newRoom] = await db
    .insert(rooms)
    .values({
      name: params.name,
      description: params.description || "",
      createdBy: params.createdBy,
    })
    .returning();
  return newRoom;
}

// 7. 특정 채팅방 단일 조회
export async function getRoomById(roomId: string) {
  const supabase = getServerSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("rooms")
      .select("id, name, description")
      .eq("id", roomId)
      .maybeSingle();

    if (error) console.error("Supabase getRoomById 에러:", error);
    return data;
  }

  const list = await db
    .select({ id: rooms.id, name: rooms.name, description: rooms.description })
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1);
  return list[0] || null;
}

// 8. 메시지 목록 조회
export async function getMessagesByRoom(roomId: string) {
  const supabase = getServerSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        id,
        room_id,
        content,
        created_at,
        user_id,
        users ( username, nickname, avatar_color )
      `)
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase getMessagesByRoom 에러:", error);
      return [];
    }

    return (data || []).map((m: any) => ({
      id: m.id,
      roomId: m.room_id,
      content: m.content,
      createdAt: m.created_at,
      userId: m.user_id,
      senderUsername: m.users?.username || "",
      senderNickname: m.users?.nickname || m.users?.username || "익명",
      senderAvatarColor: m.users?.avatar_color || "#6366f1",
    }));
  }

  // SQLite Fallback
  return await db
    .select({
      id: messages.id,
      roomId: messages.roomId,
      content: messages.content,
      createdAt: messages.createdAt,
      userId: messages.userId,
      senderUsername: users.username,
      senderNickname: users.nickname,
      senderAvatarColor: users.avatarColor,
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.roomId, roomId))
    .orderBy(asc(messages.createdAt));
}

// 9. 메시지 생성
export async function createMessageRecord(params: {
  roomId: string;
  userId: string;
  content: string;
}) {
  const supabase = getServerSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        room_id: params.roomId,
        user_id: params.userId,
        content: params.content,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // SQLite Fallback
  const [newMessage] = await db
    .insert(messages)
    .values({
      roomId: params.roomId,
      userId: params.userId,
      content: params.content,
    })
    .returning();
  return newMessage;
}
