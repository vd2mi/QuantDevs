@echo off
echo ========================================
echo Installing dependencies...
echo ========================================
echo.
echo IMPORTANT: This will take 2-3 minutes.
echo Please DO NOT close this window or press Ctrl+C.
echo.
echo You will see many messages scrolling - this is normal!
echo Wait for "added XXX packages" message.
echo.
pause
echo.
echo Starting installation now...
echo.

"C:\Program Files\nodejs\npm.cmd" install

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Installation complete!
    echo ========================================
    echo.
    echo You can now run start-dev.bat to start the server.
    echo.
) else (
    echo.
    echo ========================================
    echo Installation had errors.
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo You may need to close other programs that might be
    echo locking files in the node_modules folder.
    echo.
)
pause

