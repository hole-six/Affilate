#!/usr/bin/env node

/**
 * Script sửa status của platform Lazada thành "active"
 * Chạy: node scripts/fix-lazada-status.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  FIX LAZADA PLATFORM STATUS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  // Kiểm tra trạng thái hiện tại
  console.log("📊 Trạng thái hiện tại:");
  const platforms = await prisma.platform.findMany({
    orderBy: { name: "asc" },
  });

  platforms.forEach((p) => {
    const statusText = p.status === "active" ? "✅ ACTIVE" : "❌ INACTIVE";
    console.log(`   ${p.code.padEnd(8)} - ${p.name.padEnd(15)} - ${statusText}`);
  });

  console.log("");

  // Update Lazada
  const lazada = await prisma.platform.findUnique({
    where: { code: "LAZADA" },
  });

  if (!lazada) {
    console.log("❌ Platform LAZADA không tồn tại trong database!");
    console.log("   Tạo mới platform Lazada...");
    
    await prisma.platform.create({
      data: {
        code: "LAZADA",
        name: "Lazada",
        status: "active",
      },
    });
    
    console.log("✅ Đã tạo platform Lazada với status = active");
  } else if (lazada.status !== "active") {
    console.log(`⚠️  Platform LAZADA hiện có status: ${lazada.status || "null"}`);
    console.log("   Đang update thành active...");

    await prisma.platform.update({
      where: { code: "LAZADA" },
      data: { status: "active" },
    });

    console.log("✅ Đã update platform Lazada thành active");
  } else {
    console.log("✅ Platform LAZADA đã active rồi, không cần update");
  }

  console.log("");
  console.log("📊 Trạng thái sau khi update:");
  const platformsAfter = await prisma.platform.findMany({
    orderBy: { name: "asc" },
  });

  platformsAfter.forEach((p) => {
    const statusText = p.status === "active" ? "✅ ACTIVE" : "❌ INACTIVE";
    console.log(`   ${p.code.padEnd(8)} - ${p.name.padEnd(15)} - ${statusText}`);
  });

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  HOÀN TẤT!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("💡 Bây giờ Lazada sẽ hiển thị trong:");
  console.log("   - Trang tạo link khách: /app/refunds");
  console.log("   - Trang tạo link admin: /admin/links");
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
