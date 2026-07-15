import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { CustomerLinkForm } from "@/components/customer/CustomerLinkForm";
import { RefundHistoryClient } from "@/components/customer/RefundHistoryClient";
import { Lightbulb } from "lucide-react";

export default async function CustomerRefundsPage({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  const session = await getSession();
  if (!session?.customerId) redirect("/admin");

  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";

  const where: any = { customerId: session.customerId };
  if (q) {
    where.shortCode = { contains: q };
  }

  const [platforms, links, totalCount] = await Promise.all([
    prisma.platform.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
    prisma.trackingLink.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { platform: true },
      skip,
      take: limit,
    }),
    prisma.trackingLink.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const formattedLinks = links.map(l => ({
    id: l.id,
    createdAt: formatDate(l.createdAt),
    shortCode: l.shortCode || "",
    shortUrl: l.shortUrl,
    productTitle: l.productTitle,
    productImage: l.productImage,
    platform: { code: l.platform.code, name: l.platform.name },
  }));

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
          <img src="/heoQA.png" alt="" className="h-14 w-14 object-contain drop-shadow-sm" />
        </div>
      </div>

      {/* FORM: CHỌN NỀN TẢNG & TẠO LINK */}
      <CustomerLinkForm platforms={platforms.map((p) => ({ id: p.id, code: p.code, label: p.name }))} />

      {/* HISTORY CARD */}
      <RefundHistoryClient links={formattedLinks} totalPages={totalPages} currentPage={page} totalCount={totalCount} />

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
