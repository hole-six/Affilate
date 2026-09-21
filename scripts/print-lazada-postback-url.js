#!/usr/bin/env node

/**
 * Script để in ra Postback URL đầy đủ cho Lazada
 * Chạy: node scripts/print-lazada-postback-url.js
 */

require("dotenv").config();

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const postbackPath = "/api/webhooks/lazada/postback";

// Các macro của Lazada
const macros = [
  "order_id={_p_order_id}",
  "sub_order_id={_p_sub_order_id}",
  "offer={_p_offer}",
  "sku_name={_p_sku_name}",
  "status={_p_status}",
  "payout={_p_payout}",
  "pay_amount={_p_pay_amount}",
  "currency={_p_currency}",
  "sub_id1={sub_id1}",
  "sub_id2={sub_id2}",
  "sub_id3={sub_id3}",
  "fulfilled_time={_p_fulfilled_time}",
  "delivered_time={_p_delivered_time}",
  "returned_time={_p_returned_time}",
];

const fullUrl = `${appUrl}${postbackPath}?${macros.join("&")}`;

console.log("\n╔════════════════════════════════════════════════════════════════╗");
console.log("║  LAZADA POSTBACK URL - Copy vào Lazada Affiliate Dashboard    ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");

console.log("📍 Base URL:");
console.log(`   ${appUrl}${postbackPath}\n`);

console.log("🔗 Full Postback URL (copy toàn bộ URL này):");
console.log(`\n${fullUrl}\n`);

console.log("📋 Hướng dẫn:");
console.log("   1. Đăng nhập Lazada Affiliate Dashboard");
console.log("   2. Vào Settings → Postback URL");
console.log("   3. Tạo mới Postback:");
console.log("      - Name: iviback Order Tracking");
console.log("      - Event: Order");
console.log("      - URL: Paste URL ở trên");
console.log("   4. Nhấn 'Run Test' để kiểm tra kết nối");
console.log("   5. Xem hướng dẫn chi tiết: docs/LAZADA_POSTBACK_SETUP.md\n");

console.log("✅ Endpoint đã sẵn sàng tại: /api/webhooks/lazada/postback");
console.log("🧪 Test endpoint: /api/admin/integrations/lazada/postback-test\n");
