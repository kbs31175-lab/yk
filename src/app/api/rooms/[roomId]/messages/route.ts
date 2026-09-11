import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages, users, rooms } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    roomId: string;
  };
}

/**
 * 💬 GET /api/rooms/[roomId]/messages
 * 특정 채팅방의 메시지 내역 조회 (작성자 정보 포함)
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { roomId } = params;

    // 1단계: 채팅방 존재 여부 확인
    const roomExists = await db
      .select({ id: rooms.id, name: rooms.name, description: rooms.description })
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (roomExists.length === 0) {
      return NextResponse.json({ error: "채팅방을 찾을 수 없습니다." }, { status: 404 });
    }

    // 2단계: 메시지와 작성자 정보 JOIN 쿼리 (시간순 정렬)
    const messageList = await db
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

    return NextResponse.json({
      room: roomExists[0],
      messages: messageList,
    });
  } catch (error) {
    console.error("메시지 조회 중 에러:", error);
    return NextResponse.json(
      { error: "메시지를 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 🚀 POST /api/rooms/[roomId]/messages
 * 채팅방에 새 메시지 전송
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    // 1단계: 인증 세션 확인
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "메시지를 전송하려면 먼저 로그인해야 합니다." },
        { status: 401 }
      );
    }

    const { roomId } = params;
    const body = await request.json();
    const { content } = body;

    // 2단계: 내용 유효성 검사
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "메시지 내용을 입력해 주세요." },
        { status: 400 }
      );
    }

    // 3단계: 채팅방 존재 확인
    const roomExists = await db
      .select({ id: rooms.id })
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (roomExists.length === 0) {
      return NextResponse.json({ error: "존재하지 않는 채팅방입니다." }, { status: 404 });
    }

    // 4단계: 메시지 레코드 생성
    const [newMessage] = await db
      .insert(messages)
      .values({
        roomId,
        userId: currentUser.id,
        content: content.trim(),
      })
      .returning();

    return NextResponse.json(
      {
        message: "메시지가 전송되었습니다.",
        data: {
          ...newMessage,
          senderUsername: currentUser.username,
          senderNickname: currentUser.nickname,
          senderAvatarColor: currentUser.avatarColor,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("메시지 전송 중 에러:", error);
    return NextResponse.json(
      { error: "메시지 전송에 실패했습니다." },
      { status: 500 }
    );
  }
}
