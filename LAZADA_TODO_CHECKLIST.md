# ✅ Lazada Integration - TODO Checklist

## 📋 Trước khi deploy

- [x] Code postback endpoint đã sẵn sàng
- [x] Test endpoint đã có
- [x] Script helper đã có
- [x] Documentation đã đầy đủ
- [ ] Review code 1 lần nữa (optional)

## 🚀 Deploy lên VPS (Bắt buộc)

```bash
# 1. SSH vào VPS
ssh user@your-vps-ip

# 2. Pull code mới
cd /var/www/iviback
git pull origin main

# 3. Install dependencies (nếu có mới)
npm install

# 4. Build
npm run build

# 5. Restart PM2
pm2 restart nextjs-app

# 6. Check logs
pm2 logs nextjs-app --lines 50
```

**Status**: [ ] Hoàn thành

---

## 🔑 Cấu hình Lazada Credentials

### Bước 1: Đăng ký Lazada Affiliate (nếu chưa có)

- [ ] Truy cập: https://affiliate.lazada.vn
- [ ] Đăng ký tài khoản affiliate
- [ ] Chờ duyệt (1-3 ngày)

### Bước 2: Tạo Application trong Lazada Open Platform

- [ ] Đăng nhập: https://open.lazada.com/apps/myapps
- [ ] Create New App
- [ ] Điền thông tin:
  - App Name: iviback Affiliate System
  - App Description: Affiliate tracking and commission management
  - Category: Marketing
  - Callback URL: https://iviback.vn/api/auth/lazada/callback (tạm thời)
- [ ] Submit → Chờ duyệt
- [ ] Lấy **App Key** và **App Secret**

### Bước 3: Lấy Access Token

**Cách 1: OAuth Flow (Recommended)**
```
1. Authorize URL:
https://auth.lazada.com/oauth/authorize?response_type=code&client_id={APP_KEY}&redirect_uri={CALLBACK_URL}

2. User authorize → nhận code
3. Exchange code → access_token:
POST https://auth.lazada.com/rest/auth/token/create
{
  app_key: APP_KEY,
  app_secret: APP_SECRET,
  code: CODE
}
```

**Cách 2: Test Token (Quick & Dirty)**
- Dùng Postman/Insomnia
- Hoặc xin test token từ Lazada support

- [ ] Đã có Access Token

### Bước 4: Update .env trên VPS

```bash
ssh user@vps
nano /var/www/iviback/.env

# Thêm/update:
LAZADA_API_BASE_URL="https://api.lazada.vn/rest"  # hoặc .sg
LAZADA_APP_KEY="your_app_key_here"
LAZADA_APP_SECRET="your_app_secret_here"
LAZADA_ACCESS_TOKEN="your_access_token_here"

# Save: Ctrl+O, Enter, Ctrl+X
```

- [ ] .env đã update
- [ ] Restart app: `pm2 restart nextjs-app`

**Status**: [ ] Hoàn thành

---

## 🔗 Cấu hình Postback URL trong Lazada

### Bước 1: Lấy Postback URL

Trên local (hoặc VPS):
```bash
npm run lazada:postback-url
```

Hoặc copy trực tiếp:
```
https://iviback.vn/api/webhooks/lazada/postback?order_id={_p_order_id}&sub_order_id={_p_sub_order_id}&offer={_p_offer}&sku_name={_p_sku_name}&status={_p_status}&payout={_p_payout}&pay_amount={_p_pay_amount}&currency={_p_currency}&sub_id1={sub_id1}&sub_id2={sub_id2}&sub_id3={sub_id3}&fulfilled_time={_p_fulfilled_time}&delivered_time={_p_delivered_time}&returned_time={_p_returned_time}
```

- [ ] URL đã copy

### Bước 2: Thêm vào Lazada Dashboard

- [ ] Đăng nhập: https://affiliate.lazada.vn
- [ ] Vào: **Account** → **Settings** → **Postback URL**
- [ ] Click: **Create New Postback**
- [ ] Điền thông tin:
  - **Postback Name**: `iviback Order Tracking`
  - **Event Type**: `Order` (hoặc `Conversion`)
  - **Postback URL**: Paste URL từ bước 1
- [ ] Click: **Save**

### Bước 3: Test Connection

- [ ] Click: **Run Test** trong Lazada dashboard
- [ ] Xem response: Phải nhận `{"status":"ok"}` hoặc `{"status":"ok","msg":"test received"}`
- [ ] Nếu lỗi → Xem troubleshooting bên dưới

**Status**: [ ] Hoàn thành

---

## 🧪 Testing

### Test 1: Endpoint sống chưa?

```bash
curl "https://iviback.vn/api/webhooks/lazada/postback?order_id=test123"
```

**Expected**: `{"status":"ok","msg":"test received"}`

- [ ] Test thành công

### Test 2: Test với mock data

Trên VPS:
```bash
curl -X POST "https://iviback.vn/api/admin/integrations/lazada/postback-test" \
  -H "Cookie: session=YOUR_ADMIN_SESSION" \
  -H "Content-Type: application/json"
```

