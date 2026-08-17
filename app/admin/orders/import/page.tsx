import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImportOrdersWizard } from "@/components/admin/ImportOrdersWizard";

export default async function AdminOrdersImportPage() {
  const platforms = await prisma.platform.findMany({ orderBy: { name: "asc" } });
  const csvPlatforms = platforms.filter((p) => p.code !== "TIKTOK");

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Import doi soat don hang"
        subtitle="Shopee dung CSV import. TikTok Shop dung RioHub webhook/sync de lay sub2/trackingCode va tu map khach."
      />

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-lg py-md text-[13px] leading-relaxed text-amber-800">
        File xuat tu TikTok dashboard thuong khong co sub2/trackingCode nen khong the map khach chinh xac bang CSV. Voi
        TikTok, vao{" "}
        <a href="/admin/settings" className="font-bold underline">
          Cai dat - Tich hop nen tang
        </a>{" "}
        de dong bo qua RioHub theo khoang ngay hoac dan ID don hang tu file.
      </div>

      <ImportOrdersWizard platforms={csvPlatforms.map((p) => ({ id: p.id, label: p.name }))} />
    </div>
  );
}
