import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateVoucherForm } from "@/components/admin/CreateVoucherForm";
import { VoucherStatusToggle } from "@/components/admin/VoucherStatusToggle";
import { Tag, Copy, CalendarOff, TicketPercent } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default async function AdminVouchersPage() {
  const [platforms, vouchers] = await Promise.all([
    prisma.platform.findMany({ orderBy: { name: "asc" } }),
    prisma.voucher.findMany({ orderBy: { createdAt: "desc" }, include: { platform: true } }),
  ]);

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Kho Voucher"
        subtitle={`${vouchers.length} chương trình ưu đãi đang có trong hệ thống.`}
        action={<CreateVoucherForm platforms={platforms.map((p) => ({ id: p.id, label: p.name }))} />}
      />

      {vouchers.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Chưa có voucher nào"
          description="Thêm voucher đầu tiên để gợi ý ưu đãi cho khách hàng."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
          {vouchers.map((v) => (
            <Card key={v.id} className="flex flex-col p-0 overflow-hidden border border-gray-100 hover:border-[#e86a33]/30 hover:shadow-md transition-all group relative">
              {/* Voucher Top/Header */}
              <div className="p-lg bg-gradient-to-br from-[#fff0e6]/50 to-white border-b border-dashed border-gray-200 relative">
                <div className="flex items-start justify-between gap-md">
                  <div className="flex-1">
                    <span className="inline-block rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider mb-sm">
                      {v.platform.name}
                    </span>
                    <h3 className="text-[16px] font-bold text-gray-900 leading-tight line-clamp-2">
                      {v.title}
                    </h3>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e86a33]/10 text-[#e86a33]">
                    <TicketPercent size={20} strokeWidth={2} />
                  </div>
                </div>
                
                {/* Decorative cutouts */}
                <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-gray-50 border-t border-r border-gray-200" />
                <div className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full bg-gray-50 border-t border-l border-gray-200" />
              </div>

              {/* Voucher Body */}
              <div className="p-lg flex flex-col flex-1 bg-white">
                <p className="text-[14px] text-gray-600 mb-xl line-clamp-2 min-h-[40px]">
                  {v.benefitText || "Không có thông tin thêm"}
                </p>

                <div className="mt-auto flex flex-col gap-md">
                  {v.voucherCode ? (
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-100 p-sm pl-md group-hover:bg-[#fff0e6]/30 transition-colors">
                      <span className="font-mono text-[16px] font-bold tracking-wider text-gray-900">
                        {v.voucherCode}
                      </span>
                      <button className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-white hover:text-[#e86a33] transition-colors" title="Copy mã">
                        <Copy size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 border-dashed p-sm text-[13px] text-gray-400 font-medium h-12">
                      Không cần mã
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-sm">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <CalendarOff size={14} />
                      <span className="text-[12px] font-medium">
                        {v.endsAt ? formatDate(v.endsAt) : "Vô thời hạn"}
                      </span>
                    </div>
                    <Badge tone={v.status === "active" ? "positive" : "neutral"} dot>
                      {v.status === "active" ? "Đang chạy" : "Tạm dừng"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Admin Actions Overlay (Hovers to show) */}
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-md">
                <VoucherStatusToggle id={v.id} status={v.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