Hoặc qua browser:
1. Đăng nhập admin: https://iviback.vn/admin/login
2. Mở Console: F12
3. Paste:
```javascript
fetch('/api/admin/integrations/lazada/postback-test', {
  method: 'POST',
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

**Expected**: `{"ok":true,"response":{"status":"ok"}}`

- [ ] Test thành công
- [ ] Check logs: `pm2 logs nextjs-app | grep LAZADA_POSTBACK`
- [ ] Check database: Có đơn `TEST-{timestamp}` trong bảng Order

### Test 3: Đơn hàng thật (Recommended)

- [ ] Tạo 1 link affiliate qua bot Telegram/Zalo
- [ ] Mua 1 sản phẩm rẻ (vd: móc khoá 10k)
- [ ] Chờ Lazada xử lý (fulfilled → delivered: 2-3 ngày)
- [ ] Check sau 24-48h: `pm2 logs | grep LAZADA_POSTBACK`
- [ ] Verify order trong database

**Status**: [ ] Hoàn thành

---

## 📊 Monitoring & Maintenance

### Setup Logging

Thêm vào crontab để rotate logs:
```bash
crontab -e

# Rotate logs mỗi tuần
0 0 * * 0 pm2 flush nextjs-app
```

- [ ] Log rotation đã setup

### Setup Alerts (Optional)

Tạo script check lỗi:
```bash
#!/bin/bash
# /var/www/iviback/scripts/check-lazada-errors.sh

ERROR_COUNT=$(pm2 logs nextjs-app --lines 1000 --nostream | grep "LAZADA_POSTBACK_ERROR" | wc -l)

if [ $ERROR_COUNT -gt 5 ]; then
  # Send alert
  curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d "chat_id=${ADMIN_TELEGRAM_ID}" \
    -d "text=⚠️ Lazada Postback có $ERROR_COUNT lỗi trong 1000 dòng log gần nhất"
fi
```

```bash
# Chạy mỗi giờ
0 * * * * /var/www/iviback/scripts/check-lazada-errors.sh
```

- [ ] Alert script đã setup (optional)

### Backup Cron Job

Vẫn giữ cron job sync như backup:
```bash
crontab -e

# Sync Lazada orders mỗi ngày lúc 3h sáng
0 3 * * * cd /var/www/iviback && /var/www/iviback/scripts/sync-lazada.sh >> /var/log/lazada-sync.log 2>&1
```

- [ ] Backup cron job đã setup

**Status**: [ ] Hoàn thành

---

## 📚 Documentation Review

- [ ] Đọc: `LAZADA_POSTBACK_QUICKSTART.md` (3 phút)
- [ ] Đọc: `docs/LAZADA_POSTBACK_SETUP.md` (chi tiết, 10 phút)
- [ ] Đọc: `docs/LAZADA_POSTBACK_FLOW.md` (hiểu flow, 5 phút)
- [ ] Bookmark: `LAZADA_SETUP_SUMMARY.txt` (tham khảo nhanh)

---

## 🚨 Troubleshooting Common Issues

### Issue 1: "invalid click id"
- **Nguyên nhân**: Dùng `{sub_aff_id}` thay vì `{sub_id1}`
- **Fix**: URL phải dùng `{sub_id1}` đến `{sub_id6}`
- [ ] Fixed

### Issue 2: "handshake_failure"
- **Nguyên nhân**: SSL không tương thích
- **Fix**: Email Lazada support (affiliate-vn@lazada.com) yêu cầu whitelist
- [ ] Fixed

### Issue 3: Không nhận postback
- [ ] Check: Postback URL đã lưu đúng?
- [ ] Check: Server có public accessible?
- [ ] Check: SSL certificate hợp lệ? `curl -I https://iviback.vn`
- [ ] Check: Có đơn hàng thật không?
- [ ] Check: Logs có lỗi gì? `pm2 logs nextjs-app | grep ERROR`

### Issue 4: Access Token hết hạn
- **Nguyên nhân**: Token có TTL (thường 30 ngày)
- **Fix**: Implement token refresh hoặc renew thủ công
- [ ] Fixed

---

## ✅ Final Checklist

- [ ] Code đã deploy lên VPS
- [ ] .env có đủ 3 biến: APP_KEY, APP_SECRET, ACCESS_TOKEN
- [ ] Postback URL đã cấu hình trong Lazada
- [ ] Run Test trong Lazada → response OK
- [ ] Test với mock data → có đơn TEST trong DB
- [ ] Test với đơn thật (optional nhưng recommended)
- [ ] Logs đang chạy OK: `pm2 logs nextjs-app`
- [ ] Backup cron job đã setup
- [ ] Documentation đã đọc

---

## 🎉 Khi nào xem như xong?

✅ **Minimum** (để go-live):
- Code deployed
- Credentials configured
- Postback URL configured
- Run Test pass

✅ **Recommended** (production-ready):
- Minimum + Test với mock data pass
- Monitoring setup
- Backup cron job setup

✅ **Perfect** (best practice):
- Recommended + Test với đơn thật pass
- Alerts setup
- Documentation team đã đọc

---

## 📞 Cần giúp?

- 📖 Docs: `docs/LAZADA_POSTBACK_SETUP.md`
- 🔄 Flow: `docs/LAZADA_POSTBACK_FLOW.md`
- 🐛 Logs: `pm2 logs nextjs-app | grep LAZADA`
- 💬 Support: affiliate-vn@lazada.com

---

**Last updated**: 2024
**Version**: 1.0.0
