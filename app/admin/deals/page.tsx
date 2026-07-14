import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Flame, TrendingUp, MousePointerClick, Eye } from "lucide-react";
import { CreateDealForm } from "@/components/admin/CreateDealForm";
import { AdminDealList } from "@/components/admin/AdminDealList";

export default async function AdminDealsPage({ searchParams }: { searchParams: { q?: string; page?: string; sort?: string; order?: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";

  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { shortCode: { contains: q } },
    ];
  }

  const orderByField = searchParams.sort || "createdAt";
  const orderByDir = searchParams.order || "desc";
  const orderBy = { [orderByField]: orderByDir };

  // Get total metrics across all deals (ignoring pagination/search)
  const [allDealsCount, activeDealsCount, allDealsData] = await Promise.all([
    prisma.dealPost.count(),
    prisma.dealPost.count({ where: { status: "active" } }),
    prisma.dealPost.findMany({ select: { clicks: true } }),
  ]);
  const totalClicks = allDealsData.reduce((s, d) => s + d.clicks, 0);

  // Get paginated deals
  const [deals, filteredCount] = await Promise.all([
    prisma.dealPost.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.dealPost.count({ where }),
  ]);

  const formattedDeals = deals.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    originalPrice: d.originalPrice ? Number(d.originalPrice) : null,
    salePrice: d.salePrice ? Number(d.salePrice) : null,
    discountPercent: d.discountPercent,
    uploadedImageUrl: d.uploadedImageUrl,
    shopeeImageUrl: d.shopeeImageUrl,
    affiliateUrl: d.affiliateUrl,
    shortUrl: d.shortUrl,
    status: d.status,
    clicks: d.clicks,
    createdAt: d.createdAt.toISOString(),
  }));

  const totalPages = Math.ceil(filteredCount / limit);

  return (
    <div className="flex flex-col gap-xl fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-md">
        <div>
          <h1 className="text-[24px] font-black tracking-tight text-gray-900 flex items-center gap-sm">
            <Flame className="text-[#e86a33]" size={26} strokeWidth={2} />
            Quản lý Deals
          </h1>
          <p className="text-[14px] text-gray-400 mt-1">
            Đăng deal giảm giá từ các group — hệ thống tự đổi link sang affiliate của bạn
          </p>
        </div>
        <CreateDealForm />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">
        {[
          { icon: Flame, label: "Tổng số deal", value: allDealsCount, color: "text-[#e86a33]", bg: "bg-orange-50" },
          { icon: Eye, label: "Đang hiện", value: activeDealsCount, color: "text-green-600", bg: "bg-green-50" },
          { icon: MousePointerClick, label: "Tổng lượt click", value: totalClicks.toLocaleString(), color: "text-sky-600", bg: "bg-sky-50" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="flex items-center gap-md rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
              <Icon size={18} className={color} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[12px] font-medium text-gray-400">{label}</div>
              <div className={`text-[20px] font-black ${color}`}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Deal List */}
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="p-lg border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-gray-900">Danh sách Deals</h2>
        </div>
        <div className="p-lg">
          <AdminDealList initialDeals={formattedDeals} totalPages={totalPages} currentPage={page} />
        </div>
      </div>
    </div>
  );
}
