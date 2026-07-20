import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resolveShortLink, normalizeUrl, buildAffiliateUrl } from "@/lib/linkConversion";
import { generateShortCode, buildShortUrl } from "@/lib/shortLink";
import { fetchProductInfo } from "@/lib/productInfo";

// Tất cả params affiliate thường thấy của đối thủ
const COMPETITOR_PARAMS = [
  "mmp_pid", "uls_trackid", "utm_source", "utm_medium", "utm_campaign",
  "utm_content", "utm_term", "af_siteid", "af_sub_siteid", "pid",
  "cns", "affiliate_id", "sub_id", "sub_id1", "sub_id2", "sub_id3",
  "sub_id4", "sub_id5", "click_id", "sp_atk", "xptdk", "smtt",
  "share_channel_code", "deep_and_deferred", "is_from_login", "action_from",
  "credential_token", "exp_group", "gads_t_sig",
];

function stripCompetitorParams(url: string): string {
  try {
    const parsed = new URL(url);
    COMPETITOR_PARAMS.forEach((p) => parsed.searchParams.delete(p));
    return parsed.toString();
  } catch {
    return url;
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { url } = await req.json();
  if (!url?.trim()) {
    return NextResponse.json({ error: "Thiếu link" }, { status: 400 });
  }

  const resolved = await resolveShortLink(url.trim());
  const normalized = normalizeUrl(resolved);
  const cleanLink = stripCompetitorParams(normalized);

  // Pre-generate shortCode để hiện ngay cho admin ở bước 2, đồng thời dùng
  // luôn làm sub_id khi build link affiliate — trước đây route này tự ráp
  // link Shopee tay (chỉ có origin_link + affiliate_id) nên KHÔNG có sub_id,
  // khiến Shopee không đối soát được click/đơn nào sinh ra từ deal.
  const shortCode = await generateShortCode();
  const shortUrl = buildShortUrl(shortCode);

  const affiliateId = process.env.SHOPEE_AFFILIATE_ID;
  const affiliateUrl =
    affiliateId && cleanLink.includes("shopee.vn")
      ? await buildAffiliateUrl(cleanLink, shortCode, undefined, { platformCode: "SHOPEE" })
      : cleanLink;

  const productInfo = await fetchProductInfo(cleanLink);

  return NextResponse.json({
    rawInputLink: url.trim(),
    cleanLink,
    affiliateUrl,
    shortCode,   // trả về để client giữ và truyền lên khi tạo deal
    shortUrl,    // link đã dạng tên miền của mình, hiện ngay cho admin
    productTitle: productInfo?.title ?? null,
    shopeeImageUrl: productInfo?.image ?? null,
  });
}

