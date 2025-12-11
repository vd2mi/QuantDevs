@echo off
echo ========================================
echo Starting Backend Server
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo.
    echo Please create .env file with:
    echo   PORT=7860
    echo   OPENAI_API_KEY=your_api_key_here
    echo   OPENAI_MODEL=gpt-4o-mini
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Dependencies not installed. Installing now...
    echo.
    call install.bat
    echo.
)

echo Starting backend server on port 7860...
echo.
echo Press Ctrl+C to stop the server.
echo.

"C:\Program Files\nodejs\node.exe" server.js

