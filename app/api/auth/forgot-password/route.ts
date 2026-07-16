import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getRequestOrigin } from "@/lib/requestOrigin";
import { sendMail, buildPasswordResetEmail } from "@/lib/mailer";

const TOKEN_TTL_MINUTES = 30;

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Thiếu email" }, { status: 400 });
  }

  const genericResponse = NextResponse.json({
    ok: true,
    message: "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.",
  });

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

  // Luôn trả về thông báo chung chung dù email có tồn tại hay không —
  // tránh lộ thông tin cho kẻ tấn công dò email nào đã đăng ký (user enumeration).
  if (!user || user.status !== "active") {
    return genericResponse;
  }

  // Xoá các token cũ chưa dùng của user này để tránh tích luỹ rác / dùng nhầm token cũ.
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  const origin = getRequestOrigin(req);
  const resetUrl = `${origin}/reset-password?token=${token}`;

  void sendMail({
    to: user.email,
    subject: "Đặt lại mật khẩu - Affiliate Hoàn Tiền",
    html: buildPasswordResetEmail({
      fullName: user.fullName,
      resetUrl,
      expiresInMinutes: TOKEN_TTL_MINUTES,
    }),
  });

  return genericResponse;
}
