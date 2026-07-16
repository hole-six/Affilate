const FETCH_TIMEOUT_MS = 5000;

function extractMeta(html: string, property: string): string | null {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  const reversed = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
    "i"
  );
  const match = html.match(pattern) ?? html.match(reversed);
  if (!match) return null;
  return match[1]
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim() || null;
}

/**
 * Trích xuất giá từ JSON-LD schema (schema.org/Product > offers.price).
 * Shopee inject block này cho Googlebot và các crawler có thể đọc được giá.
 */
function extractJsonLdPrice(html: string): number | null {
  try {
    // Tìm tất cả <script type="application/ld+json"> blocks
    const scriptPattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;
    while ((match = scriptPattern.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        const entries = Array.isArray(data) ? data : [data];
        for (const entry of entries) {
          // Xử lý @graph array (Google thường dùng)
          const nodes = entry["@graph"] ? [...entry["@graph"], entry] : [entry];
          for (const node of nodes) {
            if (node["@type"] === "Product" || node["@type"]?.includes?.("Product")) {
              const offers = node.offers ?? node.Offers;
              if (!offers) continue;
              const offerList = Array.isArray(offers) ? offers : [offers];
              for (const offer of offerList) {
                const price = offer.price ?? offer.lowPrice ?? offer.highPrice;
                if (price != null) {
                  const parsed = parseFloat(String(price).replace(/[^0-9.]/g, ""));
                  if (!isNaN(parsed) && parsed > 0) return parsed;
                }
              }
            }
          }
        }
      } catch {
        // JSON parse failed, thử block tiếp theo
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Trích xuất số lượng đã bán từ JSON-LD hoặc meta.
 */
function extractSold(html: string): number | null {
  try {
    const scriptPattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;
    while ((match = scriptPattern.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        const entries = Array.isArray(data) ? data : [data];
        for (const entry of entries) {
          const nodes = entry["@graph"] ? [...entry["@graph"], entry] : [entry];
          for (const node of nodes) {
            if (node["@type"] === "Product") {
              // aggregateRating.reviewCount dùng tạm để detect, sold thường không có trong schema
              const agg = node.aggregateRating;
              if (agg?.reviewCount) return Number(agg.reviewCount);
            }
          }
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export type ProductInfo = {
  title: string | null;
  image: string | null;
  price: number | null;   // giá gốc (VNĐ)
  sold: number | null;    // số lượng đã bán (nếu có)
};

/**
 * Best-effort scrape: lấy Open Graph tags + JSON-LD schema để lấy thêm giá.
 * Shopee/TikTok render JSON-LD cho Googlebot — giả mạo UA Googlebot để đọc.
 * Fallback về Facebook UA nếu Googlebot bị chặn.
 */
export async function fetchProductInfo(url: string): Promise<ProductInfo | null> {
  const UAS = [
    // Googlebot — Shopee render JSON-LD đầy đủ cho UA này
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    // Facebook crawler — lấy được og:title + og:image
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  ];

  for (const ua of UAS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": ua,
          Accept: "text/html",
          "Accept-Language": "vi-VN,vi;q=0.9",
        },
      });
      clearTimeout(timeout);

      if (!res.ok) continue;

      const html = await res.text();
      const title = extractMeta(html, "og:title");
      const image = extractMeta(html, "og:image");
      const price = extractJsonLdPrice(html);
      const sold = extractSold(html);

      // Nếu không lấy được gì từ UA này, thử UA tiếp theo
      if (!title && !image && price == null) continue;

      return { title, image, price, sold };
    } catch {
      continue;
    }
  }

  return null;
}
