// Chạy định kỳ (systemd timer, mỗi 30 phút) để kéo đơn hàng Lazada mới về
// hệ thống — cùng khuôn với scripts/syncTikTokOrders.ts.
import { syncLazadaOrders } from "../lib/lazadaOrders";
import { prisma } from "../lib/prisma";

async function main() {
  const startedAt = new Date().toISOString();
  try {
    const result = await syncLazadaOrders();
    console.log(`[${startedAt}] Lazada sync OK:`, JSON.stringify(result));
  } catch (err) {
    console.error(`[${startedAt}] Lazada sync FAILED:`, err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
