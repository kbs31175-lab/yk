import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vercel SQLite Chat | 현대적 실시간 채팅 웹앱",
  description: "Drizzle ORM & libSQL(SQLite) 기반의 Vercel 친화적 풀스택 채팅 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
