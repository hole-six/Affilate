"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Check, Copy, ExternalLink, Link2, Plus, Package, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Card } from "@/components/ui/Card";
import { ShopeeIcon, TiktokIcon } from "@/components/icons/PlatformIcons";
import { formatCurrency } from "@/lib/format";

type Option = { id: string; code: string; label: string };
type LinkResult = {
  shortUrl: string;
  generatedLink: string;
  trackingCode: string;
  shortCode: string;
  productTitle: string | null;
  productImage: string | null;
  productPrice: number | string | null;
  estimatedCashback: number | string | null;
};

// Brand icons render their own colors, so the wrapper skips tinting for them.
const PLATFORM_STYLE: Record<string, { icon: typeof ShopeeIcon; color: string; branded: boolean }> = {
  SHOPEE: { icon: ShopeeIcon, color: "#ee4d2d", branded: true },
  TIKTOK: { icon: TiktokIcon, color: "#000000", branded: true },
};

function platformStyle(code: string) {
  return PLATFORM_STYLE[code.toUpperCase()] ?? { icon: Store, color: "#454745", branded: false };
}

export function CustomerLinkForm({ platforms }: { platforms: Option[] }) {
  const router = useRouter();
  const [platformId, setPlatformId] = useState(platforms[0]?.id ?? "");
  const [originalUrl, setOriginalUrl] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LinkResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);

  const selectedPlatform = platforms.find((p) => p.id === platformId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setImgBroken(false);

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalUrl,
        platformId,
        channelSource: "web",
        productPrice: productPrice ? Number(productPrice) : undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Không tạo được link");
      return;
    }

    const data = await res.json();
    setResult({
      shortUrl: data.link.shortUrl,
      generatedLink: data.link.generatedLink,
      trackingCode: data.link.trackingCode,
      shortCode: data.link.shortCode,
      productTitle: data.link.productTitle ?? null,
      productImage: data.link.productImage ?? null,
      productPrice: data.link.productPrice ?? null,
      estimatedCashback: data.link.estimatedCashback ?? null,
    });
    setOriginalUrl("");
    setProductPrice("");
    router.refresh();
  }

  function copyLink() {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-xl">
      {/* Platform selection (1 Chọn nền tảng) */}
      <div>
        <div className="mb-md flex items-center gap-sm">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e86a33] text-[12px] font-bold text-white shadow-sm">
            1
          </span>
          <span className="text-[15px] font-bold text-gray-900">Chọn nền tảng</span>
        </div>
        
        <div className="flex flex-wrap gap-md">
          {platforms.map((p) => {
            const style = platformStyle(p.code);
            const Icon = style.icon;
            const active = p.id === platformId;
            const isTiktok = p.code.toUpperCase() === "TIKTOK";
            return (
              <div key={p.id} className="relative">
                <button
                  type="button"
                  onClick={() => !isTiktok && setPlatformId(p.id)}
                  disabled={isTiktok}
                  className={`group flex h-[88px] w-[100px] flex-col items-center justify-center gap-xs rounded-2xl border transition-all duration-200 ${
                    isTiktok
                      ? "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                      : active
                      ? "border-[#e86a33] bg-white shadow-[0_4px_12px_rgba(232,106,51,0.15)] scale-105"
                      : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-1 hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 ${active && !isTiktok ? "scale-110" : "group-hover:scale-110"}`}
                    style={{ color: style.color, backgroundColor: `${style.color}15` }}
                  >
                    <Icon size={22} />
                  </div>
                  <span className={`text-[12px] font-bold ${active && !isTiktok ? "text-gray-900" : "text-gray-500"}`}>
                    {p.label}
                  </span>
                </button>
                {isTiktok && (
                  <span className="absolute -top-1 -right-1 rounded-full bg-gray-400 px-[5px] py-[1px] text-[9px] font-bold text-white leading-tight">
                    Tạm tắt
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Input area (2 Dán link) */}
      <div className="rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/5">
        <div className="mb-md flex items-center gap-sm">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e86a33] text-[12px] font-bold text-white shadow-sm">
            2
          </span>
          <span className="text-[14px] font-bold text-gray-900">
            Dán link {selectedPlatform?.label ?? "sản phẩm"}
          </span>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div className="flex flex-col gap-md sm:flex-row sm:items-end">
            <div className="flex-1">
              <TextInput
                placeholder={`Dán link ${selectedPlatform?.label ?? "sản phẩm"} muốn hoàn tiền vào đây...`}
                required
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 focus:border-[#e86a33] focus:ring-[#e86a33]/20"
              />
            </div>
            <div className="sm:w-[180px]">
              <TextInput
                type="number"
                min={0}
                placeholder="Giá sản phẩm (tuỳ chọn)"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 focus:border-[#e86a33] focus:ring-[#e86a33]/20"
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-400">
            Nhập giá sản phẩm để xem ước tính số tiền hoàn — Shopee chưa cho hệ thống tự lấy giá.
          </p>
          <Button
            type="submit"
            disabled={loading || !platformId}
            className="h-12 w-fit bg-[#e86a33] text-white hover:bg-[#d65d2a] hover:shadow-md hover:shadow-[#e86a33]/30 active:bg-[#c25324] focus-visible:ring-[#e86a33]"
          >
            {loading ? "Đang tạo..." : (
              <>
                <Plus size={16} strokeWidth={2.5} />
                Tạo link
              </>
            )}
          </Button>
        </form>
        {error && <div className="mt-sm text-[13px] font-medium text-red-500">{error}</div>}
      </div>

      {/* Result Card */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md fade-in">
          {/* Panel trai: THONG TIN SAN PHAM */}
          <div className="rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/5">
            <div className="mb-md flex items-center gap-xs text-[12px] font-bold uppercase tracking-wider text-gray-500">
              <Package size={14} strokeWidth={2.5} />
              Thông tin sản phẩm
            </div>
            <div className="flex gap-md">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-black/5 overflow-hidden">
                {result.productImage && !imgBroken ? (
                  <img
                    src={result.productImage}
                    alt=""
                    onError={() => setImgBroken(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Link2 size={24} strokeWidth={1.5} className="text-[#e86a33]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[14px] font-bold text-gray-900 leading-snug">
                  {result.productTitle ?? "Sản phẩm mua sắm"}
                </p>
                <div className="mt-sm flex items-center gap-xs flex-wrap">
                  <span className="rounded-md bg-[#e86a33]/10 px-sm py-[2px] text-[11px] font-bold text-[#e86a33]">
                    {selectedPlatform?.label ?? "Sản phẩm"}
                  </span>
                  {result.productPrice != null && (
                    <span className="text-[12px] font-semibold text-gray-500">
                      {formatCurrency(result.productPrice)}
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-gray-400 truncate">{result.trackingCode}</span>
                </div>
              </div>
            </div>

            {result.estimatedCashback != null && Number(result.estimatedCashback) > 0 && (
              <div className="mt-md flex items-center gap-sm rounded-xl bg-emerald-50 px-md py-sm ring-1 ring-emerald-100">
                <Wallet size={16} strokeWidth={2.25} className="text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[13px] font-black text-emerald-700 leading-tight">
                    Hoàn tiền ước tính {formatCurrency(result.estimatedCashback)}
                  </p>
                  <p className="text-[11px] text-emerald-600/80 leading-tight">
                    Số tiền thực nhận có thể khác, tuỳ hoa hồng Shopee ghi nhận cho đơn này
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Panel phai: LINK HOAN TIEN CUA BAN */}
          <div className="rounded-2xl bg-[#2bc48a]/10 p-lg ring-1 ring-[#2bc48a]/20">
            <div className="mb-md flex items-center gap-xs text-[12px] font-bold uppercase tracking-wider text-[#1f9c6d]">
              <Sparkles size={14} strokeWidth={2.5} />
              Link hoàn tiền của bạn
            </div>
            <input
              readOnly
              value={result.shortUrl}
              onFocus={(e) => e.target.select()}
              className="mb-md h-11 w-full rounded-xl bg-white px-md text-[13px] font-medium text-gray-700 ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-[#2bc48a]/40"
            />
            <div className="flex gap-sm">
              <Button
                type="button"
                onClick={copyLink}
                className="flex-1 bg-[#2bc48a] text-white hover:bg-[#25ad7a] hover:shadow-md hover:shadow-[#2bc48a]/30"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Đã copy" : "Copy link"}
              </Button>
              <a href={result.shortUrl} target="_blank" rel="noreferrer">
                <Button type="button" variant="tertiary">
                  <ExternalLink size={16} />
                  Mở
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
