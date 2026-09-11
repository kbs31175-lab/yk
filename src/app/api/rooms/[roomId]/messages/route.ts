import { NextResponse } from "next/server";
import { getRoomById, getMessagesByRoom, createMessageRecord } from "@/lib/data-service";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    roomId: string;
  };
}

/**
 * 💬 GET /api/rooms/[roomId]/messages
 * 특정 채팅방의 메시지 내역 조회 (Supabase & SQLite 지원)
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { roomId } = params;

    // 1단계: 채팅방 존재 여부 확인
    const room = await getRoomById(roomId);
    if (!room) {
      return NextResponse.json({ error: "채팅방을 찾을 수 없습니다." }, { status: 404 });
    }

    // 2단계: 메시지와 작성자 정보 조회
    const messageList = await getMessagesByRoom(roomId);

    return NextResponse.json({
      room,
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
    const room = await getRoomById(roomId);
    if (!room) {
      return NextResponse.json({ error: "존재하지 않는 채팅방입니다." }, { status: 404 });
    }

    // 4단계: 메시지 레코드 생성
    const newMessage = await createMessageRecord({
      roomId,
      userId: currentUser.id,
      content: content.trim(),
    });

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
  } catch (error: any) {
    console.error("메시지 전송 중 에러:", error);
    return NextResponse.json(
      { error: error?.message || "메시지 전송에 실패했습니다." },
      { status: 500 }
    );
  }
}
