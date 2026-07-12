export function formatCurrency(value: number | string | { toString(): string }): string {
  const num = typeof value === "object" ? Number(value.toString()) : Number(value);
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Math.round(num)) + "đ";
}

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
}
