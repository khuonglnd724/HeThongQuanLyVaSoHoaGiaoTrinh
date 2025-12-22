#!/bin/bash
# Bash script to start Celery worker (for Linux/Mac)
# Usage: ./start-worker.sh

echo "Starting Celery Worker..."

# Navigate to ai-service directory
cd "$(dirname "$0")"

# Activate virtual environment (adjust path if needed)
source ../.venv/bin/activate

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start Celery worker
echo "Worker starting with configuration:"
echo "  RabbitMQ: localhost:5672"
echo "  Redis: localhost:6379"
echo ""

celery -A app.workers.celery_app worker --loglevel=info
