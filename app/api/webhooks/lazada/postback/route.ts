import { NextRequest, NextResponse } from "next/server";
import { upsertLazadaOrder } from "@/lib/lazadaOrders";

/**
 * Lazada Postback Webhook - nhận thông tin đơn hàng realtime từ Lazada
 * 
 * Lazada sẽ gọi endpoint này với các macro:
 * - {_p_order_id}: Order ID
 * - {_p_sub_order_id}: Sub Order ID
 * - {_p_offer}: Tên sản phẩm
 * - {_p_sku_name}: Tên SKU
 * - {_p_status}: Trạng thái đơn (fulfilled/delivered/returned)
 * - {_p_payout}: Hoa hồng ước tính
 * - {_p_pay_amount}: Giá trị đơn hàng
 * - {_p_currency}: Đơn vị tiền tệ
 * - {sub_id1}: Customer code (custom macro)
 * - {sub_id2}: Tracking code (custom macro)
 * - {sub_id3}: Channel source (custom macro)
 * - {_p_fulfilled_time}: Thời gian fulfilled
 * - {_p_delivered_time}: Thời gian delivered
 * - {_p_returned_time}: Thời gian returned
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(async () => {
      // Nếu không phải JSON, thử parse từ query params
      const url = new URL(req.url);
      const params: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return params;
    });

    // Log để debug khi mới setup
    console.log("[LAZADA_POSTBACK]", JSON.stringify(body).slice(0, 500));

    // Validate required fields
    const orderId = body.order_id || body._p_order_id;
    if (!orderId) {
      console.warn("[LAZADA_POSTBACK_MISSING_ORDER_ID]", body);
      return NextResponse.json({ status: "fail", msg: "missing order_id" }, { status: 400 });
    }

    // Map Lazada postback data sang format của hệ thống
    const orderData = {
      orderId: orderId,
      subOrderId: body.sub_order_id || body._p_sub_order_id || null,
      offerName: body.offer || body._p_offer || null,
      skuName: body.sku_name || body._p_sku_name || null,
      status: body.status || body._p_status || null,
      estPayout: body.payout || body._p_payout || null,
      orderAmt: body.pay_amount || body._p_pay_amount || null,
      currency: body.currency || body._p_currency || "VND",
      subId1: body.sub_id1 || null, // Customer code
      subId2: body.sub_id2 || null, // Tracking code
      fulfilledTime: body.fulfilled_time || body._p_fulfilled_time || null,
      deliveredTime: body.delivered_time || body._p_delivered_time || null,
      returnedTime: body.returned_time || body._p_returned_time || null,
    };

    // Xử lý đơn hàng
    const result = await upsertLazadaOrder(orderData);

    console.log(
      `[LAZADA_POSTBACK_SUCCESS] ${result.created ? "Created" : "Updated"} order ${orderId} for customer ${result.customerId || "UNMAPPED"}`
    );

    // Lazada yêu cầu response "ok" hoặc status 200
    return NextResponse.json({ status: "ok", orderId: result.orderId });
  } catch (error) {
    console.error("[LAZADA_POSTBACK_ERROR]", error);
    
    // Vẫn trả về 200 để Lazada không retry liên tục
    // Nhưng log lỗi để admin theo dõi
    return NextResponse.json(
      {
        status: "error",
        msg: error instanceof Error ? error.message : "Internal error",
      },
      { status: 200 }
    );
  }
}

/**
 * GET endpoint để Lazada test kết nối (Run Test trong AdSense)
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  console.log("[LAZADA_POSTBACK_TEST]", params);

  // Test thường có clickid = "testclickid" và các giá trị test_xxx
  if (params.order_id?.includes("test") || params._p_order_id?.includes("test")) {
    return NextResponse.json({ status: "ok", msg: "test received" });
  }

  return NextResponse.json({ status: "ok", msg: "postback endpoint ready" });
}
