import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * Test gửi postback giả về endpoint webhook để verify nó hoạt động
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const postbackUrl = `${baseUrl}/api/webhooks/lazada/postback`;

    // Tạo payload giả giống Lazada postback
    const mockPayload = {
      order_id: `TEST-${Date.now()}`,
      sub_order_id: "SUB001",
      offer: "Test Product - iPhone 15 Pro Max",
      sku_name: "256GB Blue",
      status: "delivered",
      payout: "150000", // 150k VND hoa hồng
      pay_amount: "30000000", // 30M VND giá trị đơn
      currency: "VND",
      sub_id1: "TEST_CUSTOMER", // Customer code
      sub_id2: "TEST_TRACKING", // Tracking code
      sub_id3: "WEB",
      fulfilled_time: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 ngày trước
      delivered_time: new Date().toISOString(), // Hôm nay
      returned_time: null,
    };

    // Gọi webhook endpoint
    const response = await fetch(postbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockPayload),
    });

    const data = await response.json();

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      postbackUrl,
      sentPayload: mockPayload,
      response: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Test postback thất bại",
      },
      { status: 500 }
    );
  }
}
