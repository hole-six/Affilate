-- Script kích hoạt platform Lazada
-- Chạy trên VPS: sqlite3 prisma/dev.db < scripts/activate-lazada-platform.sql

-- Kiểm tra trạng thái hiện tại
SELECT 'Trạng thái hiện tại:' as '';
SELECT code, name, status FROM Platform WHERE code = 'LAZADA';

-- Kích hoạt Lazada
UPDATE Platform 
SET status = 'active' 
WHERE code = 'LAZADA';

-- Kiểm tra sau khi update
SELECT '' as '';
SELECT 'Sau khi update:' as '';
SELECT code, name, status FROM Platform WHERE code = 'LAZADA';

-- Hiển thị tất cả platforms
SELECT '' as '';
SELECT 'Tất cả platforms:' as '';
SELECT code, name, status FROM Platform ORDER BY name;
