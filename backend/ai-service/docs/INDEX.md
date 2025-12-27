# AI Service Documentation Structure

## 📚 Đọc Theo Thứ Tự Này

### 1️⃣ **QUICK_START.md** (2 phút)
- 3 bước khởi động nhanh
- Cách sử dụng Web UI cơ bản
- Links tới tools

👉 **Nếu chỉ muốn test nhanh, đọc file này**

---

### 2️⃣ **README.md** (10 phút)
- Tính năng chính (6 features)
- API endpoints (8 endpoints)
- Kiến trúc (diagram)
- Troubleshooting

👉 **Nếu muốn hiểu system hoạt động thế nào**

---

### 3️⃣ **SETUP.md** (20 phút)
- Setup chi tiết (dev + production)
- Environment variables
- Project structure
- Manual setup steps
- Testing procedures
- Monitoring tools

👉 **Nếu muốn setup development environment hoặc troubleshoot**

---

## 📂 Folder Structure

```
ai-service/
├── 📖 QUICK_START.md      ← Start here (2 min)
├── 📖 README.md           ← Then read this (10 min)
├── 📖 SETUP.md            ← For deep dive (20 min)
├── 📖 This file (INDEX.md)
│
├── 🚀 Startup Scripts
│   ├── startup-all.ps1    # Windows PowerShell
│   ├── startup-all.sh     # Linux/Mac
│   ├── startup-all.bat    # Windows CMD
│   └── start-worker.*     # Worker only
│
├── ⚙️  Configuration
│   ├── .env               # Your config (generated from .env.example)
│   ├── .env.example       # Template
│   ├── Dockerfile         # Python 3.11 image
│   └── requirements.txt   # Dependencies
│
├── 🐍 app/                # FastAPI application
│   ├── main.py            # Entry point (mount static, routes)
│   ├── deps.py            # Settings, environment config
│   ├── routers/           # API endpoints (6 files)
│   │   ├── health.py
│   │   ├── jobs.py
│   │   ├── suggest.py
│   │   ├── chat.py
│   │   ├── diff.py
│   │   ├── clo_check.py
│   │   └── summary.py
│   ├── schemas/           # Pydantic models (6 files)
│   │   ├── jobs.py
│   │   ├── suggest.py
│   │   ├── chat.py
│   │   ├── diff.py
│   │   ├── clo_check.py
│   │   └── summary.py
│   └── workers/           # Celery async tasks
│       ├── celery_app.py  # Config RabbitMQ + Redis
│       └── tasks.py       # 5 task implementations
│
├── 🌐 static/             # Web UI (served by FastAPI)
│   ├── index.html         # Interactive 6-tab interface
│   ├── css/
│   │   └── style.css      # Responsive design
│   └── js/
│       └── app.js         # Fetch + polling logic
│
└── 🐳 docker-compose.yml  # Old (use root compose)
```

---

## 🎯 Use Cases

### I want to **test the API quickly**
→ Read: **QUICK_START.md**

### I want to **understand the architecture**
→ Read: **README.md**

### I want to **setup development environment**
→ Read: **SETUP.md** → Setup section

### I want to **fix a problem**
→ Read: **README.md** → Troubleshooting
→ Then: **SETUP.md** → Common Issues

### I want to **deploy to production**
→ Read: **SETUP.md** → Production Setup
→ Then: Root **DEPLOY.md**

### I want to **modify the code**
→ Read: **SETUP.md** → Project Structure
→ Then: Check specific file comments

---

## 🔑 Key Concepts

### API Pattern: HTTP 202 Async
```
POST /ai/suggest
↓
202 Accepted + jobId
↓
Client polls GET /ai/jobs/{jobId}
↓
Response: status + result
```

### Architecture: Microservices
```
Browser → FastAPI → RabbitMQ → Celery Worker → Redis + Kafka
```

### Web UI: 6 Tabs
1. Gợi Ý (Suggestions)
2. Chat (Q&A)
3. So Sánh (Diff)
4. Kiểm Tra CLO-PLO
5. Tóm Tắt (Summary)
6. Công Việc (Job Status)

---

## 📞 Quick Reference

### Startup Commands

```bash
# Option 1: Automated (recommended)
./startup-all.ps1

# Option 2: Manual
uvicorn app.main:app --reload
celery -A app.workers.celery_app worker --loglevel=info --pool=solo

# Option 3: Docker
docker-compose up -d
```

### Access Points

```
http://localhost:8000         # Web UI
http://localhost:8000/docs    # Swagger
http://localhost:8000/api     # API root
http://localhost:15672        # RabbitMQ
http://localhost:8089         # Kafka UI
localhost:6379                # Redis
```

### Common Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Check infrastructure
docker-compose ps

# View logs
docker-compose logs -f ai-worker

# Stop all
docker-compose down
```

---

## 🎓 Learning Path

**Beginner:**
1. QUICK_START.md (run & test)
2. Use Web UI at http://localhost:8000

**Intermediate:**
1. README.md (understand flow)
2. SETUP.md (setup locally)
3. Modify form inputs, see responses

**Advanced:**
1. SETUP.md (full structure)
2. Modify routers/
3. Add new endpoints
4. Deploy to Docker

---

**Next Step:** Open [QUICK_START.md](QUICK_START.md) and run it! 🚀
