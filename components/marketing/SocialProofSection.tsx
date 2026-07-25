import { Wallet, Users, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Minh Châu",
    location: "TP.HCM",
    quote:
      "Mình hay mua đồ mẹ bé, mỗi tháng cũng vài đơn. Từ hồi dùng iviback tháng nào cũng rút được 80–150k, nhỏ thôi nhưng cộng lại cũng được. Quan trọng là không mất gì, cứ mua như bình thường, còn được thêm hoa hồng.",
  },
  {
    name: "Lan Phương",
    location: "Bình Dương",
    quote:
      "Lần đầu thấy hoàn tiền cao mình tưởng lừa đảo. Kết quả là đơn đầu tiên mua áo 120k, về 18k. Giờ mình giới thiệu cả nhóm mua sắm dùng luôn. Được thêm 5% giới thiệu bạn nữa.",
  },
  {
    name: "Hương Trà",
    location: "Hải Phòng",
    quote:
      "Cái mình thích là dashboard rõ ràng, biết đơn nào đang chờ duyệt, đơn nào về rồi. Không phải đoán mò hay nhắn thắc mắc, mà có thắc mắc bạn admin cũng trả lời nhiệt tình luôn.",
  },
  {
    name: "Bảo Ngọc",
    location: "Vũng Tàu",
    quote:
      "Mình hay mua flash sale nên ban đầu lo link không ghi nhận kịp. Nhưng xài riết thấy ổn, mẹo là sao chép link sale xong tạo link rồi mua như thường cho bạn nào chưa biết nha.",
  },
  {
    name: "Diễm My",
    location: "Long An",
    quote:
      "Thật ra mình không kỳ vọng nhiều, chỉ nghĩ thêm được đồng nào hay đồng đó. Nhưng tháng trước rút tiền mà bất ngờ luôn, rút được 853k. Vui thiệt sự.",
  },
  {
    name: "Phương Linh",
    location: "Đà Lạt",
    quote:
      "Mình đã giới thiệu cho 4 người bạn dùng, tất cả đều xài được bình thường. Không ai phàn nàn gì. Tụi nó kêu đăng ký nhanh mà dễ xài. Tự nhiên thấy cũng vui vui hí hí.",
  },
];

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

export function SocialProofSection({ totalPaidOut, totalCustomers }: { totalPaidOut: number; totalCustomers: number }) {
  return (
    <section className="py-3xl bg-canvas relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-lg">
        {/* Live counter */}
        <div className="grid sm:grid-cols-2 gap-lg mb-2xl">
          <div className="flex items-center gap-lg rounded-[32px] bg-white p-xl border border-primary/10 shadow-lg shadow-primary/5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Wallet size={28} className="text-primary" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-mute mb-1">Đã hoàn tiền</p>
              <p className="text-[26px] sm:text-[30px] font-black text-ink tabular-nums leading-tight">
                {formatVnd(totalPaidOut)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-lg rounded-[32px] bg-white p-xl border border-primary/10 shadow-lg shadow-primary/5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent-orange/10">
              <Users size={28} className="text-accent-orange" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-mute mb-1">Người dùng đã nhận tiền</p>
              <p className="text-[26px] sm:text-[30px] font-black text-ink tabular-nums leading-tight">
                {totalCustomers.toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-xl">
          <h2 className="text-[28px] sm:text-[36px] font-black text-ink tracking-tight">
            Khách hàng nói gì về <span className="text-primary">iviback</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-lg">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-md rounded-[28px] bg-white p-xl border border-black/5 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all"
            >
              <Quote size={22} className="text-primary/40" strokeWidth={2} />
              <p className="text-[14px] text-body leading-relaxed flex-1">{t.quote}</p>
              <div className="pt-sm border-t border-black/5">
                <p className="text-[13px] font-bold text-ink">{t.name}</p>
                <p className="text-[12px] text-mute">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
