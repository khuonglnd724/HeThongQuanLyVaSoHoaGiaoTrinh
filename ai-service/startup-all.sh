#!/bin/bash
# AI Service Startup Script for Linux/Mac
# Usage: ./startup-all.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================"
echo "AI Service - Full Startup"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check if Docker is running
echo -e "${CYAN}🐳 Checking Docker...${NC}"
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo -e "${YELLOW}   Please start Docker first${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Start Docker containers
echo ""
echo -e "${CYAN}📦 Starting Docker containers...${NC}"
docker-compose up -d

echo -e "${YELLOW}⏳ Waiting for services to be ready (30 seconds)...${NC}"
sleep 30

echo -e "${GREEN}✅ Docker services are ready${NC}"

# Python path
PYTHON_PATH="../.venv/bin/python"

if [ ! -f "$PYTHON_PATH" ]; then
    echo -e "${RED}❌ Virtual environment not found!${NC}"
    echo -e "${YELLOW}   Run: python3 -m venv ../.venv${NC}"
    exit 1
fi

echo ""
echo "========================================"
echo "Starting Components"
echo "========================================"
echo ""

# Start API Server in background
echo -e "${CYAN}📡 Starting API Server...${NC}"
"$PYTHON_PATH" -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > api.log 2>&1 &
API_PID=$!
echo -e "${GREEN}✅ API Server started (PID: $API_PID)${NC}"

# Give API time to start
sleep 3

# Start Celery Worker in background
echo -e "${CYAN}⚙️  Starting Celery Worker...${NC}"
"$PYTHON_PATH" -m celery -A app.workers.celery_app worker --loglevel=info > worker.log 2>&1 &
WORKER_PID=$!
echo -e "${GREEN}✅ Celery Worker started (PID: $WORKER_PID)${NC}"

# Save PIDs to file for later cleanup
echo "$API_PID" > .pids
echo "$WORKER_PID" >> .pids

echo ""
echo "========================================"
echo -e "${GREEN}✅ AI Service is Running!${NC}"
echo "========================================"
echo ""
echo -e "${CYAN}📋 Access Points:${NC}"
echo -e "${GREEN}   API Documentation: http://localhost:8000/docs${NC}"
echo -e "${GREEN}   RabbitMQ Manager: http://localhost:15672 (guest/guest)${NC}"
echo -e "${GREEN}   Kafka UI: http://localhost:8080${NC}"
echo ""
echo -e "${CYAN}💡 Tips:${NC}"
echo -e "${YELLOW}   - Logs are in api.log and worker.log${NC}"
echo -e "${YELLOW}   - To stop: killall python or docker-compose down${NC}"
echo -e "${YELLOW}   - View API logs: tail -f api.log${NC}"
echo -e "${YELLOW}   - View Worker logs: tail -f worker.log${NC}"
echo ""
echo -e "${CYAN}📖 Test API:${NC}"
echo -e "${GREEN}   1. Go to http://localhost:8000/docs${NC}"
echo -e "${GREEN}   2. POST /ai/suggest with syllabusId${NC}"
echo -e "${GREEN}   3. Copy jobId from response${NC}"
echo -e "${GREEN}   4. GET /ai/jobs/{jobId} to check status${NC}"
echo ""

# Keep script running (Ctrl+C to exit)
wait
