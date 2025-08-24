#!/bin/bash

# Build script for colvert-copilot-runtime-endpoint
set -e

echo "🚀 Starting build process for colvert-copilot-runtime-endpoint..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v)"

# Clean previous builds
print_status "Cleaning previous build artifacts..."
rm -rf dist/ build/ .nyc_output/ coverage/ 2>/dev/null || true

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Run tests
print_status "Running tests..."
npm test

# Create dist directory
print_status "Creating distribution directory..."
mkdir -p dist

# Copy source files
print_status "Copying source files..."
cp -r src/* dist/
cp package.json dist/
cp README.md dist/ 2>/dev/null || true

# Validate build
print_status "Validating build..."
node -c dist/server.js

# Create production package.json for dist
print_status "Creating production package.json..."
cd dist
npm pkg delete devDependencies
npm pkg delete scripts.build
npm pkg delete scripts.dev
cd ..

print_status "Build completed successfully! 🎉"
print_status "Distribution files are in the 'dist' directory"
print_status "To run the production build: cd dist && npm start"
