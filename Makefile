.PHONY: help docker-build docker-up docker-down docker-logs docker-clean docker-rebuild frontend-build frontend-run

help:
	@echo "=== SMD Microservices - Docker Commands ==="
	@echo ""
	@echo "make docker-build          Build all Docker images"
	@echo "make docker-up             Start all services (docker-compose up)"
	@echo "make docker-down           Stop all services"
	@echo "make docker-logs           Show logs from all containers"
	@echo "make docker-logs-f         Follow logs from all containers"
	@echo "make docker-clean          Remove containers and dangling images"
	@echo "make docker-rebuild        Rebuild from scratch (clean + build + up)"
	@echo ""
	@echo "make frontend-build        Build frontend Docker image only"
	@echo "make frontend-run          Run frontend container only"
	@echo ""

docker-build:
	@echo "🔨 Building all Docker images..."
	docker-compose build --no-cache
	@echo "✅ Build complete!"

docker-up:
	@echo "🚀 Starting all services..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo ""
	@echo "📌 Frontend: http://localhost:3000 (or 3001)"
	@echo "📌 API Gateway: http://localhost:8080"
	@echo "📌 Discovery Server: http://localhost:8761"
	@echo ""

docker-down:
	@echo "🛑 Stopping all services..."
	docker-compose down
	@echo "✅ Services stopped!"

docker-logs:
	@echo "📋 Showing logs from all containers..."
	docker-compose logs

docker-logs-f:
	@echo "📋 Following logs from all containers (Ctrl+C to stop)..."
	docker-compose logs -f

docker-ps:
	@echo "📦 Running containers:"
	docker-compose ps

docker-clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v
	docker image prune -f --filter "dangling=true"
	@echo "✅ Cleanup complete!"

docker-rebuild: docker-down docker-clean docker-build docker-up
	@echo "✅ Full rebuild complete!"

frontend-build:
	@echo "🔨 Building frontend Docker image..."
	docker build -f frontend/public-portal/Dockerfile -t smd-frontend:latest ./frontend/public-portal
	@echo "✅ Frontend image built!"

frontend-run:
	@echo "🚀 Running frontend container..."
	docker run -d -p 3000:3000 -p 3001:3000 --name smd-frontend smd-frontend:latest
	@echo "✅ Frontend started at http://localhost:3000"

status:
	@docker-compose ps
	@echo ""
	@echo "📊 Container stats:"
	@docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
