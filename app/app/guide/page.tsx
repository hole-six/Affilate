import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

const steps = [
  {
    title: "Dán link sản phẩm",
    body: "Vào mục Hoàn tiền, dán link Shopee/TikTok bạn muốn mua, chọn nền tảng và bấm Đổi link.",
  },
  {
    title: "Bấm vào link vừa tạo",
    body: "Luôn bấm vào link hoàn tiền hệ thống trả về trước khi mua hàng để đơn được ghi nhận đúng.",
  },
  {
    title: "Hoàn tất mua hàng",
    body: "Thanh toán bình thường trên Shopee/TikTok như mọi khi.",
  },
  {
    title: "Chờ đối soát",
    body: "Định kỳ hệ thống đối soát đơn hàng từ sàn, đơn hợp lệ sẽ chuyển sang trạng thái đã duyệt.",
  },
  {
    title: "Nhận hoàn tiền",
    body: "Khi đơn được duyệt, số tiền hoàn sẽ vào Ví tiền của bạn và được thanh toán theo kỳ.",
  },
];

export default function CustomerGuidePage() {
  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader title="Hướng dẫn sử dụng" subtitle="5 bước đơn giản để bắt đầu nhận hoàn tiền." />

      <div className="flex flex-col">
        {steps.map((s, i) => (
          <div key={s.title} className="flex gap-lg">
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[14px] font-bold text-ink">
                {i + 1}
              </div>
              {i < steps.length - 1 && <div className="w-px flex-1 bg-canvas-soft" />}
            </div>
            <Card variant="soft" className="mb-lg w-full">
              <h2 className="display-xs mb-sm">{s.title}</h2>
              <p className="text-body">{s.body}</p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
