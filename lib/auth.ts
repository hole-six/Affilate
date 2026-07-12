import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SessionPayload,
  createSessionToken,
  verifySessionToken,
} from "./session";

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 ngày
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}
