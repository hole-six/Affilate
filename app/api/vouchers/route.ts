import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { platformId, title, voucherCode, voucherUrl, benefitText, conditionsText, endsAt } = await req.json();
  if (!platformId || !title) {
    return NextResponse.json({ error: "Thiếu nền tảng hoặc tên chương trình" }, { status: 400 });
  }

  const voucher = await prisma.voucher.create({
    data: {
      platformId,
      title,
      voucherCode,
      voucherUrl,
      benefitText,
      conditionsText,
      endsAt: endsAt ? new Date(endsAt) : undefined,
      status: "active",
      createdByUserId: session.userId,
    },
  });

  return NextResponse.json({ voucher });
}
