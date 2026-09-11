import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * 👤 GET /api/auth/me
 * 현재 로그인된 세션 사용자의 정보 및 로그인 타임스탬프 반환
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("세션 유저 확인 중 에러:", error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
