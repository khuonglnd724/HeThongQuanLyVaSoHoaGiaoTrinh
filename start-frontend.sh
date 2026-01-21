#!/usr/bin/env bash

# ✅ Single Frontend - Quick Start Script
# Runs the Single React SPA on port 3000

set -e

echo "╔════════════════════════════════════════╗"
echo "║  SMD Frontend - Single React SPA      ║"
echo "║  Port: 3000                           ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Navigate to frontend directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRONTEND_DIR="$SCRIPT_DIR/frontend/public-portal"

echo "📂 Frontend directory: $FRONTEND_DIR"
echo ""

# Check if node_modules exists
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "📥 Installing dependencies..."
    cd "$FRONTEND_DIR"
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Start development server
echo "🚀 Starting development server..."
echo "⏳ Server will start in a few seconds..."
echo ""
echo "📍 Access at: http://localhost:3000"
echo "🔐 Demo accounts:"
echo "   - Student:        student@smd.edu.vn / student123"
echo "   - Lecturer:       lecturer@smd.edu.vn / lecturer123"
echo "   - Academic:       academic@smd.edu.vn / academic123"
echo "   - Admin:          admin@smd.edu.vn / admin123"
echo "   - HoD:            hod@smd.edu.vn / hod123"
echo "   - Rector:         rector@smd.edu.vn / rector123"
echo ""
echo "❌ To stop: Press Ctrl+C"
echo ""

cd "$FRONTEND_DIR"
npm start
