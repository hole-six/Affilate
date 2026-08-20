import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getThreadWithMessages, markThreadReadByCustomer, sendCustomerReply } from "@/lib/supportMessages";

export async function GET() {
  const session = await getSession();
  if (!session?.customerId) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const thread = await getThreadWithMessages(session.customerId);
  return NextResponse.json({ thread });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.customerId) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { message } = await req.json();
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Thiếu nội dung tin nhắn" }, { status: 400 });
  }

  try {
    const thread = await sendCustomerReply({ customerId: session.customerId, message });
    return NextResponse.json({ thread });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Không gửi được" }, { status: 400 });
  }
}

export async function PATCH() {
  const session = await getSession();
  if (!session?.customerId) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  await markThreadReadByCustomer(session.customerId);
  return NextResponse.json({ success: true });
}
