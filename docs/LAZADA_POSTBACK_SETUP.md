# Hướng dẫn thiết lập Lazada Postback

## 🎯 Mục đích
Lazada sẽ tự động gửi thông tin đơn hàng về server của bạn theo thời gian thực (D+1) thay vì bạn phải chủ động gọi API.

## 📍 Postback URL của bạn
```
https://iviback.vn/api/webhooks/lazada/postback
```

## 🔧 Bước 1: Cấu hình Postback URL trong Lazada AdSense

### 1.1. Truy cập Lazada Affiliate Dashboard
- Đăng nhập: https://affiliate.lazada.vn (hoặc .sg)
- Vào **Settings** → **Postback URL**

### 1.2. Tạo Postback mới
- **Postback Name**: iviback Order Tracking
- **Event Type**: Chọn **Order** (để nhận thông tin đơn hàng)
- **Postback URL**: Điền URL sau

```
https://iviback.vn/api/webhooks/lazada/postback?order_id={_p_order_id}&sub_order_id={_p_sub_order_id}&offer={_p_offer}&sku_name={_p_sku_name}&status={_p_status}&payout={_p_payout}&pay_amount={_p_pay_amount}&currency={_p_currency}&sub_id1={sub_id1}&sub_id2={sub_id2}&sub_id3={sub_id3}&fulfilled_time={_p_fulfilled_time}&delivered_time={_p_delivered_time}&returned_time={_p_returned_time}
```

### 1.3. Các macro quan trọng

| Macro | Ý nghĩa | Bắt buộc |
|-------|---------|----------|
| `{_p_order_id}` | ID đơn hàng | ✅ Bắt buộc |
| `{_p_sub_order_id}` | ID đơn hàng con | Không |
| `{_p_offer}` | Tên sản phẩm | Không |
| `{_p_sku_name}` | Tên SKU | Không |
| `{_p_status}` | Trạng thái (fulfilled/delivered/returned) | ✅ Quan trọng |
| `{_p_payout}` | Hoa hồng ước tính | ✅ Quan trọng |
| `{_p_pay_amount}` | Giá trị đơn hàng | Không |
| `{_p_currency}` | Đơn vị tiền tệ | Không |
| `{sub_id1}` | Customer code (do bạn gửi lên) | ✅ Quan trọng |
| `{sub_id2}` | Tracking code (do bạn gửi lên) | ✅ Quan trọng |
| `{sub_id3}` | Channel source (do bạn gửi lên) | Không |
| `{_p_fulfilled_time}` | Thời gian fulfilled | Không |
| `{_p_delivered_time}` | Thời gian delivered | ✅ Quan trọng |
| `{_p_returned_time}` | Thời gian returned | Không |

### 1.4. Test kết nối
- Nhấn **Run Test** trong dashboard
- Kiểm tra response phải là `{"status":"ok"}`
- Nếu lỗi, xem phần Troubleshooting bên dưới

## 🔗 Bước 2: Đảm bảo Tracking Link có macro

Khi tạo affiliate link cho khách, hệ thống đã tự động thêm macro vào link:

```typescript
// Trong lib/lazadaApi.ts → getLazadaLinkByUrl()
const params = {
  inputType: "url",
  inputValue: productUrl,
  subId1: customer.customerCode,  // ← Macro này
  subId2: trackingCode,            // ← Macro này
  subId3: channelSource            // ← Macro này (TELEGRAM/ZALO/WEB)
};
```

Link affiliate sẽ có dạng:
```
https://c.lazada.vn/t/c.abc123?sub_id1=CUST001&sub_id2=TRK456&sub_id3=TELEGRAM
```

✅ **Bạn không cần làm gì ở bước này**, code đã xử lý sẵn!

## 📊 Bước 3: Test với đơn hàng thật

### 3.1. Tạo đơn thử nghiệm
1. Lấy 1 link affiliate từ bot Telegram/Zalo
2. Mở link → Mua hàng thật (đơn nhỏ để test)
3. Chờ Lazada xử lý đơn (fulfilled → delivered)

