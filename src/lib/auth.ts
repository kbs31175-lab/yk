import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "super_secret_session_jwt_key_260911_change_in_production";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = "auth_session_token";

export interface SessionPayload {
  userId: string;
  username: string;
  nickname: string;
}

/**
 * 🔒 [1단계: 비밀번호 단방향 암호화]
 * 솔트(Salt) 라운드 10을 사용하여 레인보우 테이블 공격을 방어합니다.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return await bcrypt.hash(plainText, 10);
}

/**
 * 🔑 [2단계: 비밀번호 검증]
 */
export async function verifyPassword(plainText: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(plainText, hashed);
}

/**
 * 🎫 [3단계: JWT 세션 토큰 발행]
 * 7일간 유효한 토큰 생성
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * 🔍 [4단계: JWT 세션 토큰 검증]
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      nickname: payload.nickname as string,
    };
  } catch {
    // 토큰 변조 또는 만료 시 null 반환 (방어적 프로그래밍)
    return null;
  }
}

/**
 * 🍪 [5단계: HTTP-Only 쿠키 세션 저장]
 */
export async function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7일
  });
}

/**
 * 🚪 [6단계: 세션 쿠키 삭제 (로그아웃)]
 */
export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * 👤 [7단계: 현재 세션의 유저 정보 및 DB 상태 조회]
 */
export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  // DB에서 최신 유저 정보 조회 (lastLoginAt 포함)
  const userList = await db
    .select({
      id: users.id,
      username: users.username,
      nickname: users.nickname,
      avatarColor: users.avatarColor,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  if (userList.length === 0) return null;
  return userList[0];
}
