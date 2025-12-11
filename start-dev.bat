@echo off
echo Starting development server...
echo.

REM Check if Next.js is installed
if exist "node_modules\.bin\next.cmd" (
    echo Next.js found! Starting server...
    echo.
    echo Open http://localhost:3000 in your browser once the server starts.
    echo.
    echo Press Ctrl+C to stop the server.
    echo.
    call "node_modules\.bin\next.cmd" dev
) else (
    echo ERROR: Next.js is not installed!
    echo.
    echo Please run install.bat first to install dependencies.
    echo This will take 2-3 minutes - please be patient and don't cancel it.
    echo.
    pause
    exit /b 1
)
pause

