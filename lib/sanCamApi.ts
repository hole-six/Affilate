// Wrapper cho "Sàn Cam Product Data API" (data.addlivetag.com) — bên thứ ba
// KHÔNG CHÍNH THỐNG, tự nhận là chỉ dành cho mục đích học tập/nghiên cứu/nội
// bộ phi thương mại. Được dùng ở đây làm nguồn ƯU TIÊN THỬ TRƯỚC (nhanh hơn,
// chính xác hơn scrape HTML, và giải quyết được các link dạng /opaanlp/ mà
// trước đây không lấy được ảnh/tên) — nhưng KHÔNG được là phụ thuộc duy nhất:
// mọi nơi gọi hàm này đều phải tự fallback về fetchProductInfo()/
// fetchShopeeProductDetail() khi hàm này trả về null (lỗi mạng, rate limit,
// API ngừng hoạt động...).

export type SanCamProductData = {
  title: string | null;
  image: string | null;
  price: number | null;
  sold: number | null;
  // Hoa hồng GỘP thật của đúng sản phẩm này (VNĐ) — dùng làm input cho
  // splitCommission() của hệ thống (đã có sẵn thuế + tỷ lệ 80/20 riêng của
  // iviback), KHÔNG dùng trực tiếp sellerComFinal/shopeeComFinal của API vì
  // 2 giá trị đó tính theo rate/thuế của TÀI KHOẢN CHỦ API, không phải của
  // iviback.
  commission: number | null;
};

const SAN_CAM_API_URL = "https://data.addlivetag.com/product-data/product-data.php";
const FETCH_TIMEOUT_MS = 6000;

export async function fetchSanCamProductData(url: string): Promise<SanCamProductData | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(`${SAN_CAM_API_URL}?url=${encodeURIComponent(url)}`, {
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      console.warn(`[SAN_CAM_API_FALLBACK] HTTP ${res.status} — rơi về scrape HTML cũ`);
      return null;
    }

    const data = await res.json();
    if (data?.status !== "success" || !data?.productInfo) {
      console.warn("[SAN_CAM_API_FALLBACK] status khác success — rơi về scrape HTML cũ");
      return null;
    }

    const info = data.productInfo;
    return {
      title: info.productName ?? null,
      image: info.imageUrl ?? null,
      price: typeof info.price === "number" ? info.price : null,
      sold: typeof info.sales === "number" ? info.sales : null,
      commission: typeof info.commission === "number" ? info.commission : null,
    };
  } catch (err) {
    console.warn(
      "[SAN_CAM_API_FALLBACK] Lỗi gọi API — rơi về scrape HTML cũ:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
