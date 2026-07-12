import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      trackingLinks: { orderBy: { createdAt: "desc" }, take: 20, include: { platform: true } },
      orders: { orderBy: { createdAt: "desc" }, take: 20, include: { platform: true } },
      paymentBatches: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!customer) notFound();

  return (
    <div className="flex flex-col gap-2xl">
      <div>
        <Link
          href="/admin/customers"
          className="mb-md inline-flex items-center gap-xs text-[13px] font-medium text-gray-500 transition-colors duration-150 hover:text-gray-900"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Quản lý khách hàng
        </Link>
        <h1 className="display-sm">{customer.fullName}</h1>
        <p className="mt-xs text-body">
          {customer.customerCode} · {customer.phone || "—"} · Zalo: {customer.zaloUserId || "—"}
        </p>
      </div>

      <Card variant="soft">
        <h2 className="display-xs mb-lg">Link affiliate gần đây</h2>
        {customer.trackingLinks.length === 0 ? (
          <EmptyState title="Chưa có link nào" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Thời gian</Th>
                <Th>Nền tảng</Th>
                <Th>Tracking code</Th>
                <Th>Kênh</Th>
                <Th>Trạng thái</Th>
              </Tr>
            </Thead>
            <tbody>
              {customer.trackingLinks.map((l) => (
                <Tr key={l.id}>
                  <Td>{formatDate(l.createdAt)}</Td>
                  <Td>{l.platform.name}</Td>
                  <Td className="font-mono text-[12px]">{l.trackingCode}</Td>
                  <Td>{l.channelSource}</Td>
                  <Td>
                    <Badge tone={l.status === "active" ? "positive" : "neutral"} dot>{l.status}</Badge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card variant="soft">
        <h2 className="display-xs mb-lg">Đơn hàng</h2>
        {customer.orders.length === 0 ? (
          <EmptyState title="Chưa có đơn hàng nào" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Order ID</Th>
                <Th>Nền tảng</Th>
                <Th align="right">Giá trị đơn</Th>
                <Th align="right">Tiền hoàn</Th>
                <Th>Trạng thái đơn</Th>
                <Th>Thanh toán</Th>
              </Tr>
            </Thead>
            <tbody>
              {customer.orders.map((o) => (
                <Tr key={o.id}>
                  <Td>{o.orderExternalId}</Td>
                  <Td>{o.platform.name}</Td>
                  <Td numeric>{formatCurrency(o.orderAmount ?? 0)}</Td>
                  <Td numeric className="font-medium">{formatCurrency(o.customerRewardAmount)}</Td>
                  <Td>
                    <Badge tone={o.orderStatus === "approved" ? "positive" : "warning"} dot>{o.orderStatus}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={o.payoutStatus === "paid" ? "positive" : "neutral"} dot>{o.payoutStatus}</Badge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card variant="soft">
        <h2 className="display-xs mb-lg">Lịch sử thanh toán</h2>
        {customer.paymentBatches.length === 0 ? (
          <EmptyState title="Chưa có lịch sử thanh toán" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Mã phiếu</Th>
                <Th align="right">Số tiền</Th>
                <Th>Trạng thái</Th>
                <Th>Ngày trả</Th>
              </Tr>
            </Thead>
            <tbody>
              {customer.paymentBatches.map((p) => (
                <Tr key={p.id}>
                  <Td>{p.paymentCode}</Td>
                  <Td numeric className="font-medium">{formatCurrency(p.totalAmount)}</Td>
                  <Td>
                    <Badge tone={p.status === "paid" ? "positive" : "neutral"} dot>{p.status}</Badge>
                  </Td>
                  <Td>{p.paidAt ? formatDate(p.paidAt) : "—"}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
