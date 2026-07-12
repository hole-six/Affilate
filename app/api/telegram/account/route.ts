import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
  }

  const { id, botName, botUsername, botTokenHint, webhookUrl, status } = await req.json();

  const account = id
    ? await prisma.telegramAccount.update({
        where: { id },
        data: { botName, botUsername, botTokenHint, webhookUrl, status },
      })
    : await prisma.telegramAccount.create({
        data: { botName, botUsername, botTokenHint, webhookUrl, status: status ?? "inactive" },
      });

  return NextResponse.json({ account });
}
