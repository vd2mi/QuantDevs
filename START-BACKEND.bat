@echo off
cd /d "%~dp0backend"

echo ========================================
echo Starting Backend Server
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo Creating .env template...
    (
        echo PORT=7860
        echo OPENAI_API_KEY=your_openai_api_key_here
        echo OPENAI_MODEL=gpt-4o-mini
    ) > .env
    echo.
    echo IMPORTANT: .env file created with template values.
    echo Please edit backend\.env and add your OpenAI API key!
    echo.
    echo Opening .env file...
    timeout /t 2 /nobreak >nul
    notepad .env
    echo.
    echo After saving your API key, run this script again.
    pause
    exit /b 0
)

echo Starting backend server on port 7860...
echo.
echo Backend will be available at: http://localhost:7860
echo.
echo Press Ctrl+C to stop the server.
echo.

cd /d "%~dp0backend"

REM Use node directly instead of npm start to avoid issues
"C:\Program Files\nodejs\node.exe" server.js

pause

