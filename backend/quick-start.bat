@echo off
echo ========================================
echo Quick Start Backend Server
echo ========================================
echo.

REM Check if .env exists, if not create a template
if not exist ".env" (
    echo Creating .env file template...
    (
        echo PORT=7860
        echo OPENAI_API_KEY=your_openai_api_key_here
        echo OPENAI_MODEL=gpt-4o-mini
    ) > .env
    echo.
    echo IMPORTANT: Please edit .env file and add your OpenAI API key!
    echo.
    echo Opening .env file for editing...
    timeout /t 3 /nobreak >nul
    notepad .env
    echo.
    echo After saving .env, run this script again to start the server.
    pause
    exit /b 0
)

echo Starting backend server...
echo Server will run on: http://localhost:7860
echo.
echo Press Ctrl+C to stop the server.
echo.

"C:\Program Files\nodejs\node.exe" server.js

