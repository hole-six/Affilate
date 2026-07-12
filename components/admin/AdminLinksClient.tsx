"use client";

import { useState } from "react";
import { Search, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";

type LinkRow = {
  id: string;
  createdAt: Date;
  customerName: string;
  platformName: string;
  trackingCode: string;
  shortCode: string | null;
  channelSource: string;
  clicks: number;
  status: string;
};

export function AdminLinksClient({ links }: { links: LinkRow[] }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "stopped">("all");

  const counts = {
    all: links.length,
    active: links.filter((l) => l.status === "active").length,
    stopped: links.filter((l) => l.status !== "active").length,
  };

  const filtered = links.filter((l) => {
    if (search) {
      const q = search.toLowerCase();
      const matches =
        l.customerName.toLowerCase().includes(q) ||
        l.trackingCode.toLowerCase().includes(q) ||
        (l.shortCode?.toLowerCase().includes(q) ?? false);
      if (!matches) return false;
    }
    if (activeTab === "active") return l.status === "active";
    if (activeTab === "stopped") return l.status !== "active";
    return true;
  });

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên khách, tracking code hoặc short code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-2xl bg-white pl-10 pr-md text-[14px] font-medium text-gray-900 shadow-sm ring-1 ring-black/5 focus:border-[#e86a33] focus:outline-none focus:ring-1 focus:ring-[#e86a33] transition-all"
          />
        </div>
      </div>

      <div className="flex flex-nowrap md:flex-wrap items-center gap-sm overflow-x-auto pb-2 -mx-md px-md md:mx-0 md:px-0 scrollbar-hide w-full max-w-[100vw]">
        <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")} label="Tất cả" count={counts.all} />
        <TabButton active={activeTab === "active"} onClick={() => setActiveTab("active")} label="Hoạt động" count={counts.active} />
        <TabButton active={activeTab === "stopped"} onClick={() => setActiveTab("stopped")} label="Dừng" count={counts.stopped} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="Không tìm thấy link nào"
          description="Thử đổi từ khoá tìm kiếm hoặc bộ lọc khác."
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
            {filtered.map((l) => (
              <Tr key={l.id}>
                <Td className="text-gray-500 text-[13px]">{formatDate(l.createdAt)}</Td>
                <Td className="font-medium">{l.customerName}</Td>
                <Td>
                  <span className="rounded-md bg-gray-50 px-sm py-[2px] text-[12px] font-medium text-body">
                    {l.platformName}
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
