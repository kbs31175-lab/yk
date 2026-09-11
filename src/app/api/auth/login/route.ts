import { NextResponse } from "next/server";
import { getUserByUsername, updateUserLastLogin } from "@/lib/data-service";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * 🔑 POST /api/auth/login
 * 사용자 로그인 처리 및 요구사항인 '로그인 타임스탬프 기록' 수행 (Supabase & SQLite 지원)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 1단계: 유효성 검사
    if (!username || !password) {
      return NextResponse.json(
        { error: "아이디와 비밀번호를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    // 2단계: 유저 조회
    const user = await getUserByUsername(cleanUsername);

    if (!user) {
      return NextResponse.json(
        { error: "존재하지 않는 사용자이거나 비밀번호가 틀렸습니다." },
        { status: 401 }
      );
    }

    // 3단계: 비밀번호 검증
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "존재하지 않는 사용자이거나 비밀번호가 틀렸습니다." },
        { status: 401 }
      );
    }

    // 4단계: 🌟 [핵심 요구사항] 로그인 타임스탬프 기억(기록)
    const loginTimestamp = new Date().toISOString();
    await updateUserLastLogin(user.id, loginTimestamp);

    // 5단계: JWT 세션 토큰 발행 및 쿠키 설정
    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
    });

    await setSessionCookie(token);

    // 6단계: 응답 데이터 반환 (비밀번호 해시 제외, 최신 lastLoginAt 반환)
    return NextResponse.json({
      message: "로그인에 성공했습니다.",
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatarColor: user.avatarColor,
        createdAt: user.createdAt,
        lastLoginAt: loginTimestamp,
      },
    });
  } catch (error) {
    console.error("로그인 처리 중 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
