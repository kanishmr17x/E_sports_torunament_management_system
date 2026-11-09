#!/bin/bash

# E-Sports Platform - Deployment Script
# This script prepares the application for deployment

echo "🚀 Starting E-Sports Platform Deployment..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install server dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"

# Install client dependencies
cd ../client
echo "📦 Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed"

# Build frontend
echo "🔨 Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build frontend"
    exit 1
fi
echo "✅ Frontend built successfully"

cd ..

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set environment variables in server/.env"
echo "2. Run: npm start (from server directory)"
echo "3. Application will be available at the configured PORT"
echo ""
echo "📚 Documentation: See DEPLOYMENT.md for detailed instructions"
