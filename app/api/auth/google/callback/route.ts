import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/auth";
import { getRequestOrigin } from "@/lib/requestOrigin";
import { sendMail, buildAdminNewRegistrationEmail } from "@/lib/mailer";

const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";

async function generateCustomerCode(): Promise<string> {
  const count = await prisma.customer.count();
  return `C${String(count + 1).padStart(4, "0")}`;
}

export async function GET(req: NextRequest) {
  const origin = getRequestOrigin(req);
  const failRedirect = (reason: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = req.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return failRedirect("google_state_mismatch");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return failRedirect("google_not_configured");
  }

  const redirectUri = `${origin}/api/auth/google/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return failRedirect("google_token_exchange_failed");
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token as string | undefined;
  if (!accessToken) {
    return failRedirect("google_token_exchange_failed");
  }

  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userInfoRes.ok) {
    return failRedirect("google_userinfo_failed");
  }

  const profile = await userInfoRes.json();
  const email = profile.email as string | undefined;
  const emailVerified = profile.email_verified as boolean | undefined;
  const fullName = (profile.name as string | undefined) || email || "Người dùng Google";

  if (!email || !emailVerified) {
    return failRedirect("google_email_not_verified");
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    if (user.status !== "active") {
      return failRedirect("account_inactive");
    }
  } else {
    const refCode = req.cookies.get("ref_code")?.value;
    let referredById: string | null = null;
    if (refCode) {
      const referrer = await prisma.customer.findUnique({
        where: { customerCode: refCode },
        select: { id: true },
      });
      if (referrer) referredById = referrer.id;
    }

    const customerCode = await generateCustomerCode();
    const customer = await prisma.customer.create({
      data: { customerCode, fullName, referredById },
    });

    user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashPassword(crypto.randomBytes(24).toString("hex")),
        fullName,
        role: "customer",
        customerId: customer.id,
      },
    });

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      void sendMail({
        to: adminEmail,
        subject: `[Đăng ký mới] ${fullName} (${customerCode})`,
        html: buildAdminNewRegistrationEmail({
          fullName,
          email,
          customerCode,
          source: "google",
          referredByCode: referredById ? refCode : null,
        }),
      });
    }
  }

  await setSessionCookie({
    userId: user.id,
    role: user.role as "admin" | "customer",
    fullName: user.fullName,
    customerId: user.customerId,
  });

  const res = NextResponse.redirect(`${origin}${user.role === "admin" ? "/admin" : "/app"}`);
  res.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
  return res;
}
