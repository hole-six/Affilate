"use client";

import { useState } from "react";
import { Store, ShoppingBag, Music2, Copy, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Pagination } from "@/components/ui/Pagination";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
import { useModal } from "@/components/ui/ModalProvider";

const PLATFORM_STYLE: Record<string, { icon: typeof ShoppingBag; color: string }> = {
  SHOPEE: { icon: ShoppingBag, color: "#ee4d2d" },
  TIKTOK: { icon: Music2, color: "#000000" },
  LAZADA: { icon: Store, color: "#0f146d" },
  TIKI: { icon: Store, color: "#1a73e8" },
};

type LinkItem = {
  id: string;
  createdAt: string;
  shortCode: string;
  shortUrl: string | null;
  productTitle: string | null;
  productImage: string | null;
  platform: { code: string; name: string };
};

function ProductThumb({ image, color, Icon }: { image: string | null; color: string; Icon: typeof ShoppingBag }) {
  const [broken, setBroken] = useState(false);
  if (image && !broken) {
    return (
      <img
        src={image}
        alt=""
        onError={() => setBroken(true)}
        className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-black/5"
      />
    );
  }
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
      style={{ color, backgroundColor: `${color}15` }}
    >
      <Icon size={20} strokeWidth={2} />
    </div>
  );
}

export function RefundHistoryClient({ links, totalPages, currentPage, totalCount }: { links: LinkItem[], totalPages: number, currentPage: number, totalCount: number }) {
  const modal = useModal();
  
  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    modal.alert({
      title: "Thành công",
      message: "Đã copy link: " + url,
      iconType: "success"
    });
  };

  return (
    <div className="rounded-2xl bg-white p-xl shadow-sm ring-1 ring-black/5">
      <div className="mb-lg flex items-center justify-between border-b border-gray-100 pb-md">
        <h2 className="text-[16px] font-bold text-gray-900">Lịch sử tạo link</h2>
        <span className="text-[13px] font-medium text-gray-400">{totalCount} link</span>
      </div>

      <div className="mb-md">
        <ServerSearchInput placeholder="Tìm kiếm theo mã link (shortCode)..." />
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center py-xl text-center">
          <span className="text-[40px] opacity-50 mb-sm">🛒</span>
          <div className="text-[14px] font-semibold text-gray-700">Không tìm thấy link nào</div>
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {links.map((l) => {
            const pStyle = PLATFORM_STYLE[l.platform.code.toUpperCase()] ?? { icon: Store, color: "#454745" };
            const Icon = pStyle.icon;
            
            return (
              <div key={l.id} className="group flex items-center justify-between gap-lg rounded-2xl border border-gray-100 p-md transition-all hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm">
                <div className="flex flex-1 items-center gap-md min-w-0">
                  <ProductThumb image={l.productImage} color={pStyle.color} Icon={Icon} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-xs text-[11px] font-bold uppercase tracking-wider" style={{ color: pStyle.color }}>
                      {l.platform.name}
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-400 font-medium normal-case tracking-normal">{l.createdAt}</span>
                    </div>
                    <p className="mt-[2px] truncate text-[14px] font-bold text-gray-900">
                      {l.productTitle ?? `Sản phẩm từ ${l.platform.name} (${l.shortCode})`}
                    </p>
                    <a href={l.shortUrl ?? "#"} target="_blank" rel="noreferrer" className="mt-[2px] block truncate text-[12px] font-medium text-gray-400 transition-colors hover:text-[#e86a33]">
                      {l.shortUrl}
                    </a>
                  </div>
                </div>
                
                <div className="flex shrink-0 items-center gap-sm">
                  <button 
                    onClick={() => handleCopy(l.shortUrl ?? "")}
                    className="flex h-9 items-center gap-xs rounded-lg bg-gray-100 px-sm text-[13px] font-bold text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
                  >
                    <Copy size={14} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                  <a href={l.shortUrl ?? "#"} target="_blank" rel="noreferrer">
                    <button className="flex h-9 items-center gap-xs rounded-lg bg-[#2bc48a] px-sm text-[13px] font-bold text-white transition-colors hover:bg-[#25ad7a] hover:shadow-md hover:shadow-[#2bc48a]/20">
                      <ExternalLink size={14} strokeWidth={2.5} />
                      <span className="hidden sm:inline">Mở</span>
                    </button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-md border-t border-gray-100 pt-md">
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
}
