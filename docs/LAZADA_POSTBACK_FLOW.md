# 🔄 Lazada Postback Flow - Luồng hoạt động

## 📊 Sơ đồ tổng quan

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Khách     │         │  iviback.vn  │         │   Lazada    │
│  Hàng       │         │   Server     │         │  Platform   │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │ 1. Gửi link SP        │                        │
       │ ─────────────────────>│                        │
       │                       │                        │
       │                       │ 2. Gọi API getLink     │
       │                       │ ──────────────────────>│
       │                       │    + URL sản phẩm      │
       │                       │    + sub_id1=CUST001   │
       │                       │    + sub_id2=TRK456    │
       │                       │                        │
       │                       │ 3. Trả affiliate link  │
       │                       │ <──────────────────────│
       │                       │    + Promotion link    │
       │ 4. Nhận affiliate link│    + Commission rate   │
       │ <─────────────────────│                        │
       │                       │                        │
       │ 5. Click link → mua hàng ──────────────────────>│
       │                       │                        │
       │                       │                        ├─ Khách đặt hàng
       │                       │                        ├─ Fulfilled
       │                       │                        ├─ Shipped  
       │                       │                        ├─ Delivered
       │                       │                        │
       │                       │ 6. POSTBACK (D+1)      │
       │                       │ <──────────────────────│
       │                       │    POST /api/webhooks/lazada/postback
       │                       │    {                   │
       │                       │      order_id: "123"   │
       │                       │      status: "delivered"
       │                       │      payout: "150000"  │
       │                       │      sub_id1: "CUST001"│
       │                       │      sub_id2: "TRK456" │
       │                       │    }                   │
       │                       │                        │
       │                       ├─ Upsert Order vào DB   │
       │                       ├─ Tính commission       │
       │                       ├─ Check settlement (15d)│
       │                       ├─ Notify customer       │
       │                       │                        │
       │ 7. Thông báo Telegram │                        │
       │ <─────────────────────│                        │
       │    "Đơn đã về! +150k" │                        │
       │                       │                        │
```

## 🔁 Chi tiết các bước

### Bước 1-4: Tạo Affiliate Link (Realtime)

```typescript
// User gửi: https://lazada.vn/products/iphone-15-i123456.html
// Bot Telegram/Zalo nhận link

// lib/trackingLinkService.ts
const lazadaLink = await getLazadaLinkByUrl(originalUrl, {
  subId1: customer.customerCode,    // "CUST001"
  subId2: trackingCode,              // "TRK456"
  subId3: channelSource              // "TELEGRAM"
});

// Lazada trả về:
{
  promotionLink: "https://c.lazada.vn/t/c.abc123?sub_id1=CUST001&sub_id2=TRK456",
  commission: "5.2",  // 5.2% tỷ lệ hoa hồng
  productName: "iPhone 15 Pro Max"
}

// Bot trả link cho khách
```

### Bước 5: Khách mua hàng (Trên Lazada)

```
Timeline của đơn hàng:
─────────────────────────────────────────────────────────
T+0h    : Khách đặt hàng           → pending
T+2h    : Shop xác nhận             → fulfilled
T+1d    : Giao cho đơn vị vận chuyển → shipped
T+3d    : Giao hàng thành công      → delivered
T+18d   : Hết hạn đổi/trả           → settled (cộng tiền)
```

### Bước 6: Lazada gửi Postback (D+1 mỗi trạng thái)

```http
POST https://iviback.vn/api/webhooks/lazada/postback
Content-Type: application/json

{
  "order_id": "987654321",
  "sub_order_id": "987654321-1",
  "offer": "iPhone 15 Pro Max 256GB",
  "sku_name": "Blue",
  "status": "delivered",
  "payout": "1560000",        // 1.56M VND hoa hồng
  "pay_amount": "30000000",   // 30M VND giá trị đơn
  "currency": "VND",
  "sub_id1": "CUST001",       // ← Tracking: Customer code
  "sub_id2": "TRK456",        // ← Tracking: Tracking code
  "sub_id3": "TELEGRAM",      // ← Tracking: Channel
  "fulfilled_time": "2024-01-15T10:30:00Z",
  "delivered_time": "2024-01-18T14:20:00Z"
}
```

### Bước 7: Server xử lý (lib/lazadaOrders.ts)

```typescript
// 1. Tìm tracking link từ sub_id2
const trackingLink = await prisma.trackingLink.findFirst({
  where: { trackingCode: "TRK456" }
});

// 2. Xác định trạng thái đơn
// delivered nhưng chưa đủ 15 ngày → "processing"
// delivered và đủ 15 ngày → "approved" (cộng tiền)
const status = isSettlementReady(deliveredAt) 
  ? "approved" 
  : "processing";

// 3. Tính hoa hồng cho khách (80% sau thuế)
const rule = await getActiveCommissionRule();
const split = splitCommission(1560000, rule);
// → customerRewardAmount: 1248000 (80%)
// → systemProfitAmount: 312000 (20%)

// 4. Upsert vào database
await prisma.order.create({
  orderExternalId: "987654321:987654321-1",
  customerId: trackingLink.customerId,
  orderStatus: status,
  customerRewardAmount: 1248000,
  // ...
});

