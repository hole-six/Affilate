import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { buildAffiliateUrl } from "../lib/linkConversion";
import { buildShopeeSubIds } from "../lib/tracking";
import { buildShortUrl } from "../lib/shortLink";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync("Demo@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.vn" },
    update: {},
    create: {
      email: "admin@demo.vn",
      passwordHash,
      fullName: "Quản trị viên",
      role: "admin",
    },
  });

  const shopee = await prisma.platform.upsert({
    where: { code: "SHOPEE" },
    update: {},
    create: { code: "SHOPEE", name: "Shopee" },
  });

  const tiktok = await prisma.platform.upsert({
    where: { code: "TIKTOK" },
    update: {},
    create: { code: "TIKTOK", name: "TikTok Shop" },
  });

  const customer = await prisma.customer.upsert({
    where: { customerCode: "C0001" },
    update: {},
    create: {
      customerCode: "C0001",
      fullName: "Hòa Lê",
      phone: "0901234567",
      zaloUserId: "zalo-demo-0001",
      zaloDisplayName: "Hòa Lê",
    },
  });

  await prisma.user.upsert({
    where: { email: "khach@demo.vn" },
    update: {},
    create: {
      email: "khach@demo.vn",
      passwordHash,
      fullName: "Hòa Lê",
      role: "customer",
      customerId: customer.id,
    },
  });

  await prisma.commissionRule.upsert({
    where: { id: "seed-default-rule" },
    update: {},
    create: {
      id: "seed-default-rule",
      name: "Mặc định 80/20",
      customerRate: 80,
      systemRate: 20,
      active: true,
    },
  });

  await prisma.voucher.upsert({
    where: { id: "seed-voucher-shopee-1" },
    update: {},
    create: {
      id: "seed-voucher-shopee-1",
      platformId: shopee.id,
      title: "Giảm 50K đơn từ 300K",
      voucherCode: "SHOPEE50K",
      benefitText: "Giảm trực tiếp 50.000đ cho đơn hàng từ 300.000đ",
      status: "active",
      priority: 1,
    },
  });

  await prisma.voucher.upsert({
    where: { id: "seed-voucher-tiktok-1" },
    update: {},
    create: {
      id: "seed-voucher-tiktok-1",
      platformId: tiktok.id,
      title: "Freeship toàn sàn",
      voucherCode: "TTFREESHIP",
      benefitText: "Miễn phí vận chuyển cho mọi đơn hàng",
      status: "active",
      priority: 1,
    },
  });

  await prisma.telegramAccount.upsert({
    where: { id: "seed-telegram-account-1" },
    update: {
      botName: "Affiliate Hoan Tien Bot",
      botUsername: "affiliate_hoantien_lehoa_bot",
      botTokenHint: "configured-via-env",
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/telegram/webhook`,
      status: "active",
    },
    create: {
      id: "seed-telegram-account-1",
      botName: "Affiliate Hoan Tien Bot",
      botUsername: "affiliate_hoantien_lehoa_bot",
      botTokenHint: "configured-via-env",
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/telegram/webhook`,
      status: "active",
    },
  });

  const seedAffiliateUrl = await buildAffiliateUrl(
    "https://shopee.vn/product/123456",
    "SHOPEE_C0001_WEB_20260710_0001",
    buildShopeeSubIds({
      customerCode: customer.customerCode,
      trackingCode: "SHOPEE_C0001_WEB_20260710_0001",
      channelSource: "web",
    }),
    { platformCode: "SHOPEE" }
  );

  const trackingLink = await prisma.trackingLink.upsert({
    where: { trackingCode: "SHOPEE_C0001_WEB_20260710_0001" },
    update: {},
    create: {
      id: "seed-link-1",
      customerId: customer.id,
      platformId: shopee.id,
      channelSource: "web",
      trackingCode: "SHOPEE_C0001_WEB_20260710_0001",
      originalUrl: "https://shopee.vn/product/123456",
      normalizedUrl: "https://shopee.vn/product/123456",
      shortCode: "N8xNQXu",
      shortUrl: buildShortUrl("N8xNQXu"),
      ...buildShopeeSubIds({
        customerCode: customer.customerCode,
        trackingCode: "SHOPEE_C0001_WEB_20260710_0001",
        channelSource: "web",
      }),
      affiliateUrl: seedAffiliateUrl,
      createdByUserId: admin.id,
    },
  });

  await prisma.order.upsert({
    where: { platformId_orderExternalId: { platformId: shopee.id, orderExternalId: "SP20260710001" } },
    update: {},
    create: {
      id: "seed-order-1",
      platformId: shopee.id,
      customerId: customer.id,
      trackingLinkId: trackingLink.id,
      orderExternalId: "SP20260710001",
      trackingCode: trackingLink.trackingCode,
      orderAmount: 350000,
      commissionAmount: 20000,
      customerRewardAmount: 16000,
      systemProfitAmount: 4000,
      orderStatus: "approved",
      payoutStatus: "unpaid",
      sourceType: "import",
      approvedAt: new Date(),
    },
  });

  console.log("Seed hoàn tất.");
  console.log("Đăng nhập admin: admin@demo.vn / Demo@123");
  console.log("Đăng nhập khách: khach@demo.vn / Demo@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
