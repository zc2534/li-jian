@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 砺剑军事·14天防溺水夏令营 - 报名服务器

:start
cls
echo ╔══════════════════════════════════════════════════╗
echo ║  砺剑军事·14天防溺水夏令营 - 报名通道        ║
echo ║  CCTV7展播品牌 · 官方报名网站                 ║
echo ╚══════════════════════════════════════════════════╝
echo.

:: Kill existing node on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING" 2^>nul') do (
    echo [清理] 关闭旧进程
    taskkill //F //PID %%a 2>nul >nul
)
timeout /t 2 /nobreak > nul

:: Kill old SSH tunnels
taskkill //F //IM ssh.exe 2>nul >nul

:: Start Express server
echo [启动] 正在启动本地服务器...
start "夏令营报名服务器" /B /MIN node server.js
timeout /t 3 /nobreak > nul

:: Verify server
curl -s -o nul -w "       服务器状态: HTTP %%{http_code}" http://localhost:3000/fangnishui.html 2>nul
echo.
echo.

:: Start localhost.run tunnel
echo [启动] 正在创建公网隧道...
echo.
echo ╔══════════════════════════════════════════════════╗
echo ║  📱 防溺水夏令营报名页面已上线！             ║
echo ║                                              ║
echo ║  报名网址: 见下方 lhr.life 地址              ║
echo ║  咨询电话: 13875813596                       ║
echo ║                                              ║
echo ║  家长手机/电脑均可直接打开访问               ║
echo ║  无需点击确认页，即开即用                    ║
echo ╚══════════════════════════════════════════════════╝
echo.

ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes -R 80:localhost:3000 nokey@localhost.run

echo.
echo ═══════════════════════════════════════════════
echo 隧道已断开，10秒后自动重连...
echo 按 Ctrl+C 可退出
echo ═══════════════════════════════════════════════
timeout /t 10 /nobreak > nul
goto start
