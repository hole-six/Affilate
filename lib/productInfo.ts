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

export type ProductInfo = {
  title: string | null;
  image: string | null;
};

/**
 * Best-effort scrape of a product page's Open Graph tags. Shopee/TikTok
 * render most content client-side and may block bot traffic, so this
 * frequently returns nulls — callers must treat the result as optional.
 */
export async function fetchProductInfo(url: string): Promise<ProductInfo | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();
    const title = extractMeta(html, "og:title");
    const image = extractMeta(html, "og:image");

    if (!title && !image) return null;
    return { title, image };
  } catch {
    return null;
  }
}
