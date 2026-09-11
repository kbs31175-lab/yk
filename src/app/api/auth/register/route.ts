import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

const AVATAR_PALETTE = [
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
];

/**
 * 📝 POST /api/auth/register
 * 신규 사용자 회원가입 처리
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, nickname } = body;

    // 1단계: 유효성 검사 (Defensive check)
    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json(
        { error: "아이디는 최소 3자 이상이어야 합니다." },
        { status: 400 }
      );
    }
    if (!password || typeof password !== "string" || password.length < 4) {
      return NextResponse.json(
        { error: "비밀번호는 최소 4자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanNickname = (nickname && typeof nickname === "string" && nickname.trim()) 
      ? nickname.trim() 
      : cleanUsername;

    // 2단계: 아이디 중복 확인
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, cleanUsername))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "이미 사용 중인 아이디입니다." },
        { status: 409 }
      );
    }

    // 3단계: 비밀번호 단방향 암호화
    const passwordHash = await hashPassword(password);

    // 4단계: 랜덤 아바타 컬러 부여 및 DB 저장
    const randomColor = AVATAR_PALETTE[Math.floor(Math.random() * AVATAR_PALETTE.length)];

    const [newUser] = await db
      .insert(users)
      .values({
        username: cleanUsername,
        passwordHash,
        nickname: cleanNickname,
        avatarColor: randomColor,
      })
      .returning({
        id: users.id,
        username: users.username,
        nickname: users.nickname,
        avatarColor: users.avatarColor,
        createdAt: users.createdAt,
      });

    return NextResponse.json(
      {
        message: "회원가입이 완료되었습니다. 로그인해 주세요.",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("회원가입 처리 중 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
