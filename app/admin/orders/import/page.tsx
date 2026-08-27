import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImportOrdersWizard } from "@/components/admin/ImportOrdersWizard";

export default async function AdminOrdersImportPage() {
  const platforms = await prisma.platform.findMany({ orderBy: { name: "asc" } });
  // TikTok (RioHub) và Lazada (Conversion Report API) tự đồng bộ đơn — KHÔNG
  // được chọn ở wizard CSV import này. Từng có sự cố thật (2026-08-27): sau khi
  // thêm Lazada, wizard mặc định chọn platform đầu tiên theo alphabet — vô
  // tình biến Lazada thành lựa chọn mặc định khi import file Shopee, tạo ra
  // hàng loạt đơn trùng lặp dưới nhãn sai nền tảng và trả hoa hồng 2 lần.
  const csvPlatforms = platforms.filter((p) => p.code !== "TIKTOK" && p.code !== "LAZADA");

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Import đối soát đơn hàng"
        subtitle="Shopee dùng CSV import. TikTok Shop dùng RioHub webhook/sync để lấy sub2/trackingCode và tự map khách. Lazada dùng Conversion Report API (đồng bộ tự động mỗi 30 phút, xem trang Cấu hình hệ thống)."
      />

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-lg py-md text-[13px] leading-relaxed text-amber-800">
        File xuất từ TikTok dashboard thường không có sub2/trackingCode nên không thể map khách chính xác bằng CSV. Với
        TikTok, vào{" "}
        <a href="/admin/settings" className="font-bold underline">
          Cài đặt - Tích hợp nền tảng
        </a>{" "}
        để đồng bộ qua RioHub theo khoảng ngày hoặc dán ID đơn hàng từ file.
      </div>

      <ImportOrdersWizard platforms={csvPlatforms.map((p) => ({ id: p.id, label: p.name }))} />
    </div>
  );
}
