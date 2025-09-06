#!/bin/bash

# AL-SUK Production Build Script
echo "🚀 Starting AL-SUK Production Build..."

# Set production environment
export NODE_ENV=production

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Install dependencies (if needed)
echo "📦 Checking dependencies..."
npm ci --only=production || npm install

# Run type checking
echo "🔍 Running type checking..."
npx tsc --noEmit

# Run build
echo "🏗️ Building for production..."
npx vite build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build completed successfully!"
    echo "📊 Build statistics:"
    du -sh dist/
    ls -la dist/
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 AL-SUK is ready for production!"