### 3.2. Kiểm tra logs
```bash
# Trên VPS, xem logs
pm2 logs nextjs-app

# Hoặc xem file logs
tail -f /var/log/lazada-postback.log
```

Sẽ thấy:
```
[LAZADA_POSTBACK] {"order_id":"123456",...}
[LAZADA_POSTBACK_SUCCESS] Created order 123456 for customer CUST001
```

### 3.3. Kiểm tra database
```bash
# SSH vào VPS
cd /var/www/iviback
npx prisma studio

# Hoặc query trực tiếp
sqlite3 prisma/dev.db "SELECT * FROM Order WHERE sourceType='lazada' ORDER BY createdAt DESC LIMIT 5;"
```

## 🔥 Lợi ích của Postback

| Trước (Polling) | Sau (Postback) |
|-----------------|----------------|
| Cron job mỗi 30 phút | Realtime (D+1) |
| Tốn tài nguyên VPS | Nhẹ hơn, chỉ nhận khi có đơn |
| Có thể miss đơn | Không bỏ sót |
| Delay tối đa 30 phút | Delay tối đa 24h (do Lazada) |

## 🚨 Troubleshooting

### Lỗi 1: "invalid click id"
**Nguyên nhân**: Bạn dùng `{sub_aff_id}` thay vì `{sub_id1}`
**Giải pháp**: Dùng `{sub_id1}` ~ `{sub_id6}` trong postback URL

### Lỗi 2: "Missing parameter clickid"
**Nguyên nhân**: Thiếu `{_p_order_id}` trong postback URL
**Giải pháp**: Đảm bảo có `order_id={_p_order_id}` trong URL

### Lỗi 3: "handshake_failure"
**Nguyên nhân**: Server bạn không tương thích SSL với Lazada
**Giải pháp**: 
- Gửi email cho Lazada Affiliate support yêu cầu whitelist domain
- Email: affiliate-sg@lazada.com (hoặc affiliate-vn@lazada.com)

### Lỗi 4: Không nhận được postback
**Kiểm tra**:
1. ✅ Postback URL đã lưu đúng trong Lazada dashboard?
2. ✅ Server có public accessible (không bị firewall block)?
3. ✅ SSL certificate hợp lệ (https)?
4. ✅ Có đơn hàng thật trong khoảng thời gian test?

### Test endpoint thủ công
```bash
# Test GET
curl "https://iviback.vn/api/webhooks/lazada/postback?order_id=test123"

# Test POST
curl -X POST "https://iviback.vn/api/webhooks/lazada/postback" \
  -H "Content-Type: application/json" \
  -d '{"order_id":"test123","status":"delivered"}'
```

## 📝 Notes quan trọng

1. **D+1 cycle**: Lazada gửi postback vào ngày hôm sau (D+1), không phải instant
2. **Retry policy**: Nếu server bạn trả về lỗi (4xx/5xx), Lazada sẽ retry vài lần
3. **Idempotency**: Cùng 1 đơn có thể được gửi nhiều lần (khi status thay đổi), hệ thống đã xử lý upsert
4. **Security**: Endpoint public, nên log cẩn thận để phát hiện spam (nếu cần thêm bảo mật, có thể thêm secret token)

## 🔄 Vẫn giữ Cron Job?

**Khuyến nghị**: Giữ lại cron job như backup
```bash
# Chạy 1 lần/ngày vào 3h sáng để đồng bộ đơn bị miss
0 3 * * * /var/www/iviback/scripts/sync-lazada.sh >> /var/log/lazada-sync.log 2>&1
```

## 📞 Support

Nếu gặp vấn đề:
1. Check logs: `pm2 logs nextjs-app | grep LAZADA`
2. Check Lazada dashboard: Event logs trong Postback settings
3. Email Lazada support với thông tin:
   - App Key: LAZADA_APP_KEY
   - Postback URL: https://iviback.vn/api/webhooks/lazada/postback
   - Error message: Copy từ logs
