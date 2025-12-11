#!/bin/bash

# Deployment Preparation Script
echo "🚀 Preparing for deployment..."

# Check for .env files
if [ -f "backend/.env" ]; then
    echo "⚠️  WARNING: backend/.env exists and should NOT be committed!"
    echo "   Please remove it before deploying: rm backend/.env"
    exit 1
fi

# Check for node_modules
if [ -d "node_modules" ] || [ -d "backend/node_modules" ]; then
    echo "✅ node_modules detected (will be ignored by .gitignore)"
fi

# Check for .gitignore
if [ ! -f ".gitignore" ]; then
    echo "⚠️  WARNING: .gitignore not found!"
    exit 1
fi

echo "✅ All checks passed!"
echo ""
echo "📋 Next steps:"
echo "1. Remove backend/.env if it exists"
echo "2. git add ."
echo "3. git commit -m 'Prepare for deployment'"
echo "4. git push origin main"
echo ""
echo "Then follow DEPLOYMENT.md for Vercel and Hugging Face setup"

