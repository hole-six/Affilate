import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { status } = await req.json();
  const voucher = await prisma.voucher.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json({ voucher });
}
