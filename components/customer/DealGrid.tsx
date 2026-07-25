"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MousePointerClick, Flame, Tag, SlidersHorizontal } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { DEAL_CATEGORIES } from "@/lib/dealCategories";

type Deal = {
  id: string;
  title: string;
  description: string | null;
  originalPrice: number | null;
  salePrice: number | null;
  discountPercent: number | null;
  category: string | null;
  expiresAt: string | null;
  imageUrl: string | null;
  shortUrl: string | null;
  clicks: number;
  createdAt: string;
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

function formatExpiry(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function DealCard({ deal }: { deal: Deal }) {
  const [clicked, setClicked] = useState(false);

  function handleClick() {
    setClicked(true);
    // Dùng short URL trên domain của mình nếu có, fallback về API redirect
    const target = deal.shortUrl || `/api/deals/${deal.id}/click`;
    window.open(target, "_blank");
    setTimeout(() => setClicked(false), 1500);
  }

  const discount = deal.discountPercent
    ?? (deal.originalPrice && deal.salePrice
      ? Math.round((1 - deal.salePrice / deal.originalPrice) * 100)
      : null);

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100 hover:ring-[#e86a33]/20 active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {deal.imageUrl ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
            <Flame size={40} className="text-[#e86a33]/30" strokeWidth={1.5} />
          </div>
        )}

        {/* Discount badge */}
        {discount && discount > 0 && (
          <div className="absolute top-2 left-2 flex flex-col items-center justify-center rounded-xl bg-[#ee4d2d] px-2 py-1 shadow-md">
            <span className="text-[10px] font-medium text-white/80 leading-none">Giảm</span>
            <span className="text-[13px] font-black text-white leading-tight">{discount}%</span>
          </div>
        )}

        {/* Expiry badge */}
        {deal.expiresAt && (
          <div className="absolute top-2 right-2 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            HH: {formatExpiry(deal.expiresAt)}
          </div>
        )}

        {/* Hot badge */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            <MousePointerClick size={10} /> Mua ngay
          </span>
        </div>

        {/* Click overlay */}
        {clicked && (
          <div className="absolute inset-0 bg-[#e86a33]/20 flex items-center justify-center animate-in fade-in zoom-in-95 duration-150">
            <div className="rounded-full bg-white/90 px-md py-sm text-[13px] font-bold text-[#e86a33] shadow-lg">
              Đang mở Shopee... 🛒
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-xs p-md">
        <p className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2 min-h-[40px]">
          {deal.title}
        </p>

        {/* Pricing */}
        <div className="mt-auto">
          {deal.salePrice ? (
            <div className="flex flex-col">
              <span className="text-[16px] font-black text-[#ee4d2d] tabular-nums">
                {formatPrice(deal.salePrice)}
              </span>
              {deal.originalPrice && (
                <span className="text-[12px] text-gray-400 line-through tabular-nums">
                  {formatPrice(deal.originalPrice)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[13px] font-bold text-[#e86a33]">Xem giá trên Shopee</span>
          )}
        </div>

        {/* Footer: clicks + platform */}
        <div className="flex items-center justify-between border-t border-gray-50 pt-xs mt-xs">
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <MousePointerClick size={11} />
            {deal.clicks > 0 ? `${deal.clicks.toLocaleString()} lượt` : "Mới đăng"}
          </span>
          <span className="rounded-md bg-[#ee4d2d]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#ee4d2d] uppercase">
            Shopee
          </span>
        </div>
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "discount", label: "% hoàn cao nhất" },
  { value: "clicks", label: "Nhiều lượt dùng nhất" },
];

function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const platform = searchParams.get("platform") || "all";
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value === "all" || value === "newest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const selectClass =
    "h-10 rounded-xl bg-gray-50 px-md text-[13px] font-medium text-gray-900 ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-[#e86a33]/50 transition-all";

  return (
    <div className="mb-lg flex flex-wrap items-center gap-sm">
      <span className="flex items-center gap-1 text-[12px] font-bold text-gray-400 uppercase tracking-wide">
        <SlidersHorizontal size={13} /> Lọc
      </span>
      <select value={platform} onChange={(e) => updateParam("platform", e.target.value)} className={selectClass}>
        <option value="all">Tất cả sàn</option>
        <option value="SHOPEE">Shopee</option>
        <option value="TIKTOK">TikTok Shop</option>
      </select>
      <select value={category} onChange={(e) => updateParam("category", e.target.value)} className={selectClass}>
        <option value="all">Tất cả danh mục</option>
        {DEAL_CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select value={sort} onChange={(e) => updateParam("sort", e.target.value)} className={selectClass}>
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function DealGrid({ deals, totalPages, currentPage, hasQuery }: { deals: Deal[], totalPages?: number, currentPage?: number, hasQuery?: boolean }) {
  return (
    <div>
      <FilterBar />

      {deals.length === 0 ? (
        <div className="flex flex-col items-center py-3xl text-center">
          <div className="text-6xl mb-lg">🛒</div>
          <p className="text-[16px] font-bold text-gray-400">
            {hasQuery ? "Không tìm thấy ưu đãi phù hợp" : "Chưa có ưu đãi nào"}
          </p>
          <p className="text-[13px] text-gray-300 mt-xs">
            {hasQuery ? "Thử đổi bộ lọc hoặc từ khoá khác xem sao!" : "Quay lại sau nhé, admin đang cập nhật deal mới!"}
          </p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-md">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages && currentPage && (
            <Pagination totalPages={totalPages} currentPage={currentPage} />
          )}

          {/* Footer note */}
          <div className="mt-xl flex items-center justify-center gap-sm text-[12px] text-gray-400">
            <Flame size={13} className="text-[#e86a33]" />
            <span>Bấm vào sản phẩm để mua trực tiếp trên Shopee và nhận hoàn tiền</span>
          </div>
        </>
      )}
    </div>
  );
}
