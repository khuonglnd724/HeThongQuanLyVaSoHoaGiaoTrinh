# README - AI Service

**AI Service** - FastAPI backend xử lý async tasks cho Syllabus Management System.

## 🎯 Tính Năng

- **Gợi Ý Nội Dung** - Suggestions cho giáo trình
- **AI Chat** - Q&A với AI assistant
- **So Sánh** - Diff phiên bản giáo trình
- **Kiểm Tra CLO-PLO** - Validate learning outcomes
- **Tóm Tắt** - Auto-summarize content
- **Công Việc** - Track async job status

## 🚀 Khởi Động (30 giây)

**1. Khởi động infrastructure:**
```bash
# Từ thư mục gốc
docker-compose up -d
```

**2. Khởi động AI service:**
```bash
cd ai-service
./startup-all.ps1    # Windows PowerShell
# hoặc
./startup-all.sh     # Linux/Mac
# hoặc
./startup-all.bat    # Windows CMD
```

**3. Truy cập Web UI:**
```
http://localhost:8000
```

## 📡 API Endpoints

| Endpoint | Method | Mục Đích |
|----------|--------|----------|
| `/` | GET | Web UI (recommended) |
| `/api` | GET | API documentation |
| `/health` | GET | Health check |
| `/ai/suggest` | POST | Gợi ý nội dung |
| `/ai/chat` | POST | Chat Q&A |
| `/ai/diff` | POST | So sánh phiên bản |
| `/ai/clo-check` | POST | Kiểm tra CLO-PLO |
| `/ai/summary` | POST | Tóm tắt nội dung |
| `/ai/jobs/{jobId}` | GET | Trạng thái công việc |

**Lưu ý:** Tất cả POST endpoints trả về `202 Accepted` với `jobId` để polling status.

## 🔧 Công Cụ Hữu Ích

| Tool | URL | Mục Đích |
|------|-----|----------|
| 🌐 Web UI | http://localhost:8000 | Giao diện chính |
| 📚 Swagger Docs | http://localhost:8000/docs | API testing |
| 🐰 RabbitMQ | http://localhost:15672 | Queue monitoring (guest/guest) |
| 🔍 Kafka UI | http://localhost:8089 | Event stream monitoring |

## 📂 Cấu Trúc

```
ai-service/
├── app/
│   ├── main.py              # FastAPI + mount static
│   ├── deps.py              # Configuration
│   ├── routers/             # 5 API routers
│   ├── schemas/             # Pydantic models
│   └── workers/             # Celery tasks
├── static/
│   ├── index.html           # Web UI
│   ├── css/style.css        # Styling
│   └── js/app.js            # API integration
├── requirements.txt         # Dependencies
├── Dockerfile               # Python 3.11
└── startup-all.*            # Automation scripts
```

## 🎨 Web UI

### Tabs:
1. **Gợi Ý** - Nhận suggestions cải thiện giáo trình
2. **Chat** - Hỏi đáp với AI
3. **So Sánh** - Phân tích sự khác biệt phiên bản
4. **Kiểm Tra CLO-PLO** - Validate learning outcomes
5. **Tóm Tắt** - Tóm tắt tự động
6. **Công Việc** - Theo dõi task status

### Luồng Xử Lý:
```
User Submit → POST /ai/{endpoint} → 202 + jobId
    ↓
Polling GET /ai/jobs/{jobId} (mỗi 1s)
    ↓
Status: queued → running → succeeded/failed
    ↓
Display Result
```

## 🔌 Kiến Trúc

```
Web UI (Browser)
    ↓ HTTP 202
FastAPI (Port 8000)
    ↓ AMQP
RabbitMQ (Message Broker)
    ↓
Celery Worker (Async Tasks)
    ↓ Store
Redis (Result Cache)
    ↓ Publish
Kafka (Event Stream)
```

## 🐛 Troubleshooting

**Lỗi kết nối API:**
```bash
# Kiểm tra API running
curl http://localhost:8000/api

# Hoặc browser: http://localhost:8000/api
```

**Worker không kết nối RabbitMQ:**
```bash
docker-compose logs rabbitmq
docker-compose restart rabbitmq
```

**Job không hoàn thành:**
```bash
# Kiểm tra worker logs
docker-compose logs ai-worker

# Kiểm tra RabbitMQ queue
# http://localhost:15672 → Queues
```

**Kafka error (thường ổn):**
```bash
# Kafka cần ~30s khởi động
docker-compose logs kafka | tail -20
```

## 📝 Cấu Hình

**Environment variables** (.env):
```bash
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
REDIS_HOST=localhost
REDIS_PORT=6379
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

## 🚀 Tiếp Theo

1. **Test Web UI** - http://localhost:8000
2. **Monitor Queue** - http://localhost:15672
3. **Check Events** - http://localhost:8089
4. **Implement real AI logic** (hiện là mock, process 2-3s)

---

**Quick Links:**
- 📖 Docs: [docs/](docs/)
- 💬 Issues: Check logs với `docker-compose logs`
- 🔗 API: http://localhost:8000/docs
