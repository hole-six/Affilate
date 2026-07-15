import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  SessionPayload,
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./session";

export async function getSession(): Promise<SessionPayload | null> {
  const accessPayload = await verifyAccessToken(cookies().get(ACCESS_TOKEN_COOKIE)?.value);
  if (accessPayload) return accessPayload;

  const refreshPayload = await verifyRefreshToken(cookies().get(REFRESH_TOKEN_COOKIE)?.value);
  if (!refreshPayload) return null;

  // Access token hết hạn nhưng refresh token còn hiệu lực — tự cấp lại access
  // token mới để không bắt người dùng đăng nhập lại giữa chừng.
  const newAccessToken = await createAccessToken(refreshPayload);
  try {
    cookies().set(ACCESS_TOKEN_COOKIE, newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ACCESS_TOKEN_TTL_SECONDS,
    });
  } catch {
    // Đang render trong Server Component (chỉ đọc được cookie, không set được)
    // — middleware sẽ cấp lại access token mới ở request kế tiếp.
  }
  return refreshPayload;
}

export async function setSessionCookie(payload: SessionPayload) {
  const accessToken = await createAccessToken(payload);
  const refreshToken = await createRefreshToken(payload);
  const isProd = process.env.NODE_ENV === "production";

  cookies().set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
  cookies().set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().delete(ACCESS_TOKEN_COOKIE);
  cookies().delete(REFRESH_TOKEN_COOKIE);
}
