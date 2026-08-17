import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { syncRioHubTikTokOrders } from "@/lib/riohubTikTokOrders";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  try {
    const result = await syncRioHubTikTokOrders({
      timeStart: body.timeStart || null,
      timeEnd: body.timeEnd || null,
      updateTimeStart: body.updateTimeStart || null,
      updateTimeEnd: body.updateTimeEnd || null,
      orderId: body.orderId || null,
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Khong dong bo duoc don TikTok" },
      { status: 400 }
    );
  }
}
