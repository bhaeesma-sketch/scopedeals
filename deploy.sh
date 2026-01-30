#!/bin/bash
echo "========================================"
echo "   ScopeDeals Deployment Helper"
echo "========================================"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js first."
    exit 1
fi

echo "1. Installing Vercel CLI (this might take a minute)..."
# Try to install locally if global fails, or use npx
npm install -g vercel || echo "Global install failed, trying to use npx..."

echo "----------------------------------------"
echo "2. Logging in to Vercel"
echo "   Please follow the instructions in the browser window that opens."
echo "----------------------------------------"
npx vercel login

echo "----------------------------------------"
echo "3. Deploying Website"
echo "   Just press ENTER for all the questions below to accept defaults."
echo "----------------------------------------"
npx vercel

echo "========================================"
echo "   Deployment Complete!"
echo "========================================"
