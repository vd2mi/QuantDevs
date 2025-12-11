@echo off
echo ========================================
echo Starting Both Frontend and Backend
echo ========================================
echo.
echo This will start:
echo   1. Backend server (port 7860)
echo   2. Frontend server (port 3000)
echo.
echo IMPORTANT: Keep both windows open to see logs!
echo.
echo Press any key to start...
pause >nul

echo.
echo Starting Backend Server...
start "Backend Server (Port 7860)" cmd /k "cd /d %~dp0backend && "C:\Program Files\nodejs\node.exe" server.js"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server (Port 3000)" cmd /k "cd /d %~dp0 && if exist node_modules\.bin\next.cmd (call "node_modules\.bin\next.cmd" dev) else (echo ERROR: Please run install.bat first && pause)"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend: http://localhost:7860
echo Frontend: http://localhost:3000
echo.
echo Check the "Backend Server" window for debug logs
echo when you upload a file.
echo.
pause

