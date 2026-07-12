import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type CommissionSplit = {
  customerRewardAmount: Prisma.Decimal;
  systemProfitAmount: Prisma.Decimal;
  customerRate: Prisma.Decimal;
  systemRate: Prisma.Decimal;
};

const DEFAULT_CUSTOMER_RATE = new Prisma.Decimal(80);
const DEFAULT_SYSTEM_RATE = new Prisma.Decimal(20);

export async function getActiveCommissionRule() {
  return prisma.commissionRule.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
}

export function splitCommission(
  commissionAmount: Prisma.Decimal | number,
  rule?: { customerRate: Prisma.Decimal; systemRate: Prisma.Decimal } | null
): CommissionSplit {
  const amount = new Prisma.Decimal(commissionAmount);
  const customerRate = rule ? new Prisma.Decimal(rule.customerRate) : DEFAULT_CUSTOMER_RATE;
  const systemRate = rule ? new Prisma.Decimal(rule.systemRate) : DEFAULT_SYSTEM_RATE;

  const customerRewardAmount = amount.mul(customerRate).div(100);
  const systemProfitAmount = amount.sub(customerRewardAmount);

  return { customerRewardAmount, systemProfitAmount, customerRate, systemRate };
}
