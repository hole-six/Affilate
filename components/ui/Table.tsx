"use client";

import {
  useEffect,
  useRef,
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

/**
 * Gan data-label cho tung <td> theo dung text cua <th> cung cot — dung de
 * hien thi nhan tren mobile khi bang chuyen thanh dang card (xem
 * .responsive-table trong globals.css). Thao tac truc tiep tren DOM thuc te
 * (khong doc React children/type) vi trang goi <Table> la Server Component
 * con cac o Th/Tr/Td la Client Component — qua ranh gioi do, child.type bi
 * boc thanh client-reference object nen khong so sanh duoc bang "===".
 */
function applyColumnLabels(table: HTMLTableElement) {
  const headerCells = Array.from(table.querySelectorAll("thead th"));
  if (headerCells.length === 0) return;
  const labels = headerCells.map((th) => th.textContent?.trim() ?? "");

  table.querySelectorAll("tbody tr").forEach((row) => {
    const cells = Array.from(row.children);
    cells.forEach((cell, index) => {
      if (cell.tagName !== "TD") return;
      const label = labels[index];
      if (label && !cell.hasAttribute("data-label")) {
        cell.setAttribute("data-label", label);
      }
    });
  });
}

export function Table(props: TableHTMLAttributes<HTMLTableElement>) {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (tableRef.current) applyColumnLabels(tableRef.current);
  });

  return (
    <div className="responsive-table overflow-x-auto rounded-2xl bg-canvas shadow-sm ring-1 ring-ink/5 w-full">
      <table ref={tableRef} className="w-full min-w-[600px] border-collapse text-left text-[14px]" {...props} />
    </div>
  );
}

export function Thead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className="border-b border-ink/5 bg-canvas-soft/50 backdrop-blur-sm"
      {...props}
    />
  );
}

export function Th({
  align = "left",
  className = "",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" | "center" }) {
  return (
    <th
      className={`whitespace-nowrap px-md md:px-xl py-sm text-[11px] font-bold uppercase tracking-[0.08em] text-mute ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
      } ${className}`}
      {...props}
    />
  );
}

export function Tr(props: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className="border-b border-ink/5 transition-colors duration-100 last:border-0 hover:bg-ink/5"
      {...props}
    />
  );
}

export function Td({
  numeric = false,
  className = "",
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <td
      className={`whitespace-nowrap px-md md:px-xl py-[12px] text-[13px] text-body ${
        numeric ? "text-right tabular-nums font-medium text-ink" : ""
      } ${className}`}
      {...props}
    />
  );
}
