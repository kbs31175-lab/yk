import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

/**
 * 🚪 POST /api/auth/logout
 * 세션 쿠키를 삭제하여 로그아웃 처리
 */
export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ message: "로그아웃되었습니다." });
  } catch (error) {
    console.error("로그아웃 에러:", error);
    return NextResponse.json({ error: "로그아웃 중 오류가 발생했습니다." }, { status: 500 });
  }
}
