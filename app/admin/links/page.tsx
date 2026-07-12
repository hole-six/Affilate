import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { QuickLinkForm } from "@/components/admin/QuickLinkForm";
import { Link2 } from "lucide-react";

export default async function AdminLinksPage() {
  const [customers, platforms, links] = await Promise.all([
    prisma.customer.findMany({ where: { status: "active" }, orderBy: { fullName: "asc" } }),
    prisma.platform.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
    prisma.trackingLink.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { customer: true, platform: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Tạo link nhanh"
        subtitle="Dán link sản phẩm, chọn khách hàng — hệ thống tự động build link Shopee affiliate, sinh short link và tracking code."
      />

      <QuickLinkForm
        customers={customers.map((c) => ({ id: c.id, label: `${c.fullName} (${c.customerCode})` }))}
        platforms={platforms.map((p) => ({ id: p.id, label: p.name }))}
      />

      <div>
        <h2 className="display-xs mb-lg flex items-center gap-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-pale text-gray-900-deep">
            <Link2 size={16} strokeWidth={1.75} />
          </span>
          Lịch sử link đã tạo
        </h2>
        {links.length === 0 ? (
          <EmptyState
            title="Chưa có link nào"
            description="Tạo link affiliate đầu tiên ở form phía trên."
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Thời gian</Th>
                <Th>Khách hàng</Th>
                <Th>Nền tảng</Th>
                <Th>Tracking code</Th>
                <Th>Short code</Th>
                <Th>Kênh</Th>
                <Th align="right">Lượt click</Th>
                <Th>Trạng thái</Th>
              </Tr>
            </Thead>
            <tbody>
              {links.map((l) => (
                <Tr key={l.id}>
                  <Td className="text-gray-500 text-[13px]">{formatDate(l.createdAt)}</Td>
                  <Td className="font-medium">{l.customer.fullName}</Td>
                  <Td>
                    <span className="rounded-md bg-gray-50 px-sm py-[2px] text-[12px] font-medium text-body">
                      {l.platform.name}
                    </span>
                  </Td>
                  <Td className="font-mono text-[12px] text-gray-500">{l.trackingCode}</Td>
                  <Td className="font-mono text-[12px] text-gray-500">{l.shortCode ?? "—"}</Td>
                  <Td className="text-gray-500">{l.channelSource}</Td>
                  <Td numeric>{l.clicks}</Td>
                  <Td>
                    <Badge tone={l.status === "active" ? "positive" : "neutral"} dot>
                      {l.status === "active" ? "Hoạt động" : "Dừng"}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
