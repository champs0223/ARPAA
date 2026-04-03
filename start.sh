#!/bin/bash
set -e

echo "=== ARPAA Backend Start ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo ""
echo "Navigating to backend..."
cd admin/backend

echo "Installing dependencies..."
npm install

echo ""
echo "Starting server..."
node server.js
