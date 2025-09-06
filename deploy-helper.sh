#!/bin/bash

# AL-SUK Deployment Helper Script
echo "🚀 AL-SUK Production Deployment Helper"
echo "======================================"

# Configuration
BUILD_DIR="dist"

# Check if build exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory not found. Please run 'npm run build' first."
    exit 1
fi

echo "✅ Build directory found: $BUILD_DIR"
echo "📊 Build size: $(du -sh $BUILD_DIR | cut -f1)"
echo ""
echo "🎯 AL-SUK is ready to deploy!"
echo ""
echo "Upload the contents of '$BUILD_DIR' to your web server"
echo "See PRODUCTION-READY.md for detailed deployment instructions"
echo ""
echo "For local testing: npx vite preview"
