#!/bin/bash
# Run All Services Script for Linux/Mac

echo ""
echo "=================================================="
echo "  HE THONG QUAN LY VA SO HOA GIAO TRINH"
echo "  All Services Startup"
echo "=================================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v java &> /dev/null; then
    echo "✗ Java not found"
    exit 1
else
    echo "✓ Java is installed"
fi

if ! command -v npm &> /dev/null; then
    echo "✗ Node.js/npm not found"
    exit 1
else
    echo "✓ Node.js/npm is installed"
fi

if ! command -v mvn &> /dev/null; then
    echo "✗ Maven not found"
    exit 1
else
    echo "✓ Maven is installed"
fi

echo ""
echo "Starting services..."
echo ""

# Terminal 1: Backend
echo "[1/2] Starting Backend (Java Spring Boot)..."
(cd backend/public-service && mvn clean package -DskipTests && java -jar target/public-service-0.0.1-SNAPSHOT.jar) &
BACKEND_PID=$!

# Wait for backend
sleep 5

# Terminal 2: Frontend
echo "[2/2] Starting Frontend (React)..."
(cd frontend/public-portal && npm install --legacy-peer-deps && npm start) &
FRONTEND_PID=$!

echo ""
echo "=================================================="
echo "✓ All services started!"
echo "=================================================="
echo ""
echo "Backend (PID $BACKEND_PID): http://localhost:8083"
echo "Frontend (PID $FRONTEND_PID): http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all processes
wait
