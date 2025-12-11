@echo off
echo ========================================
echo Starting Frontend Server
echo ========================================
echo.

cd /d "%~dp0"

REM Check if Next.js is installed
if not exist "node_modules\.bin\next.cmd" (
    echo ERROR: Next.js is not installed!
    echo.
    echo Please run install.bat first to install dependencies.
    echo.
    pause
    exit /b 1
)

echo Starting frontend server on port 3000...
echo.
echo Frontend will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server.
echo.

call "node_modules\.bin\next.cmd" dev

pause

