import { prisma } from "./prisma";
import { normalizeUrl, buildAffiliateUrl, resolveShortLink } from "./linkConversion";
import { generateTrackingCode, buildShopeeSubIds } from "./tracking";
import { buildShortUrl, generateShortCode } from "./shortLink";
import { fetchProductInfo } from "./productInfo";
import { fetchShopeeProductDetail } from "./shopeeProductApi";
import { fetchSanCamProductData } from "./sanCamApi";
import { estimateCashback } from "./cashbackEstimate";
import { buildRioHubSubId, buildTikTokProductSnapshot, createRioHubTikTokProductLink } from "./riohubTikTok";
import { getLazadaLinkByUrl } from "./lazadaApi";

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
    throw new Error("Nền tảng hoặc khách hàng không hợp lệ");
  }
  if (platform.status !== "active") {
    throw new Error("Nền tảng này đang tạm tắt");
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
  const isLazada = platform.code.toUpperCase() === "LAZADA";

  let affiliateUrl: string;
  let tiktokSnapshot: Awaited<ReturnType<typeof buildTikTokProductSnapshot>> | null = null;
  let lazadaProductName: string | null = null;
  let lazadaCommissionRate: number | null = null; // %, vd 24.1
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
  } else if (isLazada) {
    // Lazada's /marketing/getlink chỉ nhận URL sản phẩm trực tiếp (không cần
    // resolveShortLink/normalizeUrl trước như Shopee — link rút gọn Lazada
    // do chính Lazada tự resolve phía server của họ).
    const lazadaLink = await getLazadaLinkByUrl(params.originalUrl, {
      subId1: customer.customerCode,
      subId2: trackingCode,
      subId3: params.channelSource.toUpperCase(),
    });
    affiliateUrl = lazadaLink.promotionLink ?? params.originalUrl;
    lazadaProductName = lazadaLink.productName;
    lazadaCommissionRate = lazadaLink.commission ? parseFloat(lazadaLink.commission) : null;
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

  const productTitle = tiktokSnapshot?.productTitle ?? lazadaProductName ?? sanCamData?.title ?? productInfo?.title ?? shopeeDetail?.name ?? null;
  const productImage = tiktokSnapshot?.productImage ?? sanCamData?.image ?? productInfo?.image ?? shopeeDetail?.image ?? null;
  // Ưu tiên: nhập tay > Sàn Cam API > JSON-LD (Googlebot scrape) > Shopee internal API
  const productPrice =
    (params.manualPrice && params.manualPrice > 0)
      ? params.manualPrice
      : (tiktokSnapshot?.productPrice ?? sanCamData?.price ?? productInfo?.price ?? shopeeDetail?.price ?? null);
  const productSold = tiktokSnapshot?.productSold ?? sanCamData?.sold ?? shopeeDetail?.sold ?? productInfo?.sold ?? null;

  // Lazada getlink chỉ trả TỶ LỆ hoa hồng (vd "24.1%"), không trả số tiền
  // gộp trực tiếp như Shopee/TikTok — tự tính = giá × tỷ lệ khi có đủ cả 2,
  // chính xác hơn đoán theo ngành hàng dù chưa "thật" 100% như Shopee/TikTok.
  const lazadaGrossCommission =
    isLazada && productPrice != null && lazadaCommissionRate != null
      ? (productPrice * lazadaCommissionRate) / 100
      : null;

  const cashback =
    tiktokSnapshot
      ? null
      : productPrice != null
      ? await estimateCashback(productTitle, productPrice, sanCamData?.commission ?? lazadaGrossCommission)
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
