import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type CommissionSplit = {
  customerRewardAmount: Prisma.Decimal;
  systemProfitAmount: Prisma.Decimal;
  customerRate: Prisma.Decimal;
  systemRate: Prisma.Decimal;
};

const DEFAULT_TAX_RATE = new Prisma.Decimal(10.98);
const DEFAULT_CUSTOMER_RATE = new Prisma.Decimal(80);
const DEFAULT_SYSTEM_RATE = new Prisma.Decimal(20);

export async function getActiveCommissionRule() {
  return prisma.commissionRule.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Trước khi chia 80/20, phải trừ thuế thu nhập (mặc định 10.98%) trên hoa
 * hồng gộp — khớp với cách sếp tính tay trong file Excel đối soát:
 *   HH sau thuế = HH ghi nhận × (1 - taxRate/100)
 *   Trả khách   = HH sau thuế × customerRate/100
 */
export function splitCommission(
  commissionAmount: Prisma.Decimal | number,
  rule?: { taxRate?: Prisma.Decimal | null; customerRate: Prisma.Decimal; systemRate: Prisma.Decimal } | null
): CommissionSplit {
  const amount = new Prisma.Decimal(commissionAmount);
  const taxRate = rule?.taxRate != null ? new Prisma.Decimal(rule.taxRate) : DEFAULT_TAX_RATE;
  const customerRate = rule ? new Prisma.Decimal(rule.customerRate) : DEFAULT_CUSTOMER_RATE;
  const systemRate = rule ? new Prisma.Decimal(rule.systemRate) : DEFAULT_SYSTEM_RATE;

  const afterTaxAmount = amount.mul(new Prisma.Decimal(100).sub(taxRate)).div(100);
  const customerRewardAmount = afterTaxAmount.mul(customerRate).div(100);
  const systemProfitAmount = afterTaxAmount.sub(customerRewardAmount);

  return { customerRewardAmount, systemProfitAmount, customerRate, systemRate };
}
