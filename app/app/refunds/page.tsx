import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { CustomerLinkForm } from "@/components/customer/CustomerLinkForm";
import { ShoppingBag, Music2, Store, Copy, ExternalLink, Lightbulb } from "lucide-react";

const PLATFORM_STYLE: Record<string, { icon: typeof ShoppingBag; color: string }> = {
  SHOPEE: { icon: ShoppingBag, color: "#ee4d2d" },
  TIKTOK: { icon: Music2, color: "#000000" },
  LAZADA: { icon: Store, color: "#0f146d" },
  TIKI: { icon: Store, color: "#1a73e8" },
};

export default async function CustomerRefundsPage() {
  const session = await getSession();
  if (!session?.customerId) redirect("/admin");

  const [platforms, links] = await Promise.all([
    prisma.platform.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
    prisma.trackingLink.findMany({
      where: { customerId: session.customerId },
      orderBy: { createdAt: "desc" },
      include: { platform: true },
      take: 5,
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-xl fade-in pb-2xl">
      {/* HEADER CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 p-2xl flex items-center justify-between">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-[#fff0e6] to-transparent opacity-60" />
        
        <div className="relative z-10">
          <h1 className="text-[32px] font-black tracking-tight text-gray-900">
            Tạo link hoàn tiền
          </h1>
          <p className="mt-xs text-[15px] text-gray-500 font-medium">
            Chọn sàn và dán link sản phẩm để lấy hoàn tiền
          </p>
        </div>

        {/* Mascot / Icon Placeholder */}
        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-[#fff0e6] shadow-sm">
          <span className="text-[48px]">🥑</span>
        </div>
      </div>

      {/* FORM: CHỌN NỀN TẢNG & TẠO LINK */}
      <CustomerLinkForm platforms={platforms.map((p) => ({ id: p.id, code: p.code, label: p.name }))} />

      {/* HISTORY CARD */}
      <div className="rounded-2xl bg-white p-xl shadow-sm ring-1 ring-black/5">
        <div className="mb-lg flex items-center justify-between border-b border-gray-100 pb-md">
          <h2 className="text-[16px] font-bold text-gray-900">Lịch sử tạo link</h2>
          <span className="text-[13px] font-medium text-gray-400">{links.length} link</span>
        </div>

        {links.length === 0 ? (
          <div className="flex flex-col items-center py-xl text-center">
            <span className="text-[40px] opacity-50 mb-sm">🛒</span>
            <div className="text-[14px] font-semibold text-gray-700">Chưa có link nào</div>
            <div className="mt-xs text-[13px] text-gray-400">Tạo link hoàn tiền đầu tiên của bạn ở phía trên!</div>
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            {links.map((l) => {
              const pStyle = PLATFORM_STYLE[l.platform.code.toUpperCase()] ?? { icon: Store, color: "#454745" };
              const Icon = pStyle.icon;
              
              return (
                <div key={l.id} className="group flex items-center justify-between gap-lg rounded-2xl border border-gray-100 p-md transition-all hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm">
                  <div className="flex flex-1 items-center gap-md min-w-0">
                    <div 
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ color: pStyle.color, backgroundColor: `${pStyle.color}15` }}
                    >
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-xs text-[11px] font-bold uppercase tracking-wider" style={{ color: pStyle.color }}>
                        {l.platform.name}
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400 font-medium normal-case tracking-normal">{formatDate(l.createdAt)}</span>
                      </div>
                      <p className="mt-[2px] truncate text-[14px] font-bold text-gray-900">
                        {/* We don't store product title yet, so we show the short code or tracking code as title */}
                        Sản phẩm từ {l.platform.name} ({l.shortCode})
                      </p>
                      <a href={l.shortUrl ?? "#"} target="_blank" rel="noreferrer" className="mt-[2px] block truncate text-[12px] font-medium text-gray-400 transition-colors hover:text-[#e86a33]">
                        {l.shortUrl}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex shrink-0 items-center gap-sm">
                    {/* Copy Button (Mock functionality, mostly visual in server component) */}
                    <button className="flex h-9 items-center gap-xs rounded-lg bg-gray-100 px-sm text-[13px] font-bold text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900">
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
      </div>

      {/* NOTES CARD */}
      <div className="rounded-2xl bg-[#fffcf5] p-xl ring-1 ring-[#f59e0b]/20">
        <div className="mb-md flex items-center gap-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f59e0b]/10 text-[#f59e0b]">
            <Lightbulb size={18} strokeWidth={2} />
          </div>
          <h3 className="text-[15px] font-bold text-gray-900">Lưu ý khi mua sắm</h3>
        </div>
        <ul className="space-y-sm text-[13px] text-gray-600 font-medium">
          <li className="flex gap-sm">
            <span className="text-[#f59e0b] mt-[2px]">•</span>
            <span><strong className="text-gray-900">Xoá sản phẩm</strong> tương tự đã có trong giỏ hàng trước khi bấm link.</span>
          </li>
          <li className="flex gap-sm">
            <span className="text-[#f59e0b] mt-[2px]">•</span>
            <span>Không bấm link khác (live, quảng cáo) khi đang mua hàng.</span>
          </li>
          <li className="flex gap-sm">
            <span className="text-[#f59e0b] mt-[2px]">•</span>
            <span>Hoàn tất mua hàng trong <strong className="text-[#e86a33]">cùng một phiên trình duyệt</strong>.</span>
          </li>
          <li className="flex gap-sm">
            <span className="text-[#f59e0b] mt-[2px]">•</span>
            <span>Khuyến nghị nhận đơn rỗi mới xác nhận để tránh mất tiền hoàn.</span>
          </li>
        </ul>
      </div>

    </div>
  );
}
