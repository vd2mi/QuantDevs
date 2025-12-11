@echo off
echo Preparing for deployment...

if exist "backend\.env" (
    echo WARNING: backend\.env exists and should NOT be committed!
    echo Please remove it before deploying: del backend\.env
    exit /b 1
)

if exist ".gitignore" (
    echo .gitignore found
) else (
    echo WARNING: .gitignore not found!
    exit /b 1
)

echo All checks passed!
echo.
echo Next steps:
echo 1. Remove backend\.env if it exists
echo 2. git add .
echo 3. git commit -m "Prepare for deployment"
echo 4. git push origin main
echo.
echo Then follow DEPLOYMENT.md for Vercel and Hugging Face setup

