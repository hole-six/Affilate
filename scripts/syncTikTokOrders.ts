// Chạy định kỳ (systemd timer, mỗi 30 phút) để kéo đơn hàng TikTok mới từ
// RioHub về hệ thống — trước đây chỉ đồng bộ tay qua nút bấm nên đơn hàng
// mới không tự hiện ra cho admin/khách hàng cho đến khi có người vào bấm.
import { syncRioHubTikTokOrders } from "../lib/riohubTikTokOrders";
import { prisma } from "../lib/prisma";

async function main() {
  const startedAt = new Date().toISOString();
  try {
    const result = await syncRioHubTikTokOrders({ maxPages: 10 });
    console.log(`[${startedAt}] TikTok sync OK:`, JSON.stringify(result));
  } catch (err) {
    console.error(`[${startedAt}] TikTok sync FAILED:`, err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
