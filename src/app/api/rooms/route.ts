import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, users, messages } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * 📋 GET /api/rooms
 * 생성된 전체 채팅방 목록 및 각 방의 메시지 수, 생성자 정보 조회
 */
export async function GET() {
  try {
    // rooms와 users 테이블을 조인하여 생성자 닉네임과 함께 반환
    const roomList = await db
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

    return NextResponse.json({ rooms: roomList });
  } catch (error) {
    console.error("채팅방 목록 조회 중 에러:", error);
    return NextResponse.json(
      { error: "채팅방 목록을 가져오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * ➕ POST /api/rooms
 * 새로운 채팅방 생성 (로그인 세션 필수)
 */
export async function POST(request: Request) {
  try {
    // 1단계: 인증된 사용자인지 확인 (세션 방어)
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "채팅방을 생성하려면 먼저 로그인해야 합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    // 2단계: 유효성 검사
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "채팅방 제목을 입력해 주세요." },
        { status: 400 }
      );
    }

    // 3단계: 채팅방 레코드 삽입
    const [newRoom] = await db
      .insert(rooms)
      .values({
        name: name.trim(),
        description: description ? description.trim() : "",
        createdBy: currentUser.id,
      })
      .returning();

    return NextResponse.json(
      {
        message: "채팅방이 성공적으로 생성되었습니다.",
        room: {
          ...newRoom,
          creatorNickname: currentUser.nickname,
          messageCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("채팅방 생성 중 에러:", error);
    return NextResponse.json(
      { error: "채팅방 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
