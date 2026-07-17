import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/auth";
import { sendMail, buildAdminNewRegistrationEmail } from "@/lib/mailer";

async function generateCustomerCode(): Promise<string> {
  const count = await prisma.customer.count();
  return `C${String(count + 1).padStart(4, "0")}`;
}

export async function POST(req: NextRequest) {
  const { email, password, fullName, phone } = await req.json();

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: "Thiếu email, mật khẩu hoặc họ tên" }, { status: 400 });
  }

  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email này đã được đăng ký" }, { status: 409 });
  }

  const customerCode = await generateCustomerCode();
  const passwordHash = hashPassword(password);

  // Check referral cookie
  const refCode = req.cookies.get("ref_code")?.value;
  let referredById = null;
  if (refCode) {
    const referrer = await prisma.customer.findUnique({
      where: { customerCode: refCode },
      select: { id: true },
    });
    if (referrer) {
      referredById = referrer.id;
    }
  }

  const customer = await prisma.customer.create({
    data: {
      customerCode,
      fullName,
      phone: phone || null,
      referredById,
    },
  });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: "customer",
      customerId: customer.id,
    },
  });

  await setSessionCookie({
    userId: user.id,
    role: "customer",
    fullName: user.fullName,
    customerId: customer.id,
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
        phone,
        source: "email",
        referredByCode: referredById ? refCode : null,
      }),
    });
  }

  return NextResponse.json({ role: "customer", redirectTo: "/app" });
}
