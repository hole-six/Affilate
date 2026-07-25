"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2, ArrowRight, Sparkles } from "lucide-react";

export const PENDING_LINK_STORAGE_KEY = "iviback_pending_link";

type PreviewResult = {
  platformCode: string;
  productTitle: string | null;
  productImage: string | null;
  productPrice: number | null;
  estimatedCashback: number | null;
  categoryName: string | null;
};

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

export function DemoConvertLink() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const res = await fetch("/api/links/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không phân tích được link");
      setPreview(data);
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra, thử lại nhé");
    } finally {
      setLoading(false);
    }
  }

  function handleRegisterCta() {
    try {
      localStorage.setItem(PENDING_LINK_STORAGE_KEY, url.trim());
    } catch {
      // localStorage có thể bị chặn (chế độ ẩn danh nghiêm ngặt) — vẫn cho
      // đăng ký bình thường, chỉ là không tự tạo link demo sau đó.
    }
    router.push("/register");
  }

  return (
    <div className="rounded-[28px] bg-white/90 backdrop-blur-sm p-lg shadow-lg shadow-black/5 border border-primary/10 max-w-lg">
      <form onSubmit={handlePreview} className="flex flex-col sm:flex-row gap-sm">
        <div className="relative flex-1">
          <Link2 size={16} className="pointer-events-none absolute left-md top-1/2 -translate-y-1/2 text-mute" />
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setPreview(null); setError(null); }}
            placeholder="Dán link Shopee/TikTok để xem thử..."
            className="h-12 w-full rounded-2xl bg-canvas-soft/60 pl-10 pr-md text-[13px] font-medium text-ink placeholder:text-mute/70 ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="h-12 shrink-0 rounded-2xl bg-ink px-lg text-[13px] font-bold text-white transition-all hover:bg-ink/90 disabled:opacity-50 flex items-center justify-center gap-xs"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {loading ? "Đang xem..." : "Xem thử"}
        </button>
      </form>

      {error && (
        <p className="mt-sm text-[12px] font-medium text-negative-darkest">{error}</p>
      )}

      {preview && (
        <div className="mt-md flex items-center gap-md rounded-2xl bg-primary-pale/40 p-md fade-in">
          {preview.productImage ? (
            <img src={preview.productImage} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
          ) : (
            <div className="h-14 w-14 shrink-0 rounded-xl bg-primary/10" />
          )}
          <div className="min-w-0 flex-1">
            {preview.productTitle && (
              <p className="truncate text-[12px] font-semibold text-ink">{preview.productTitle}</p>
            )}
            <p className="text-[13px] font-black text-primary">
              {preview.estimatedCashback
                ? `Ước tính hoàn ~${formatVnd(preview.estimatedCashback)}`
                : "Link đã sẵn sàng!"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRegisterCta}
            className="shrink-0 flex items-center gap-1 rounded-xl bg-primary px-md py-sm text-[12px] font-bold text-white shadow-sm shadow-primary/30 hover:bg-primary-active transition-all"
          >
            Nhận hoàn tiền
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
