#!/bin/bash

# AL-SUK Web App Deployment Script v1.0.8
# This script builds and prepares the web app for deployment
# Features: CORS fixes, Currency consistency with mobile app (UGX)

echo "🚀 AL-SUK Web App Deployment v1.0.8"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing dependencies..."
npm ci

echo ""
echo "🔍 Running type checks..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ Type check failed. Please fix the errors before deploying."
    exit 1
fi

echo ""
echo "🏗️  Building production version..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "📋 Release Notes v1.0.8:"
echo "• ✅ Fixed CORS issues with backend"
echo "• ✅ Ensured currency consistency (UGX) with mobile app"
echo "• ✅ Updated all hardcoded currency values to use constants"
echo "• ✅ Enhanced payment formatting across the app"
echo ""
echo "📁 Built files are in the 'dist' folder"
echo "🌐 Ready for deployment to production server"
echo ""
echo "📤 To deploy to cPanel:"
echo "1. Upload the contents of the 'dist' folder to your public_html directory"
echo "2. Make sure the backend API is accessible at https://app.alsukssd.com/api"
echo "3. Test the app to ensure API calls work properly"
echo ""
echo "🎉 Deployment preparation complete!"
