# 🚀 Lazada Postback - Quick Start

## ⚡ Bước 1: Lấy Postback URL

Chạy lệnh này để hiển thị URL cần copy:

```bash
npm run lazada:postback-url
```

Hoặc xem trực tiếp:
```
https://iviback.vn/api/webhooks/lazada/postback?order_id={_p_order_id}&sub_order_id={_p_sub_order_id}&offer={_p_offer}&sku_name={_p_sku_name}&status={_p_status}&payout={_p_payout}&pay_amount={_p_pay_amount}&currency={_p_currency}&sub_id1={sub_id1}&sub_id2={sub_id2}&sub_id3={sub_id3}&fulfilled_time={_p_fulfilled_time}&delivered_time={_p_delivered_time}&returned_time={_p_returned_time}
```

## ⚡ Bước 2: Cấu hình trong Lazada

1. Đăng nhập: https://affiliate.lazada.vn
2. Vào: **Settings** → **Postback URL** → **Create New**
3. Điền:
   - **Name**: iviback Order Tracking
   - **Event**: Order
   - **URL**: Paste URL từ bước 1
4. Nhấn **Save** → **Run Test**

## ⚡ Bước 3: Verify

### Test trên VPS:
```bash
# Test GET
curl "https://iviback.vn/api/webhooks/lazada/postback?order_id=test123"

# Xem logs
pm2 logs nextjs-app | grep LAZADA_POSTBACK
```

### Test từ Admin Panel:
```bash
# Gọi API test
curl -X POST "https://iviback.vn/api/admin/integrations/lazada/postback-test" \
  -H "Cookie: session=your_admin_session" \
  -H "Content-Type: application/json"
```

## ✅ Hoàn tất!

- ✅ Postback endpoint: `/api/webhooks/lazada/postback`
- ✅ Lazada sẽ tự động gửi đơn về (D+1)
- ✅ Vẫn giữ cron job backup: `scripts/sync-lazada.sh`

## 📚 Chi tiết đầy đủ

Xem: `docs/LAZADA_POSTBACK_SETUP.md`

## 🆘 Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| "invalid click id" | Dùng `{sub_id1}` thay vì `{sub_aff_id}` |
| "handshake failure" | Email Lazada support yêu cầu whitelist |
| Không nhận postback | Kiểm tra SSL cert, firewall, logs |

## 📞 Support

- Logs: `pm2 logs nextjs-app`
- Database: `npx prisma studio`
- Email: affiliate-vn@lazada.com
