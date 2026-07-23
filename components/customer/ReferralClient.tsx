"use client";

import { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Users, TrendingUp, CheckCircle2, Gift } from "lucide-react";
import { useModal } from "@/components/ui/ModalProvider";
import { Button } from "@/components/ui/Button";

type BonusHistoryEntry = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  friendName: string | null;
  friendCode: string | null;
  originalOrderExternalId: string;
  shopName: string | null;
};

interface Props {
  customerCode: string;
  totalFriends: number;
  totalCommission: number;
  referralRate: number;
  maxReferralOrders: number;
  referralValidityMonths: number;
  bonusHistory: BonusHistoryEntry[];
}

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  approved: { text: "Đã cộng ví", className: "bg-green-50 text-green-600" },
  pending: { text: "Đang chờ duyệt", className: "bg-amber-50 text-amber-600" },
  clawback: { text: "Đã thu hồi", className: "bg-red-50 text-red-500" },
};

export function ReferralClient({ customerCode, totalFriends, totalCommission, referralRate, maxReferralOrders, referralValidityMonths, bonusHistory }: Props) {
  const modal = useModal();
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    setReferralLink(`${window.location.origin}/register?ref=${customerCode}`);
  }, [customerCode]);

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    modal.alert({
      title: "Thành công",
      message: "Đã copy link giới thiệu! Hãy gửi cho bạn bè của bạn.",
      iconType: "success"
    });
  };

  return (
    <div className="flex flex-col gap-2xl fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-black text-gray-900 tracking-tight">Mời bạn bè</h1>
        <p className="mt-xs text-[14px] text-gray-500 font-medium">Chia sẻ niềm vui mua sắm và nhận hoa hồng thụ động</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-xl">
        {/* Left Column */}
        <div className="lg:col-span-3 flex flex-col gap-xl">
          {/* Link Section */}
          <div className="rounded-3xl bg-white p-xl shadow-sm ring-1 ring-black/5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-60"></div>
            <div className="relative">
              <div className="flex items-center gap-sm mb-lg">
                <img src="/heoquatang.png" alt="" className="h-12 w-12 object-contain" />
                <h2 className="text-[16px] font-bold text-gray-900">Link giới thiệu của bạn</h2>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-sm mb-md">
                <input 
                  type="text" 
                  value={referralLink} 
                  readOnly 
                  className="flex-1 h-12 rounded-2xl bg-gray-50 px-md text-[14px] font-medium text-gray-900 ring-1 ring-black/5 focus:outline-none"
                />
                <Button onClick={handleCopy} className="h-12 px-xl shrink-0">
                  Sao chép
                </Button>
              </div>
              
              <p className="text-[13px] text-gray-400 flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[10px]">i</span>
                Gửi link này cho bạn bè. Họ đăng ký tài khoản, bạn sẽ nhận được hoa hồng.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-md">
            <div className="rounded-3xl bg-white p-lg shadow-sm ring-1 ring-black/5 flex flex-col justify-between h-[140px]">
              <div className="flex items-center gap-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                  <Users size={20} strokeWidth={2} />
                </div>
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Bạn bè</span>
              </div>
              <div className="text-[32px] font-black text-gray-900">{totalFriends}</div>
            </div>

            <div className="rounded-3xl bg-white p-lg shadow-sm ring-1 ring-black/5 flex flex-col justify-between h-[140px]">
              <div className="flex items-center gap-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-500">
                  <TrendingUp size={20} strokeWidth={2} />
                </div>
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Hoa hồng</span>
              </div>
              <div className="text-[32px] font-black text-green-600">{formatCurrency(totalCommission)}</div>
            </div>
          </div>
          
          {/* Lịch sử hoa hồng giới thiệu — truy vết từng khoản về đúng bạn bè + đơn hàng gốc */}
          {bonusHistory.length === 0 ? (
            <div className="rounded-3xl bg-gray-50 p-xl ring-1 ring-black/5 border border-gray-100 flex flex-col items-center justify-center h-[200px] text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-400 mb-md">
                <Users size={32} />
              </div>
              {totalFriends === 0 ? (
                <>
                  <h3 className="text-[15px] font-bold text-gray-700">Chưa có ai đăng ký</h3>
                  <p className="text-[13px] text-gray-500 mt-1">Gửi link cho bạn bè ngay để nhận quà!</p>
                </>
              ) : (
                <>
                  <h3 className="text-[15px] font-bold text-gray-700">Bạn đã mời được {totalFriends} người bạn</h3>
                  <p className="text-[13px] text-gray-500 mt-1">Hoa hồng sẽ tự động cập nhật khi họ mua sắm.</p>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-xl shadow-sm ring-1 ring-black/5">
              <h2 className="text-[16px] font-bold text-gray-900 mb-lg">Lịch sử hoa hồng giới thiệu</h2>
              <div className="flex flex-col gap-sm max-h-[420px] overflow-y-auto">
                {bonusHistory.map((entry) => {
                  const status = STATUS_LABEL[entry.status] ?? { text: entry.status, className: "bg-gray-100 text-gray-500" };
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-md rounded-2xl bg-gray-50 p-md ring-1 ring-black/5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#e86a33]">
                        <Gift size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] font-bold text-gray-900">
                          {entry.friendName ?? "Bạn bè"}
                          {entry.friendCode ? ` (${entry.friendCode})` : ""}
                        </div>
                        <div className="truncate text-[12px] text-gray-400">
                          Từ đơn <code>{entry.originalOrderExternalId}</code>
                          {entry.shopName ? ` — ${entry.shopName}` : ""} · {formatDate(entry.createdAt)}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[14px] font-black text-green-600">+{formatCurrency(entry.amount)}</div>
                        <span className={`inline-block rounded-full px-2 py-[2px] text-[10px] font-bold ${status.className}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col gap-xl">
          {/* Rewards Box */}
          <div className="rounded-3xl bg-white p-xl shadow-sm ring-1 ring-black/5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-60"></div>
            <div className="relative">
              <div className="flex items-center gap-sm mb-xl">
                <img src="/heoqua.png" alt="" className="h-12 w-12 object-contain" />
                <h2 className="text-[18px] font-black text-gray-900">Phần thưởng của bạn</h2>
              </div>

              <div className="flex flex-col gap-lg">
                <div className="flex gap-md">
                  <CheckCircle2 className="text-[#e86a33] shrink-0 mt-0.5" size={20} />
                  <div className="w-full">
                    <h3 className="text-[14px] font-bold text-gray-900">Nhận thêm {referralRate * 100}% hoa hồng</h3>
                    <p className="text-[13px] text-gray-500 mt-1">Bạn nhận thêm {referralRate * 100}% trên số tiền hoàn mà bạn bè nhận được ở mỗi đơn hàng thành công — cộng trực tiếp vào ví của bạn.</p>
                  </div>
                </div>

                <div className="flex gap-md">
                  <CheckCircle2 className="text-[#e86a33] shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900">Áp dụng cho {maxReferralOrders} đơn đầu tiên của mỗi người bạn</h3>
                    <p className="text-[13px] text-gray-500 mt-1">Mời bạn bè tham gia và nhận {referralRate * 100}% hoa hồng từ {maxReferralOrders} đơn hàng đầu tiên của người bạn đó — mời càng nhiều bạn, nhận càng nhiều hoa hồng, không bị giới hạn dồn chung.</p>
                  </div>
                </div>

                <div className="flex gap-md">
                  <CheckCircle2 className="text-[#e86a33] shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900">Thời hạn {referralValidityMonths} tháng</h3>
                    <p className="text-[13px] text-gray-500 mt-1">Các đơn hàng phải phát sinh trong vòng {referralValidityMonths} tháng kể từ lúc bạn bè đăng ký tài khoản.</p>
                  </div>
                </div>

                <div className="flex gap-md">
                  <CheckCircle2 className="text-[#e86a33] shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900">Bạn bè không bị ảnh hưởng</h3>
                    <p className="text-[13px] text-gray-500 mt-1">Người được mời vẫn nhận đủ % hoàn tiền như bình thường — khoản hoa hồng bạn nhận thêm không trừ bớt gì từ phần của họ.</p>
                  </div>
                </div>
              </div>

              <div className="mt-xl rounded-2xl bg-gray-50 p-lg">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-sm">Điều kiện</h4>
                <ul className="list-disc list-inside text-[13px] text-gray-600 space-y-1">
                  <li>Chỉ áp dụng khi đăng ký qua link mời.</li>
                  <li>Đơn hàng phải ở trạng thái "Hoàn tất".</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* How it works */}
          <div className="rounded-3xl bg-white p-xl shadow-sm ring-1 ring-black/5">
            <h2 className="text-[16px] font-bold text-gray-900 mb-lg">Cách thức hoạt động</h2>
            <div className="relative border-l-2 border-[#e86a33]/20 ml-3 pl-lg space-y-lg py-2">
              <div className="relative">
                <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-[#e86a33] ring-4 ring-orange-50"></div>
                <h3 className="text-[14px] font-bold text-gray-900">Lấy link mời</h3>
                <p className="text-[13px] text-gray-500 mt-1">Copy link giới thiệu cá nhân của bạn ở phía trên.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-[#e86a33] ring-4 ring-orange-50"></div>
                <h3 className="text-[14px] font-bold text-gray-900">Gửi cho bạn bè</h3>
                <p className="text-[13px] text-gray-500 mt-1">Chia sẻ link qua Zalo, Facebook hoặc bất kỳ đâu.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-gray-300 ring-4 ring-gray-50"></div>
                <h3 className="text-[14px] font-bold text-gray-900">Nhận quà thụ động</h3>
                <p className="text-[13px] text-gray-500 mt-1">Tự động nhận hoa hồng mỗi khi bạn bè mua sắm thành công.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
