#!/bin/bash

# Deployment script for colvert-copilot-runtime-endpoint
set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Build the project
print_status "Building project..."
npm run build:script

# Check if build was successful
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

# Install production dependencies in dist
print_status "Installing production dependencies..."
cd dist
npm ci --only=production

print_status "Deployment package ready in 'dist' directory! 🎉"
print_status "To start the production server: cd dist && npm start"
print_status "Or use Docker: npm run deploy:docker"
