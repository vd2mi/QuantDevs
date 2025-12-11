@echo off
echo ========================================
echo Starting Frontend and Backend Servers
echo ========================================
echo.

REM Check if backend .env exists
if not exist "backend\.env" (
    echo WARNING: backend\.env file not found!
    echo.
    echo Please create backend\.env file with:
    echo   PORT=7860
    echo   OPENAI_API_KEY=your_api_key_here
    echo   OPENAI_MODEL=gpt-4o-mini
    echo.
    echo You can copy backend\.env.example to backend\.env and update it.
    echo.
    pause
)

REM Check if backend dependencies are installed
if not exist "backend\node_modules" (
    echo Backend dependencies not installed. Installing now...
    echo.
    cd backend
    call install.bat
    cd ..
    echo.
)

REM Check if backend .env exists
if not exist "backend\.env" (
    echo WARNING: backend\.env file not found!
    echo.
    echo Please create backend\.env file with:
    echo   PORT=7860
    echo   OPENAI_API_KEY=your_api_key_here
    echo   OPENAI_MODEL=gpt-4o-mini
    echo.
    echo You can copy backend\.env.example to backend\.env and update it.
    echo.
    pause
)

echo Starting both servers...
echo.
echo Frontend will run on: http://localhost:3000
echo Backend will run on: http://localhost:7860
echo.
echo Press Ctrl+C to stop both servers.
echo.

"C:\Program Files\nodejs\npm.cmd" run dev:all

pause

