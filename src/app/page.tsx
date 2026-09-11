import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

/**
 * 🧭 루트 페이지 (Route Gate)
 * 사용자의 세션 쿠키를 확인하여 로그인 상태면 /chat으로,
 * 미인증 상태면 /login으로 리다이렉트합니다.
 */
export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/chat");
  } else {
    redirect("/login");
  }
}
