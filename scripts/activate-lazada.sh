#!/bin/bash

# Script kích hoạt platform Lazada trong production
# Cần chạy với session admin

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  KÍCH HOẠT LAZADA PLATFORM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cách 1: Gọi API với curl (cần admin session cookie)
echo "Bạn cần đăng nhập admin trước, sau đó:"
echo ""
echo "1. Mở browser, đăng nhập admin: https://iviback.vn/admin/login"
echo "2. Mở DevTools (F12) → Console"
echo "3. Paste lệnh này:"
echo ""
echo "fetch('/api/admin/platforms/LAZADA', {"
echo "  method: 'PATCH',"
echo "  headers: { 'Content-Type': 'application/json' },"
echo "  body: JSON.stringify({ status: 'active' })"
echo "}).then(r => r.json()).then(console.log)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Hoặc update trực tiếp database trên VPS:"
echo ""
echo "sqlite3 prisma/dev.db \"UPDATE Platform SET status='active' WHERE code='LAZADA';\""
echo "sqlite3 prisma/dev.db \"SELECT code, name, status FROM Platform;\""
echo ""
