import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { trackingLinks: true, orders: true } },
      orders: { select: { customerRewardAmount: true, payoutStatus: true } },
    },
  });

  return NextResponse.json({ customers });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { fullName, phone, zaloUserId, telegramUserId, telegramUsername, note } = await req.json();
  if (!fullName) {
    return NextResponse.json({ error: "Thiếu họ tên" }, { status: 400 });
  }

  const count = await prisma.customer.count();
  const customerCode = `C${String(count + 1).padStart(4, "0")}`;

  const customer = await prisma.customer.create({
    data: { customerCode, fullName, phone, zaloUserId, telegramUserId, telegramUsername, note },
  });

  return NextResponse.json({ customer });
}
