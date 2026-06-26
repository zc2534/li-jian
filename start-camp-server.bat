@echo off
cd /d "%~dp0"
echo ============================================
echo   砺剑军事·14天防溺水夏令营
echo   启动本地服务器 + 公网隧道
echo ============================================
echo.

:: Kill any existing node processes on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING"') do (
    taskkill //F //PID %%a 2>nul
)

:: Start the Express server
echo [1/3] 启动本地服务器...
start /B node server.js > nul 2>&1
timeout /t 3 /nobreak > nul

:: Verify server is running
echo [2/3] 验证服务器...
curl -s -o nul -w "HTTP %%{http_code}" http://localhost:3000/fangnishui.html 2>nul
echo.

:: Start localtunnel
echo [3/3] 启动公网隧道...
echo.
echo ============================================
echo   📱 防溺水夏令营报名页面已上线！
echo ============================================
echo.
npx localtunnel --port 3000
echo.
echo 隧道已断开，按任意键退出...
pause > nul
