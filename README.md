# HeThongQuanLyVaSoHoaGiaoTrinh

Hệ thống quản lý và số hóa giáo trình với kiến trúc microservices và AI Service.

## 🚀 Quick Start

### 1. Setup môi trường (lần đầu)
```powershell
# Tạo .env file với Groq API key
.\scripts\setup-env.ps1
```

### 2. Build tất cả services
```powershell
.\scripts\build-all.ps1
```

### 3. Khởi động hệ thống
```powershell
.\scripts\up.ps1
```

### 4. Kiểm tra health
```powershell
.\scripts\health-check.ps1
```

### 5. Dừng hệ thống
```powershell
# Dừng nhưng giữ data
.\scripts\down.ps1

# Dừng và xóa tất cả data
.\scripts\down.ps1 -RemoveVolumes
```

## 📋 Services & Endpoints

### Java Microservices
- **API Gateway**: http://localhost:8080
- **Discovery Server (Eureka)**: http://localhost:8761
- **Auth Service**: http://localhost:8081
- **Academic Service**: http://localhost:8082
- **Syllabus Service**: http://localhost:8085
- **Workflow Service**: http://localhost:8084
- **Public Service**: http://localhost:8083

### AI Service (Python/FastAPI)
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **WebSocket**: ws://localhost:8000/notifications/ws/{userId}

### Infrastructure
- **PostgreSQL**: localhost:5432
- **RabbitMQ**: http://localhost:15672 (guest/guest)
- **Redis**: localhost:6379
- **Kafka UI**: http://localhost:8089

## 📦 Automation Scripts

| Script | Mô tả |
|--------|-------|
| `setup-env.ps1` | Tạo .env file và config Groq API key |
| `build-all.ps1` | Build tất cả Java services + AI service |
| `up.ps1` | Khởi động toàn bộ stack với validation |
| `down.ps1` | Dừng services (option: xóa volumes) |
| `health-check.ps1` | Kiểm tra health của tất cả services |

## 📚 Documentation

- **[DEPLOY.md](DEPLOY.md)** - Hướng dẫn deployment chi tiết
- **[ai-service/PHASE_1_2_3_SETUP.md](ai-service/PHASE_1_2_3_SETUP.md)** - Setup AI Service (3 phases)
- **AI Service Docs**: http://localhost:8000/docs (khi đang chạy)

## 🤖 AI Service Features

AI Service sử dụng **Groq API (FREE)** với 5 tác vụ:

1. **suggest** - Gợi ý cải thiện đề cương
2. **chat** - AI assistant với conversation history
3. **diff** - So sánh thay đổi giữa 2 versions
4. **clo_check** - Kiểm tra CLO-PLO consistency  
5. **summary** - Tóm tắt tài liệu giáo dục

**Real-time notifications** qua WebSocket + Kafka events.

## 🔧 Requirements

- Docker Desktop
- PowerShell 5+
- JDK 21 (Maven Wrapper included)
- **Groq API Key** (miễn phí) - https://console.groq.com/keys

## 🐛 Troubleshooting

Xem logs:
```powershell
docker-compose logs -f [service-name]
```

Common issues - xem [DEPLOY.md](DEPLOY.md#troubleshooting)
