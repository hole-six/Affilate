@echo off
echo ========================================
echo SSH vao VPS va check Lazada
echo ========================================
echo.

REM Tao file commands tam thoi
echo cd /var/www/aff-hoantien 2^>^/dev^/null ^|^| cd /var/www/iviback 2^>^/dev^/null ^|^| cd ~ > %TEMP%\ssh_commands.txt
echo bash scripts/check-lazada-integration.sh >> %TEMP%\ssh_commands.txt

echo Dang ket noi den VPS...
echo.

REM SSH va chay commands
ssh root@14.225.255.110 < %TEMP%\ssh_commands.txt

REM Xoa file tam
del %TEMP%\ssh_commands.txt

echo.
echo ========================================
echo Hoan tat!
echo ========================================
pause
