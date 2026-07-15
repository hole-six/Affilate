import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { CommissionRuleForm } from "@/components/admin/CommissionRuleForm";
import { Settings, Code2, Info } from "lucide-react";

export default async function AdminSettingsPage() {
  const activeRule = await prisma.commissionRule.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Cấu hình hệ thống"
        subtitle="Tỷ lệ chia hoa hồng và định dạng mã tracking đang sử dụng."
      />

      {/* Commission rule card */}
      <Card variant="default" className="border border-gray-100">
        <h2 className="display-xs mb-lg flex items-center gap-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-pale text-gray-900-deep">
            <Settings size={16} strokeWidth={1.75} />
          </span>
          Tỷ lệ chia hoa hồng
        </h2>
        <CommissionRuleForm
          taxRate={Number(activeRule?.taxRate ?? 10.98)}
          customerRate={Number(activeRule?.customerRate ?? 80)}
          systemRate={Number(activeRule?.systemRate ?? 20)}
          referralRate={Number(activeRule?.referralRate ?? 0.05) * 100}
          maxReferralOrders={activeRule?.maxReferralOrders ?? 5}
          referralValidityMonths={activeRule?.referralValidityMonths ?? 6}
        />
      </Card>

      {/* Tracking code format */}
      <Card variant="soft">
        <h2 className="display-xs mb-lg flex items-center gap-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-canvas text-body">
            <Code2 size={16} strokeWidth={1.75} />
          </span>
          Định dạng mã tracking
        </h2>
        <div className="rounded-xl border border-gray-100 bg-canvas p-lg font-mono text-[14px] text-gray-900">
          {"{PLATFORM}_{CUSTOMER}_{CHANNEL}_{YYYYMMDD}_{SEQ}"}
        </div>
        <div className="mt-md flex items-start gap-sm rounded-xl bg-primary-pale/50 p-lg">
          <Info size={14} strokeWidth={1.75} className="mt-[2px] shrink-0 text-gray-900-deep" />
          <div>
            <p className="text-[13px] text-body">
              <span className="font-semibold text-gray-900">Ví dụ:</span>{" "}
              <code className="rounded-sm bg-canvas px-sm py-xxs font-mono text-[12px]">
                SHOPEE_C0001_WEB_20260711_0001
              </code>
            </p>
            <p className="mt-xs text-[12px] text-gray-500">
              Xem chi tiết trong <span className="font-medium">02-kien-truc-he-thong-web-zalo.md §6</span>.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
