import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { customerRate, systemRate } = await req.json();
  if (
    typeof customerRate !== "number" ||
    typeof systemRate !== "number" ||
    customerRate + systemRate !== 100
  ) {
    return NextResponse.json({ error: "Tỷ lệ khách + hệ thống phải bằng 100" }, { status: 400 });
  }

  await prisma.commissionRule.updateMany({
    where: { active: true },
    data: { active: false },
  });

  const rule = await prisma.commissionRule.create({
    data: {
      name: `Cấu hình ${new Date().toLocaleDateString("vi-VN")}`,
      customerRate,
      systemRate,
      active: true,
      createdByUserId: session.userId,
    },
  });

  return NextResponse.json({ rule });
}
