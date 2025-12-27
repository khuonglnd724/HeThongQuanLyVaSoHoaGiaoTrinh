# 🚀 30-Second Quick Start

## 1. Start Infrastructure (from root)
```bash
docker-compose up -d
```

## 2. Start AI Service (in ai-service/)
```bash
./startup-all.ps1   # Windows
# or ./startup-all.sh (Linux/Mac)
```

## 3. Open Browser
```
http://localhost:8000
```

---

## 📱 Use Web UI

1. **Tab "Gợi Ý"** (Suggestions)
   - ID: `sys-001`
   - Submit → See suggestions

2. **Tab "Chat"** (Q&A)
   - Ask: "Giáo trình nên có mấy tuần?"
   - Get answer from AI

3. **Tab "Công Việc"** (Job Status)
   - Paste Job ID from result
   - Check status

---

## 🔗 Tools

| What | Where |
|------|-------|
| Web UI | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Queue Monitor | http://localhost:15672 (guest/guest) |
| Events | http://localhost:8089 |

---

## ❓ Issues?

**API not responding:**
```bash
curl http://localhost:8000/api
```

**Worker offline:**
```bash
docker-compose logs ai-worker
```

---

**Full docs:** Read [README.md](README.md) and [SETUP.md](SETUP.md)
