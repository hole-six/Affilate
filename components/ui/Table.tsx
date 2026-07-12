import { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table(props: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5 w-full">
      <table className="w-full border-collapse text-left text-[14px]" {...props} />
    </div>
  );
}

export function Thead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className="border-b border-black/5 bg-gray-50/50 backdrop-blur-sm"
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
      className={`whitespace-nowrap px-md md:px-xl py-sm text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500 ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
      } ${className}`}
      {...props}
    />
  );
}

export function Tr(props: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className="border-b border-black/[0.03] transition-colors duration-100 last:border-0 hover:bg-gray-50"
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
      className={`whitespace-nowrap px-md md:px-xl py-[12px] text-[13px] text-gray-700 ${
        numeric ? "text-right tabular-nums font-medium text-gray-900" : ""
      } ${className}`}
      {...props}
    />
  );
}
