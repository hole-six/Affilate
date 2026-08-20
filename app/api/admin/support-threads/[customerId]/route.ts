import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getThreadWithMessages,
  markThreadReadByAdmin,
  sendAdminMessageToCustomer,
} from "@/lib/supportMessages";

export async function GET(_req: NextRequest, { params }: { params: { customerId: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const thread = await getThreadWithMessages(params.customerId);
  return NextResponse.json({ thread });
}

export async function POST(req: NextRequest, { params }: { params: { customerId: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { message } = await req.json();
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Thiếu nội dung tin nhắn" }, { status: 400 });
  }

  const thread = await sendAdminMessageToCustomer({
    customerId: params.customerId,
    adminUserId: session.userId,
    message,
  });

  return NextResponse.json({ thread });
}

export async function PATCH(_req: NextRequest, { params }: { params: { customerId: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  await markThreadReadByAdmin(params.customerId);
  return NextResponse.json({ success: true });
}
