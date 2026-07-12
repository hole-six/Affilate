"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";

type Customer = {
  id: string;
  fullName: string;
  customerCode: string;
  phone: string | null;
  zaloUserId: string | null;
  telegramUsername: string | null;
  telegramUserId: string | null;
  status: string;
  linkCount: number;
  totalReward: number;
  debt: number;
};

export function AdminCustomersClient({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "locked" | "debt">("all");

  const counts = {
    all: customers.length,
    active: customers.filter((c) => c.status === "active").length,
    locked: customers.filter((c) => c.status !== "active").length,
    debt: customers.filter((c) => c.debt > 0).length,
  };

  const filtered = customers.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      const matches =
        c.fullName.toLowerCase().includes(q) ||
        c.customerCode.toLowerCase().includes(q) ||
        (c.phone?.toLowerCase().includes(q) ?? false) ||
        (c.zaloUserId?.toLowerCase().includes(q) ?? false) ||
        (c.telegramUsername?.toLowerCase().includes(q) ?? false);
      if (!matches) return false;
    }
    if (activeTab === "active") return c.status === "active";
    if (activeTab === "locked") return c.status !== "active";
    if (activeTab === "debt") return c.debt > 0;
    return true;
  });

  return (
    <div className="flex flex-col gap-lg">
      {/* TOOLBAR */}
      <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên khách, mã khách, SĐT, Zalo hoặc Telegram..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-2xl bg-white pl-10 pr-md text-[14px] font-medium text-gray-900 shadow-sm ring-1 ring-black/5 focus:border-[#e86a33] focus:outline-none focus:ring-1 focus:ring-[#e86a33] transition-all"
          />
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-nowrap md:flex-wrap items-center gap-sm overflow-x-auto pb-2 -mx-md px-md md:mx-0 md:px-0 scrollbar-hide w-full max-w-[100vw]">
        <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")} label="Tất cả" count={counts.all} />
        <TabButton active={activeTab === "active"} onClick={() => setActiveTab("active")} label="Đang hoạt động" count={counts.active} />
        <TabButton active={activeTab === "locked"} onClick={() => setActiveTab("locked")} label="Đã khoá" count={counts.locked} />
        <TabButton active={activeTab === "debt"} onClick={() => setActiveTab("debt")} label="Có công nợ" count={counts.debt} />
      </div>

      {/* TABLE */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Không tìm thấy khách hàng nào"
          description="Thử đổi từ khoá tìm kiếm hoặc bộ lọc khác."
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
            {filtered.map((c) => (
              <Tr key={c.id}>
                <Td>
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="font-semibold text-gray-900 hover:underline underline-offset-2 transition-colors"
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
                <Td numeric>{c.linkCount}</Td>
                <Td numeric className="text-positive-deep font-semibold">
                  {formatCurrency(c.totalReward)}
                </Td>
                <Td numeric className="text-warning-deep">
                  {formatCurrency(c.debt)}
                </Td>
                <Td>
                  <Badge tone={c.status === "active" ? "positive" : "neutral"} dot>
                    {c.status === "active" ? "Hoạt động" : "Đã khoá"}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center gap-xs whitespace-nowrap rounded-full px-4 text-[13px] font-bold transition-all ${
        active
          ? "border-2 border-gray-900 bg-white text-gray-900 shadow-sm"
          : "border-2 border-transparent bg-white text-gray-500 shadow-sm ring-1 ring-black/5 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {label}
      <span
        className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] ${
          active ? "bg-gray-100 text-gray-900" : "bg-gray-100 text-gray-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
