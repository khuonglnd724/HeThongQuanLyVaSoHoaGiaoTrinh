#!/bin/bash
# AI Service Startup Script for Linux/Mac
# Usage: ./startup-all.sh
# Note: Run root docker-compose first: docker-compose up -d

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================"
echo "AI Service - Startup (Local Mode)"
echo "========================================"
echo ""
echo "[!] This script runs API and Worker locally"
echo "[!] Infrastructure (RabbitMQ/Redis/Kafka) must be running from root docker-compose"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check if required containers are running
echo -e "${CYAN}[*] Checking infrastructure containers...${NC}"

REQUIRED_CONTAINERS=("smd-rabbitmq" "smd-redis" "smd-kafka")
MISSING_CONTAINERS=()

for container in "${REQUIRED_CONTAINERS[@]}"; do
    if ! docker ps --filter "name=$container" --filter "status=running" --format "{{.Names}}" | grep -q "$container"; then
        MISSING_CONTAINERS+=("$container")
    fi
done

if [ ${#MISSING_CONTAINERS[@]} -gt 0 ]; then
    echo -e "${RED}[!] Required containers not running: ${MISSING_CONTAINERS[*]}${NC}"
    echo ""
    echo -e "${YELLOW}[*] Please start infrastructure from project root:${NC}"
    echo -e "${CYAN}    cd ..${NC}"
    echo -e "${CYAN}    docker-compose up -d rabbitmq redis kafka zookeeper${NC}"
    echo ""
    echo -e "${YELLOW}Or start all services:${NC}"
    echo -e "${CYAN}    docker-compose up -d${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}[+] Infrastructure containers are running${NC}"

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
echo -e "${CYAN}[*] Access Points:${NC}"
echo -e "${GREEN}    API Documentation: http://localhost:8000/docs${NC}"
echo -e "${GREEN}    RabbitMQ Manager: http://localhost:15672 (guest/guest)${NC}"
echo -e "${GREEN}    Kafka UI: http://localhost:8089${NC}"
echo ""
echo -e "${CYAN}[*] Tips:${NC}"
echo -e "${YELLOW}    - Logs are in api.log and worker.log${NC}"
echo -e "${YELLOW}    - To stop: killall python${NC}"
echo -e "${YELLOW}    - From project root, run: docker-compose down (to stop infrastructure)${NC}"
echo -e "${YELLOW}    - View API logs: tail -f api.log${NC}"
echo -e "${YELLOW}    - View Worker logs: tail -f worker.log${NC}"
echo ""
echo -e "${CYAN}[*] Test API:${NC}"
echo -e "${GREEN}    1. Go to http://localhost:8000/docs${NC}"
echo -e "${GREEN}    2. POST /ai/suggest with syllabusId${NC}"
echo -e "${GREEN}    3. Copy jobId from response${NC}"
echo -e "${GREEN}    4. GET /ai/jobs/jobId to check status${NC}"
echo ""

# Keep script running (Ctrl+C to exit)
wait
