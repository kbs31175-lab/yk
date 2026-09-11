import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * 🏛 [아키텍처 포인트: Vercel 서버리스 & 로컬 하이브리드 클라이언트]
 * - Vercel 환경: TURSO_DATABASE_URL과 TURSO_AUTH_TOKEN이 설정되면 원격 분산 클라우드 SQLite(Turso)로 연결
 * - 로컬 개발 환경: 환경변수가 없으면 루트의 file:local.db 로컬 파일 SQLite로 자동 폴백(Fallback)
 */
const getDbClient = (): Client => {
  const url = process.env.TURSO_DATABASE_URL || "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  return createClient({
    url,
    authToken,
  });
};

// Next.js 개발 환경에서 핫 리로딩(HMR) 시 다중 인스턴스 생성 방지 (싱글톤 패턴)
declare global {
  // eslint-disable-next-line no-var
  var __dbClient: Client | undefined;
  // eslint-disable-next-line no-var
  var __dbInstance: LibSQLDatabase<typeof schema> | undefined;
}

const client = globalThis.__dbClient ?? getDbClient();
export const db = globalThis.__dbInstance ?? drizzle(client, { schema });

if (process.env.NODE_ENV !== "production") {
  globalThis.__dbClient = client;
  globalThis.__dbInstance = db;
}

export { client };
