import { NextRequest, NextResponse } from "next/server";
import { detectPlatform, resolveShortLink, normalizeUrl } from "@/lib/linkConversion";
import { fetchProductInfo } from "@/lib/productInfo";
import { fetchSanCamProductData } from "@/lib/sanCamApi";
import { estimateCashback } from "@/lib/cashbackEstimate";

// Xem trước link KHÔNG cần đăng nhập — cho khách vãng lai "dùng thử trước
// khi đăng ký". KHÔNG ghi DB, không tạo TrackingLink/customer nào, chỉ đọc
// thông tin sản phẩm + ước tính hoàn tiền để hiển thị. Link thật chỉ được
// tạo sau khi khách đăng ký xong, qua /api/links (có session).
export async function POST(req: NextRequest) {
  const { url } = await req.json().catch(() => ({}));
  if (!url?.trim()) {
    return NextResponse.json({ error: "Thiếu link sản phẩm" }, { status: 400 });
  }

  const platform = detectPlatform(url.trim());
  if (platform === "unknown") {
    return NextResponse.json({ error: "Chỉ hỗ trợ link Shopee hoặc TikTok Shop" }, { status: 400 });
  }

  try {
    const resolved = await resolveShortLink(url.trim());
    const normalized = normalizeUrl(resolved);

    // Thử API Sàn Cam trước (nhanh, chính xác, xử lý được cả link /opaanlp/)
    // — chỉ Shopee mới có, TikTok vẫn dùng scrape HTML như cũ.
    const sanCamData = platform === "shopee" ? await fetchSanCamProductData(normalized) : null;
    const productInfo = sanCamData ? null : await fetchProductInfo(normalized);

    const title = sanCamData?.title ?? productInfo?.title ?? null;
    const image = sanCamData?.image ?? productInfo?.image ?? null;
    const price = sanCamData?.price ?? productInfo?.price ?? null;
    const cashback = await estimateCashback(title, price, sanCamData?.commission);

    return NextResponse.json({
      platformCode: platform === "shopee" ? "SHOPEE" : "TIKTOK",
      productTitle: title,
      productImage: image,
      productPrice: price,
      estimatedCashback: cashback ? Number(cashback.estimatedCashback) : null,
      categoryName: cashback?.categoryName ?? null,
    });
  } catch {
    // Không lấy được thông tin sản phẩm (link lạ, site chặn bot...) — vẫn
    // trả về thành công tối thiểu để không chặn khách, chỉ là preview rỗng.
    return NextResponse.json({
      platformCode: platform === "shopee" ? "SHOPEE" : "TIKTOK",
      productTitle: null,
      productImage: null,
      productPrice: null,
      estimatedCashback: null,
      categoryName: null,
    });
  }
}
