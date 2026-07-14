import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateCustomerForm } from "@/components/admin/CreateCustomerForm";
import { AdminCustomersClient } from "@/components/admin/AdminCustomersClient";

export default async function AdminCustomersPage({ searchParams }: { searchParams: { q?: string; page?: string; tab?: string; sort?: string; order?: string } }) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";
  const tab = searchParams.tab || "all";
  
  // Xây dựng điều kiện Where
  const where: any = {};
  if (q) {
    where.OR = [
      { fullName: { contains: q } },
      { customerCode: { contains: q } },
      { phone: { contains: q } },
      { telegramUsername: { contains: q } },
    ];
  }
  
  if (tab === "active") where.status = "active";
  if (tab === "locked") where.status = { not: "active" };
  // Tab "debt" xử lý phức tạp hơn vì logic debt liên quan đến relation, 
  // do hạn chế của prisma, chúng ta sẽ tối ưu hoá query. Ở đây tạm thời skip tính toán debt ở mức DB nếu quá phức tạp,
  // nhưng đối với hệ thống lớn, cần lưu trường `debt` trực tiếp trên Customer. 
  // Vì hiện tại debt đang được tính từ orders chưa thanh toán.

  // Xây dựng điều kiện Order
  const orderByField = searchParams.sort || "createdAt";
  const orderByDir = searchParams.order || "desc";
  const orderBy = { [orderByField]: orderByDir };

  // Fetch count theo status cho tabs
  const [totalCount, activeCount, lockedCount] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { status: "active" } }),
    prisma.customer.count({ where: { status: { not: "active" } } }),
  ]);

  const [customers, filteredCount] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        _count: { select: { trackingLinks: true, orders: true } },
        orders: { select: { customerRewardAmount: true, payoutStatus: true } },
      },
    }),
    prisma.customer.count({ where })
  ]);

  const rows = customers.map((c) => {
    const totalReward = c.orders.reduce((s, o) => s + Number(o.customerRewardAmount), 0);
    const debt = c.orders
      .filter((o) => o.payoutStatus !== "paid")
      .reduce((s, o) => s + Number(o.customerRewardAmount), 0);

    return {
      id: c.id,
      fullName: c.fullName,
      customerCode: c.customerCode,
      phone: c.phone,
      zaloUserId: c.zaloUserId,
      telegramUsername: c.telegramUsername,
      telegramUserId: c.telegramUserId,
      status: c.status,
      linkCount: c._count.trackingLinks,
      totalReward,
      debt,
    };
  });

  const totalPages = Math.ceil(filteredCount / limit);

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Quản lý khách hàng"
        subtitle={`${activeCount} khách hàng đang hoạt động trong hệ thống.`}
        action={<CreateCustomerForm />}
      />

      <AdminCustomersClient 
        customers={rows} 
        totalPages={totalPages} 
        currentPage={page} 
        counts={{ all: totalCount, active: activeCount, locked: lockedCount, debt: 0 }} // debt tính sau
      />
    </div>
  );
}
