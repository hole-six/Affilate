import { prisma } from "./prisma";
import { normalizeUrl, buildAffiliateUrl, resolveShortLink } from "./linkConversion";
import { generateTrackingCode, buildShopeeSubIds } from "./tracking";
import { buildShortUrl, generateShortCode } from "./shortLink";
import { fetchProductInfo } from "./productInfo";
import { fetchShopeeProductDetail } from "./shopeeProductApi";
import { fetchSanCamProductData } from "./sanCamApi";
import { estimateCashback } from "./cashbackEstimate";

export async function createTrackingLink(params: {
  originalUrl: string;
  platformId: string;
  customerId: string;
  channelSource: "web" | "zalo" | "telegram";
  createdByUserId?: string | null;
  manualPrice?: number | null;
}) {
  const [platform, customer] = await Promise.all([
    prisma.platform.findUnique({ where: { id: params.platformId } }),
    prisma.customer.findUnique({ where: { id: params.customerId } }),
  ]);

  if (!platform || !customer) {
    throw new Error("Nen tang hoac khach hang khong hop le");
  }

  const trackingCode = await generateTrackingCode({
    platformCode: platform.code,
    customerCode: customer.customerCode,
    channelSource: params.channelSource,
  });

  const resolvedUrl = await resolveShortLink(params.originalUrl);
  const normalizedUrl = normalizeUrl(resolvedUrl);
  const shortCode = await generateShortCode();
  const shortUrl = buildShortUrl(shortCode);
  const subIds = buildShopeeSubIds({
    customerCode: customer.customerCode,
    trackingCode,
    channelSource: params.channelSource,
  });
  const affiliateUrl = await buildAffiliateUrl(normalizedUrl, trackingCode, subIds, {
    platformCode: platform.code,
  });

  const isShopee = platform.code.toUpperCase() === "SHOPEE";

  // Thử API Sàn Cam (data.addlivetag.com) TRƯỚC — nhanh, chính xác, giải
  // quyết được cả link dạng /opaanlp/ mà scrape HTML không lấy được. Đây là
  // bên thứ 3 không chính thống nên KHÔNG được là phụ thuộc duy nhất — nếu
  // trả về null (lỗi mạng, rate limit, ngừng hoạt động...) thì rơi xuống
  // đúng luồng scrape HTML + Shopee internal API đã dùng từ trước.
  const sanCamData = isShopee ? await fetchSanCamProductData(normalizedUrl) : null;

  const [productInfo, shopeeDetail] = await Promise.all([
    sanCamData ? Promise.resolve(null) : fetchProductInfo(normalizedUrl),
    !sanCamData && isShopee ? fetchShopeeProductDetail(normalizedUrl) : Promise.resolve(null),
  ]);

  const productTitle = sanCamData?.title ?? productInfo?.title ?? shopeeDetail?.name ?? null;
  const productImage = sanCamData?.image ?? productInfo?.image ?? shopeeDetail?.image ?? null;
  // Ưu tiên: nhập tay > Sàn Cam API > JSON-LD (Googlebot scrape) > Shopee internal API
  const productPrice =
    (params.manualPrice && params.manualPrice > 0)
      ? params.manualPrice
      : (sanCamData?.price ?? productInfo?.price ?? shopeeDetail?.price ?? null);
  const productSold = sanCamData?.sold ?? shopeeDetail?.sold ?? productInfo?.sold ?? null;

  const cashback =
    productPrice != null
      ? await estimateCashback(productTitle, productPrice, sanCamData?.commission)
      : null;

  const link = await prisma.trackingLink.create({
    data: {
      customerId: customer.id,
      platformId: platform.id,
      channelSource: params.channelSource,
      trackingCode,
      originalUrl: params.originalUrl,
      normalizedUrl,
      affiliateUrl,
      productTitle,
      productImage,
      productPrice,
      productSold,
      estimatedCashback: cashback?.estimatedCashback ?? null,
      shortCode,
      shortUrl,
      ...subIds,
      createdByUserId: params.createdByUserId ?? null,
    },
    include: { platform: true, customer: true },
  });

  return {
    link,
    generatedLink: affiliateUrl,
    shortCode,
    shortUrl,
    subId: subIds.subId2,
    estimatedCashbackCategory: cashback?.categoryName ?? null,
  };
}
