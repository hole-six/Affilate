import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseImportCsv } from "@/lib/csvImport";
import { parseShopeeAffiliateCsv } from "@/lib/shopeeAffiliateCsv";
import { getActiveCommissionRule, splitCommission } from "@/lib/commission";

// Chuẩn hoá output từ cả 2 parser về cùng shape dùng trong route
type NormRow = {
  rowNumber: number;
  orderExternalId?: string;
  checkoutId?: string;
  trackingCode?: string;
  channel?: string;
  orderedAt?: Date | null;
  completedAt?: Date | null;
  clickedAt?: Date | null;
  shopName?: string | null;
  shopId?: string | null;
  itemId?: string | null;
  itemName?: string | null;
  commissionAmount?: number;
  grossCommissionAmount?: number;
  netCommissionAmount?: number;
  orderAmount?: number;
  orderStatus?: string | null;
  productAffiliateStatus?: string | null;
  subId1?: string | null;
  subId2?: string | null;
  subId3?: string | null;
  subId4?: string | null;
  subId5?: string | null;
  paymentStatus?: string;
  rawData: Record<string, string>;
};

function parseAnyCsv(content: string): NormRow[] {
  // Thử parser Shopee chuẩn trước (header tiếng Việt đầy đủ)
  try {
    const rows = parseShopeeAffiliateCsv(content);
    return rows.map((r, i) => ({
      rowNumber: i + 1,
      orderExternalId: r.externalOrderId || undefined,
      checkoutId: r.checkoutId || undefined,
      trackingCode: r.subId2 || undefined,      // Sub_id2 = trackingCode
      channel: r.channel || undefined,
      orderedAt: r.orderedAt,
      completedAt: r.completedAt,
      clickedAt: r.clickedAt,
      shopName: r.shopName,
      shopId: r.shopId,
      itemId: r.itemId,
      itemName: r.itemName,
      commissionAmount: Number(r.grossCommission),
      grossCommissionAmount: Number(r.grossCommission),
      netCommissionAmount: Number(r.netCommission),
      orderAmount: Number(r.orderAmount),
      orderStatus: r.orderStatus,
      productAffiliateStatus: r.productAffiliateStatus,
      subId1: r.subId1,
      subId2: r.subId2,
      subId3: r.subId3,
      subId4: r.subId4,
      subId5: r.subId5,
      rawData: r.rawRow as unknown as Record<string, string>,
    }));
  } catch {
    // Fallback: generic parser cho các nền tảng khác
    return parseImportCsv(content);
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const mode = (formData.get("mode") as string) || "preview";
  const sourceName = (formData.get("sourceName") as string) || "Không rõ nguồn";
  const platformId = formData.get("platformId") as string | null;

  if (!file || !platformId) {
    return NextResponse.json({ error: "Thiếu file hoặc nền tảng" }, { status: 400 });
  }

  const content = await file.text();
  const rows = parseAnyCsv(content);

  if (mode === "preview") {
    const trackingCodes = rows.map((r) => r.trackingCode).filter(Boolean) as string[];
    const matchedLinks = await prisma.trackingLink.findMany({
      where: { trackingCode: { in: trackingCodes } },
      select: { trackingCode: true },
    });
    const matchedSet = new Set(matchedLinks.map((l) => l.trackingCode));

    return NextResponse.json({
      totalRows: rows.length,
      matchedRows: rows.filter((r) => r.trackingCode && matchedSet.has(r.trackingCode)).length,
      unmappedRows: rows.filter((r) => !r.trackingCode || !matchedSet.has(r.trackingCode)).length,
      preview: rows.slice(0, 20),
    });
  }

  // mode === "commit"
  const uploadDir = path.join(process.cwd(), "storage", "imports");
  await mkdir(uploadDir, { recursive: true });
  const storageKey = `${randomUUID()}-${file.name}`;
  await writeFile(path.join(uploadDir, storageKey), Buffer.from(await file.arrayBuffer()));

  const rule = await getActiveCommissionRule();

  const batch = await prisma.importBatch.create({
    data: {
      sourceName,
      fileName: file.name,
      fileStorageKey: storageKey,
      importedByUserId: session.userId,
      totalRows: rows.length,
      status: "processing",
    },
  });

  let successRows = 0;
  let unmappedRows = 0;
  let errorRows = 0;
  let duplicateRows = 0;

  for (const row of rows) {
    try {
      await prisma.importBatchRow.create({
        data: {
          batchId: batch.id,
          rowNumber: row.rowNumber,
          orderExternalId: row.orderExternalId,
          checkoutId: row.checkoutId,
          trackingCode: row.trackingCode,
          channel: row.channel,
          orderedAt: row.orderedAt,
          completedAt: row.completedAt,
          clickedAt: row.clickedAt,
          shopName: row.shopName,
          shopId: row.shopId,
          itemId: row.itemId,
          itemName: row.itemName,
          commissionAmount: row.commissionAmount,
          grossCommissionAmount: row.grossCommissionAmount,
          netCommissionAmount: row.netCommissionAmount,
          orderAmount: row.orderAmount,
          orderStatus: row.orderStatus,
          productAffiliateStatus: row.productAffiliateStatus,
          subId1: row.subId1,
          subId2: row.subId2,
          subId3: row.subId3,
          subId4: row.subId4,
          subId5: row.subId5,
          paymentStatus: row.paymentStatus,
          rawData: JSON.stringify(row.rawData),
          processingStatus: "pending",
        },
      });

      if (!row.orderExternalId) {
        errorRows++;
        continue;
      }

      const trackingLink = row.trackingCode
        ? await prisma.trackingLink.findUnique({ where: { trackingCode: row.trackingCode } })
        : null;

      if (!trackingLink) unmappedRows++;

      const commissionAmount = row.netCommissionAmount ?? row.commissionAmount ?? 0;
      const split = splitCommission(commissionAmount, rule);

      const existing = await prisma.order.findUnique({
        where: { platformId_orderExternalId: { platformId, orderExternalId: row.orderExternalId } },
      });
      if (existing) duplicateRows++;

      // Đồng bộ trạng thái đơn hàng. Nếu file CSV có trạng thái Shopee (Hoàn thành, Hủy...), ta lưu vào productAffiliateStatus
      // Map trạng thái Shopee sang trạng thái nội bộ:
      // "Hoàn thành" -> "approved"
      // "Đã Hủy", "Đã Huỷ" -> "cancelled"
      // Các trạng thái khác -> "pending"
      const shopeeStatus = (row.orderStatus ?? row.productAffiliateStatus ?? "").toLowerCase();
      let autoMappedStatus = "pending";
      if (shopeeStatus.includes("hoàn thành")) {
        autoMappedStatus = "approved";
      } else if (shopeeStatus.includes("hủy") || shopeeStatus.includes("huỷ")) {
        autoMappedStatus = "cancelled";
      }

      // Nếu đơn đã được duyệt hoặc đã thanh toán (bởi Admin thủ công), ta không ghi đè trạng thái.
      const isLocked = existing && (existing.orderStatus === "approved" || existing.payoutStatus === "paid");
      
      const resolvedCustomerId = existing?.customerId ?? trackingLink?.customerId;
      const resolvedOrderStatus = isLocked ? existing.orderStatus : autoMappedStatus;

      const updatedOrder = await prisma.order.upsert({
        where: { platformId_orderExternalId: { platformId, orderExternalId: row.orderExternalId } },
        update: {
          trackingLinkId: trackingLink?.id || existing?.trackingLinkId,
          customerId: resolvedCustomerId,
          trackingCode: row.trackingCode,
          checkoutId: row.checkoutId,
          channel: row.channel,
          orderedAt: row.orderedAt,
          completedAt: row.completedAt,
          clickedAt: row.clickedAt,
          shopName: row.shopName,
          shopId: row.shopId,
          itemId: row.itemId,
          itemName: row.itemName,
          orderAmount: row.orderAmount,
          grossCommissionAmount: row.grossCommissionAmount,
          netCommissionAmount: row.netCommissionAmount,
          commissionAmount,
          customerRewardAmount: split.customerRewardAmount,
          systemProfitAmount: split.systemProfitAmount,
          orderStatus: resolvedOrderStatus,
          productAffiliateStatus: row.orderStatus ?? row.productAffiliateStatus, // Lưu trạng thái thật của Shopee vào đây
          subId1: row.subId1,
          subId2: row.subId2,
          subId3: row.subId3,
          subId4: row.subId4,
          subId5: row.subId5,
          importBatchId: batch.id,
          rawData: JSON.stringify(row.rawData),
        },
        create: {
          platformId,
          orderExternalId: row.orderExternalId,
          trackingLinkId: trackingLink?.id,
          customerId: trackingLink?.customerId,
          trackingCode: row.trackingCode,
          checkoutId: row.checkoutId,
          channel: row.channel,
          orderedAt: row.orderedAt,
          completedAt: row.completedAt,
          clickedAt: row.clickedAt,
          shopName: row.shopName,
          shopId: row.shopId,
          itemId: row.itemId,
          itemName: row.itemName,
          orderAmount: row.orderAmount,
          grossCommissionAmount: row.grossCommissionAmount,
          netCommissionAmount: row.netCommissionAmount,
          commissionAmount,
          customerRewardAmount: split.customerRewardAmount,
          systemProfitAmount: split.systemProfitAmount,
          orderStatus: autoMappedStatus,
          productAffiliateStatus: row.orderStatus ?? row.productAffiliateStatus,
          subId1: row.subId1,
          subId2: row.subId2,
          subId3: row.subId3,
          subId4: row.subId4,
          subId5: row.subId5,
          importBatchId: batch.id,
          sourceType: "import",
          rawData: JSON.stringify(row.rawData),
        },
      });

      // Handle Referral Bonus
      if (resolvedOrderStatus === "approved" && resolvedCustomerId) {
        const customerData = await prisma.customer.findUnique({
          where: { id: resolvedCustomerId },
          select: { referredById: true, createdAt: true },
        });

        if (customerData?.referredById) {
          const maxOrders = rule?.maxReferralOrders ?? 5;
          const validMonths = rule?.referralValidityMonths ?? 6;
          const referralRate = rule?.referralRate ? Number(rule.referralRate) : 0.05;

          const expirationDate = new Date(customerData.createdAt);
          expirationDate.setMonth(expirationDate.getMonth() + validMonths);
          const isTimeValid = new Date() <= expirationDate;

          if (isTimeValid) {
            const f1OrderCount = await prisma.order.count({
              where: {
                customerId: resolvedCustomerId,
                orderStatus: "approved",
                sourceType: { not: "referral" },
              },
            });

            if (f1OrderCount < maxOrders) {
              const bonusAmount = Number(split.customerRewardAmount) * referralRate;

              await prisma.order.upsert({
                where: { platformId_orderExternalId: { platformId: platformId, orderExternalId: `REF-${row.orderExternalId}` } },
                update: {
                  customerId: customerData.referredById,
                  orderAmount: row.orderAmount,
                  commissionAmount: 0,
                  customerRewardAmount: bonusAmount,
                  systemProfitAmount: 0,
                  orderStatus: "approved",
                  importBatchId: batch.id,
                },
                create: {
                  platformId: platformId,
                  orderExternalId: `REF-${row.orderExternalId}`,
                  customerId: customerData.referredById,
                  trackingCode: "REFERRAL",
                  channel: "REFERRAL",
                  orderedAt: row.orderedAt,
                  completedAt: row.completedAt,
                  shopName: row.shopName,
                  itemName: `Hoa hồng giới thiệu: ${row.orderExternalId}`,
                  orderAmount: row.orderAmount,
                  grossCommissionAmount: 0,
                  netCommissionAmount: 0,
                  commissionAmount: 0,
                  customerRewardAmount: bonusAmount,
                  systemProfitAmount: 0,
                  orderStatus: "approved",
                  sourceType: "referral",
                  importBatchId: batch.id,
                },
              });
            }
          }
        }
      }

      successRows++;
    } catch (err) {
      errorRows++;
    }
  }

  await prisma.importBatch.update({
    where: { id: batch.id },
    data: { successRows, unmappedRows, errorRows, duplicateRows, status: "done" },
  });

  return NextResponse.json({ batchId: batch.id, successRows, unmappedRows, errorRows, duplicateRows });
}