// 5. Nếu approved → notify khách
if (status === "approved") {
  await notifyCustomerTelegram(
    customerId,
    "🎉 Tiền đã về! Đơn 987654321 - Bạn nhận +1,248,000đ"
  );
  
  // Xử lý hoa hồng giới thiệu (nếu có)
  await handleReferralBonus(order);
}
```

## 🕐 Timeline thực tế

```
T+0     : Khách click link affiliate
T+2h    : Khách đặt hàng → fulfilled
T+1d+2h : Lazada gửi postback #1 (fulfilled) → Order tạo, status="pending"
T+3d    : Đơn delivered
T+4d    : Lazada gửi postback #2 (delivered) → Order update, status="processing"
T+18d   : Đủ 15 ngày settlement
T+18d   : Cron job check → chuyển status="approved" → notify khách → cộng tiền
```

**Lưu ý**: 
- Postback gửi D+1 (24h sau sự kiện)
- Settlement check: 15 ngày kể từ ngày delivered
- Cron job chạy mỗi 30 phút để check settlement

## 🔒 Security & Validation

```typescript
// app/api/webhooks/lazada/postback/route.ts

// 1. Validate required fields
if (!body.order_id) {
  return { status: "fail", msg: "missing order_id" };
}

// 2. Idempotency - cùng 1 đơn gửi nhiều lần
// → upsert, không duplicate
const existing = await prisma.order.findUnique({
  where: { 
    platformId_orderExternalId: {
      platformId: lazadaPlatform.id,
      orderExternalId: buildOrderId(body)
    }
  }
});

// 3. Clawback protection - đơn đã trả tiền
if (existing.payoutStatus === "paid") {
  // Khoá số tiền, chỉ update status
  // Nếu status = "returned" → tạo đơn CLAWBACK âm
}

// 4. Logging cho debugging
console.log("[LAZADA_POSTBACK]", {
  orderId: body.order_id,
  status: body.status,
  customerId: trackingLink?.customerId || "UNMAPPED"
});
```

## 🎁 Bonus: Referral Commission

```
Nếu khách A được giới thiệu bởi khách B:

1. Đơn của A approved (1,248,000đ)
2. Tính referral bonus cho B (5% after-tax)
   = (1,248,000 + 312,000) × 5% = 78,000đ
3. Tạo đơn REF-987654321 cho B
4. Notify B: "Bạn vừa nhận 78,000đ hoa hồng giới thiệu"

Điều kiện:
- A đăng ký trong vòng 6 tháng (hoặc B là Partner không giới hạn)
- Tối đa 5 đơn đầu của A (hoặc không giới hạn nếu B là Partner)
```

## 📈 Monitoring & Debug

### Xem logs realtime
```bash
# Trên VPS
pm2 logs nextjs-app --lines 100 | grep LAZADA

# Filter postback
pm2 logs nextjs-app | grep LAZADA_POSTBACK

# Filter success
pm2 logs nextjs-app | grep LAZADA_POSTBACK_SUCCESS
```

### Check database
```sql
-- Đơn Lazada mới nhất
SELECT * FROM Order 
WHERE sourceType = 'lazada' 
ORDER BY createdAt DESC 
LIMIT 10;

-- Đơn chưa map được customer
SELECT * FROM Order 
WHERE sourceType = 'lazada' 
AND customerId IS NULL;

-- Đơn đang chờ settlement
SELECT * FROM Order 
WHERE sourceType = 'lazada' 
AND orderStatus = 'processing';
```

### Test postback thủ công
```bash
curl -X POST "https://iviback.vn/api/webhooks/lazada/postback" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "TEST123",
    "status": "delivered",
    "payout": "100000",
    "sub_id1": "CUST001",
    "sub_id2": "TRK456"
  }'
```

## 🚨 Error Handling

```typescript
// Xử lý lỗi nhưng vẫn return 200
// → Tránh Lazada retry liên tục
try {
  await upsertLazadaOrder(data);
  return { status: "ok" };
} catch (error) {
  console.error("[LAZADA_POSTBACK_ERROR]", error);
  
  // Vẫn return 200, nhưng status="error"
  return NextResponse.json(
    { status: "error", msg: error.message },
    { status: 200 }  // ← Quan trọng!
  );
}
```

**Tại sao return 200 khi lỗi?**
- 4xx/5xx → Lazada retry nhiều lần → spam logs
- 200 + status="error" → Lazada biết đã nhận, không retry
- Error vẫn được log để admin fix

## ✅ Checklist Go-Live

- [ ] Deploy code mới lên VPS
- [ ] .env có đủ LAZADA_APP_KEY, LAZADA_APP_SECRET, LAZADA_ACCESS_TOKEN
- [ ] Test endpoint: `curl https://iviback.vn/api/webhooks/lazada/postback?order_id=test`
- [ ] Cấu hình Postback URL trong Lazada dashboard
- [ ] Run Test trong Lazada dashboard → response "ok"
- [ ] Tạo đơn thật để test (mua 1 sản phẩm rẻ)
- [ ] Monitor logs trong 24-48h đầu
- [ ] Setup alert nếu có lỗi (email/Telegram)

## 🎉 Done!

Flow hoạt động hoàn chỉnh. Khách đặt hàng → Lazada tự động gửi về → Hệ thống tự xử lý → Cộng tiền → Notify khách. Fully automated! 🚀
