@echo off
echo ========================================
echo Backend Log Checker
echo ========================================
echo.
echo This script helps you find backend logs.
echo.
echo After uploading a file, check the backend console window
echo for lines containing:
echo   - "All columns found:"
echo   - "Total rows in file:"
echo   - "First row sample:"
echo   - "PARSE ERROR CAUGHT:"
echo.
echo The backend console window should be visible where you
echo ran START-BACKEND.bat
echo.
echo Press any key to open the backend directory...
pause >nul
start explorer "%~dp0backend"
echo.
echo Backend directory opened. Look for server.js logs.
pause

