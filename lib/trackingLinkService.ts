import { prisma } from "./prisma";
import { normalizeUrl, buildAffiliateUrl, resolveShortLink } from "./linkConversion";
import { generateTrackingCode, buildShopeeSubIds } from "./tracking";
import { buildShortUrl, generateShortCode } from "./shortLink";
import { fetchProductInfo } from "./productInfo";
import { fetchShopeeProductDetail } from "./shopeeProductApi";
import { fetchSanCamProductData } from "./sanCamApi";
import { estimateCashback } from "./cashbackEstimate";
import { buildRioHubSubId, buildTikTokProductSnapshot, createRioHubTikTokProductLink } from "./riohubTikTok";

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
  if (platform.status !== "active") {
    throw new Error("Nen tang nay dang tam tat");
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
  const isShopee = platform.code.toUpperCase() === "SHOPEE";
  const isTikTok = platform.code.toUpperCase() === "TIKTOK";

  let affiliateUrl: string;
  let tiktokSnapshot: Awaited<ReturnType<typeof buildTikTokProductSnapshot>> | null = null;
  if (isTikTok) {
    const rioHubSubId = buildRioHubSubId({
      customerCode: customer.customerCode,
      trackingCode,
      channelSource: params.channelSource,
    });
    const rioHubLink = await createRioHubTikTokProductLink({
      productUrl: params.originalUrl,
      subId: rioHubSubId,
      channel: params.channelSource,
    });
    affiliateUrl = rioHubLink.affiliate_link;
    tiktokSnapshot = await buildTikTokProductSnapshot(rioHubLink.product);
    subIds.subId1 = customer.customerCode;
    subIds.subId2 = trackingCode;
    subIds.subId3 = params.channelSource.toUpperCase();
    subIds.subId4 = "";
    subIds.subId5 = "";
  } else {
    affiliateUrl = await buildAffiliateUrl(normalizedUrl, trackingCode, subIds, {
      platformCode: platform.code,
    });
  }

  // Thử API Sàn Cam (data.addlivetag.com) TRƯỚC — nhanh, chính xác, giải
  // quyết được cả link dạng /opaanlp/ mà scrape HTML không lấy được. Đây là
  // bên thứ 3 không chính thống nên KHÔNG được là phụ thuộc duy nhất — nếu
  // trả về null (lỗi mạng, rate limit, ngừng hoạt động...) thì rơi xuống
  // đúng luồng scrape HTML + Shopee internal API đã dùng từ trước.
  const sanCamData = isShopee ? await fetchSanCamProductData(normalizedUrl) : null;

  const [productInfo, shopeeDetail] = await Promise.all([
    sanCamData || tiktokSnapshot ? Promise.resolve(null) : fetchProductInfo(normalizedUrl),
    !sanCamData && isShopee ? fetchShopeeProductDetail(normalizedUrl) : Promise.resolve(null),
  ]);

  const productTitle = tiktokSnapshot?.productTitle ?? sanCamData?.title ?? productInfo?.title ?? shopeeDetail?.name ?? null;
  const productImage = tiktokSnapshot?.productImage ?? sanCamData?.image ?? productInfo?.image ?? shopeeDetail?.image ?? null;
  // Ưu tiên: nhập tay > Sàn Cam API > JSON-LD (Googlebot scrape) > Shopee internal API
  const productPrice =
    (params.manualPrice && params.manualPrice > 0)
      ? params.manualPrice
      : (tiktokSnapshot?.productPrice ?? sanCamData?.price ?? productInfo?.price ?? shopeeDetail?.price ?? null);
  const productSold = tiktokSnapshot?.productSold ?? sanCamData?.sold ?? shopeeDetail?.sold ?? productInfo?.sold ?? null;

  const cashback =
    tiktokSnapshot
      ? null
      : productPrice != null
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
      estimatedCashback: tiktokSnapshot?.estimatedCashback ?? cashback?.estimatedCashback ?? null,
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
    estimatedCashbackCategory: tiktokSnapshot?.estimatedCashbackCategory ?? cashback?.categoryName ?? null,
  };
}
