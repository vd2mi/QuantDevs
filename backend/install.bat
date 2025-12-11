@echo off
echo ========================================
echo Installing Backend Dependencies
echo ========================================
echo.

"C:\Program Files\nodejs\npm.cmd" install

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Installation complete!
    echo ========================================
    echo.
) else (
    echo.
    echo ========================================
    echo Installation had errors.
    echo ========================================
    echo.
)
pause

