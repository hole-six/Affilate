import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateCustomerForm } from "@/components/admin/CreateCustomerForm";
import { Users } from "lucide-react";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { trackingLinks: true, orders: true } },
      orders: { select: { customerRewardAmount: true, payoutStatus: true } },
    },
  });

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Quản lý khách hàng"
        subtitle={`${customers.length} khách hàng đang hoạt động trong hệ thống.`}
        action={<CreateCustomerForm />}
      />

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Chưa có khách hàng nào"
          description="Thêm khách hàng đầu tiên để bắt đầu tạo link affiliate."
        />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Khách hàng</Th>
              <Th>Điện thoại</Th>
              <Th>Zalo ID</Th>
              <Th>Telegram</Th>
              <Th align="right">Số link</Th>
              <Th align="right">Tổng được hoàn</Th>
              <Th align="right">Công nợ còn lại</Th>
              <Th>Trạng thái</Th>
            </Tr>
          </Thead>
          <tbody>
            {customers.map((c) => {
              const totalReward = c.orders.reduce((s, o) => s + Number(o.customerRewardAmount), 0);
              const debt = c.orders
                .filter((o) => o.payoutStatus !== "paid")
                .reduce((s, o) => s + Number(o.customerRewardAmount), 0);

              return (
                <Tr key={c.id}>
                  <Td>
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="font-semibold text-gray-900 hover:text-gray-900-deep hover:underline underline-offset-2 transition-colors"
                    >
                      {c.fullName}
                    </Link>
                    <div className="mt-[2px] text-[11px] font-mono text-gray-500">{c.customerCode}</div>
                  </Td>
                  <Td className="text-gray-500">{c.phone || "—"}</Td>
                  <Td className="text-gray-500">{c.zaloUserId || "—"}</Td>
                  <Td className="text-gray-500">
                    {c.telegramUsername ? `@${c.telegramUsername}` : c.telegramUserId || "—"}
                  </Td>
                  <Td numeric>{c._count.trackingLinks}</Td>
                  <Td numeric className="text-positive-deep font-semibold">
                    {formatCurrency(totalReward)}
                  </Td>
                  <Td numeric className="text-warning-deep">
                    {formatCurrency(debt)}
                  </Td>
                  <Td>
                    <Badge tone={c.status === "active" ? "positive" : "neutral"} dot>
                      {c.status === "active" ? "Hoạt động" : "Đã khoá"}
                    </Badge>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
