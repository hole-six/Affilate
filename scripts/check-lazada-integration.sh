#!/bin/bash

# Script kiểm tra tích hợp Lazada
# Chạy trên VPS: bash scripts/check-lazada-integration.sh

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          LAZADA INTEGRATION - HEALTH CHECK                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Tìm thư mục project
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Tìm thư mục project..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PROJECT_DIR=$(pwd)
echo "📁 Thư mục hiện tại: $PROJECT_DIR"

if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ Đúng thư mục project (có package.json)${NC}"
else
    echo -e "${RED}❌ Không tìm thấy package.json - Bạn có thể cần cd vào thư mục project${NC}"
    echo "   Thử: cd /var/www/aff-hoantien hoặc cd /var/www/iviback"
    exit 1
fi
echo ""

# 2. Check PM2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. Kiểm tra PM2 process..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✅ PM2 đã cài đặt${NC}"
    pm2 list | grep -E "name|online|stopped"
else
    echo -e "${YELLOW}⚠️  PM2 chưa cài đặt hoặc không trong PATH${NC}"
fi
echo ""

# 3. Check .env
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Kiểm tra .env credentials..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ File .env tồn tại${NC}"
    
    APP_URL=$(grep "NEXT_PUBLIC_APP_URL" .env | cut -d '=' -f2 | tr -d '"')
    echo "📍 App URL: $APP_URL"
    
    if grep -q "LAZADA_API_BASE_URL" .env; then
        BASE_URL=$(grep "LAZADA_API_BASE_URL" .env | cut -d '=' -f2 | tr -d '"')
        echo "🔗 Lazada API Base: $BASE_URL"
    else
        echo -e "${RED}❌ LAZADA_API_BASE_URL không có trong .env${NC}"
    fi
    
    if grep -q "LAZADA_APP_KEY=\"\"" .env || ! grep -q "LAZADA_APP_KEY" .env; then
        echo -e "${RED}❌ LAZADA_APP_KEY trống hoặc không có${NC}"
    else
        echo -e "${GREEN}✅ LAZADA_APP_KEY đã có${NC}"
    fi
    
    if grep -q "LAZADA_APP_SECRET=\"\"" .env || ! grep -q "LAZADA_APP_SECRET" .env; then
        echo -e "${RED}❌ LAZADA_APP_SECRET trống hoặc không có${NC}"
    else
        echo -e "${GREEN}✅ LAZADA_APP_SECRET đã có${NC}"
    fi
    
    if grep -q "LAZADA_ACCESS_TOKEN=\"\"" .env || ! grep -q "LAZADA_ACCESS_TOKEN" .env; then
        echo -e "${RED}❌ LAZADA_ACCESS_TOKEN trống hoặc không có${NC}"
    else
        echo -e "${GREEN}✅ LAZADA_ACCESS_TOKEN đã có${NC}"
    fi
else
    echo -e "${RED}❌ File .env không tồn tại${NC}"
fi
echo ""

# 4. Test Postback Endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Test Postback Endpoint..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

POSTBACK_URL="${APP_URL:-https://iviback.vn}/api/webhooks/lazada/postback"

echo "🧪 Testing GET: $POSTBACK_URL?order_id=test123"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$POSTBACK_URL?order_id=test123")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d ':' -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_STATUS")

echo "📥 Response: $BODY"
echo "📊 HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Endpoint hoạt động (HTTP 200)${NC}"
else
    echo -e "${RED}❌ Endpoint lỗi (HTTP $HTTP_STATUS)${NC}"
fi
echo ""

# 5. Test POST với mock data
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. Test POST với mock data..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TEST_ORDER_ID="TEST-$(date +%s)"
echo "🧪 Testing POST: $POSTBACK_URL"
POST_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$POSTBACK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"order_id\": \"$TEST_ORDER_ID\",
    \"status\": \"delivered\",
    \"payout\": \"100000\",
    \"sub_id1\": \"TEST_CUSTOMER\",
    \"sub_id2\": \"TEST_TRACKING\"
  }")

POST_HTTP_STATUS=$(echo "$POST_RESPONSE" | grep "HTTP_STATUS" | cut -d ':' -f2)
POST_BODY=$(echo "$POST_RESPONSE" | grep -v "HTTP_STATUS")

echo "📥 Response: $POST_BODY"
echo "📊 HTTP Status: $POST_HTTP_STATUS"

if [ "$POST_HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ POST endpoint hoạt động (HTTP 200)${NC}"
else
    echo -e "${RED}❌ POST endpoint lỗi (HTTP $POST_HTTP_STATUS)${NC}"
fi
echo ""

# 6. Check Logs
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. Xem logs gần đây (50 dòng cuối)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v pm2 &> /dev/null; then
    echo "📋 Logs có chứa 'LAZADA':"
    pm2 logs --nostream --lines 50 | grep -i lazada | tail -10
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Có logs Lazada${NC}"
    else
        echo -e "${YELLOW}⚠️  Không tìm thấy logs Lazada (có thể chưa có request nào)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PM2 không có, không thể xem logs${NC}"
fi
echo ""

# 7. Check Database
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. Kiểm tra Database..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DB_FILE=$(find . -name "*.db" | head -1)
if [ -n "$DB_FILE" ] && command -v sqlite3 &> /dev/null; then
    echo "📁 Database: $DB_FILE"
    
    ORDER_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM \"Order\" WHERE sourceType='lazada';" 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "📊 Tổng số đơn Lazada: $ORDER_COUNT"
        
        if [ "$ORDER_COUNT" -gt 0 ]; then
            echo ""
            echo "📋 5 đơn mới nhất:"
            sqlite3 -header -column "$DB_FILE" "SELECT orderExternalId, orderStatus, customerRewardAmount, createdAt FROM \"Order\" WHERE sourceType='lazada' ORDER BY createdAt DESC LIMIT 5;" 2>/dev/null
        fi
    else
        echo -e "${YELLOW}⚠️  Không thể query database${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Không tìm thấy .db file hoặc sqlite3 chưa cài${NC}"
fi
echo ""

# 8. Tóm tắt
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. TÓM TẮT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Postback URL cho Lazada:"
echo "   $POSTBACK_URL?order_id={_p_order_id}&sub_order_id={_p_sub_order_id}&offer={_p_offer}&sku_name={_p_sku_name}&status={_p_status}&payout={_p_payout}&pay_amount={_p_pay_amount}&currency={_p_currency}&sub_id1={sub_id1}&sub_id2={sub_id2}&sub_id3={sub_id3}&fulfilled_time={_p_fulfilled_time}&delivered_time={_p_delivered_time}&returned_time={_p_returned_time}"
echo ""
echo "📋 Next steps:"
echo "   1. Nếu endpoint OK nhưng thiếu credentials → Điền LAZADA_* vào .env"
echo "   2. Nếu có credentials → Cấu hình Postback URL trong Lazada dashboard"
echo "   3. Nếu đã cấu hình → Chờ đơn hàng thật hoặc Run Test trong Lazada"
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    HOÀN TẤT KIỂM TRA                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
