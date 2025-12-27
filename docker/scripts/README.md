# Automation Scripts

Các scripts PowerShell để quản lý SMD Microservices.

## ⚠️ Important: PowerShell Version

**Cả Windows PowerShell 5.x VÀ PowerShell Core 7+ đều được support!**

### Cách chạy scripts:

**Windows PowerShell 5.x (built-in Windows):**
```powershell
.\scripts\setup-env.ps1
.\scripts\build-all.ps1
.\scripts\up.ps1
```

**PowerShell Core 7+ (nếu đã cài):**
```powershell
pwsh scripts/setup-env.ps1
# hoặc
.\scripts\setup-env.ps1
```

**⚡ Khuyến nghị:** Dùng `.\scripts\...` - work cho cả 2 versions!

---

## 📜 Danh sách Scripts

### 1. setup-env.ps1
**Mục đích**: Tạo file `.env` với Groq API key

**Sử dụng:**
```powershell
# Interactive (có prompts)
.\scripts\setup-env.ps1

# Với API key sẵn
.\scripts\setup-env.ps1 -GroqApiKey "gsk_your_key_here"
```

**Chức năng:**
- Copy `.env.example` → `.env`
- Prompt user nhập Groq API key (hoặc nhận từ parameter)
- Validate configuration
- Hiển thị hướng dẫn next steps

**Khi nào dùng:** Lần đầu setup project hoặc khi cần reset `.env`

---

### 2. build-all.ps1
**Mục đích**: Build tất cả services (Java + AI service)

**Sử dụng:**
```powershell
.\scripts\build-all.ps1
```

**Chức năng:**
- Validate `.env` file tồn tại
- Build tất cả Java services với Maven Wrapper
- Build AI service Docker images (ai-service + ai-worker)
- Hiển thị progress và summary

**Services được build:**
- common-lib
- discovery-server
- config-server
- api-gateway
- auth-service
- academic-service
- public-service
- workflow-service
- syllabus-service
- ai-service (Docker)
- ai-worker (Docker)

**Output:** JAR files trong `target/` folders + Docker images

---

### 3. up.ps1
**Mục đích**: Khởi động toàn bộ Docker stack

**Sử dụng:**
```powershell
# Start services
.\scripts\up.ps1

# Build và start
.\scripts\up.ps1 -Build
```

**Chức năng:**
- Validate `.env` file và GROQ_API_KEY
- Start tất cả containers với `docker-compose up -d`
- Wait for services to be ready
- Health check cho AI Service và Eureka
- Hiển thị endpoints và useful commands

**Validation checks:**
- ❌ Dừng nếu `.env` không tồn tại
- ⚠️ Warning nếu API key chưa config (cho phép continue)
- ✅ Confirm healthy sau khi start

**Output:**
```
Service Status
Key Endpoints
Useful Commands
```

---

### 4. down.ps1
**Mục đích**: Dừng tất cả services

**Sử dụng:**
```powershell
# Dừng services (giữ data)
.\scripts\down.ps1

# Dừng và XÓA TẤT CẢ DATA
.\scripts\down.ps1 -RemoveVolumes
```

**Chức năng:**
- Stop containers với `docker-compose down`
- Option: Remove volumes (-v flag)
- Confirmation prompt khi xóa volumes
- Hiển thị restart instructions

**⚠️ Warning:** `-RemoveVolumes` sẽ xóa:
- PostgreSQL databases
- RabbitMQ queues
- Redis cache
- Kafka topics
- Tất cả persistent data

---

### 5. health-check.ps1
**Mục đích**: Kiểm tra health của tất cả services

**Sử dụng:**
```powershell
.\scripts\health-check.ps1
```

**Chức năng:**
- HTTP health check cho 9 services
- Docker container status
- PostgreSQL database check (6 databases)
- Kafka topic check (ai-events)
- Summary report với pass/fail count

**Services được check:**
1. Eureka Discovery (http://localhost:8761)
2. Config Server (:8888/actuator/health)
3. API Gateway (:8080/actuator/health)
4. Auth Service (:8081/actuator/health)
5. Academic Service (:8082/actuator/health)
6. Public Service (:8083/actuator/health)
7. Workflow Service (:8084/actuator/health)
8. Syllabus Service (:8085/actuator/health)
9. **AI Service** (:8000/health)

**Output:**
```
✅ HEALTHY - Service responding correctly
⚠️ DEGRADED - Service up but with issues
❌ DOWN - Service not responding
```

**Exit code:**
- `0` - All healthy
- `1` - Some failures (for CI/CD)

---

## 🔄 Workflow thông thường

### Lần đầu setup
```powershell
# 1. Setup environment
.\scripts\setup-env.ps1

# 2. Build all
.\scripts\build-all.ps1

# 3. Start stack
.\scripts\up.ps1

# 4. Verify health
.\scripts\health-check.ps1
```

### Development workflow
```powershell
# Morning: Start
.\scripts\up.ps1

# Work...

# Check status
.\scripts\health-check.ps1

# Evening: Stop
.\scripts\down.ps1
```

### Sau khi sửa code
```powershell
# 1. Stop services
.\scripts\down.ps1

# 2. Rebuild service đã sửa
cd <service-folder>
.\mvnw.cmd clean package -DskipTests

# Hoặc rebuild tất cả
.\scripts\build-all.ps1

# 3. Restart
.\scripts\up.ps1 -Build
```

### Khi có lỗi
```powershell
# 1. Check health
.\scripts\health-check.ps1

# 2. View logs
docker-compose logs -f <service-name>

# 3. Restart specific service
docker-compose restart <service-name>

# 4. Full reset (nếu cần)
.\scripts\down.ps1 -RemoveVolumes
.\scripts\up.ps1 -Build
```

---

## 🛠️ Advanced Usage

### Build script với selective build
```powershell
# Edit build-all.ps1 to comment out services bạn không cần
# Ví dụ: comment workflow-service nếu không dùng
```

### Up script với custom wait time
```powershell
# Edit up.ps1, tìm dòng:
Start-Sleep -Seconds 15
# Tăng nếu máy chậm
```

### Health check trong CI/CD
```powershell
# Run và check exit code
.\scripts\health-check.ps1
if ($LASTEXITCODE -ne 0) {
  Write-Error "Health check failed"
  exit 1
}
```

---

## 📝 Script parameters

### setup-env.ps1
| Parameter | Type | Mô tả | Default |
|-----------|------|-------|---------|
| `-GroqApiKey` | string | API key (skip prompt) | (empty) |

### up.ps1
| Parameter | Type | Mô tả | Default |
|-----------|------|-------|---------|
| `-Build` | switch | Build trước khi start | false |

### down.ps1
| Parameter | Type | Mô tả | Default |
|-----------|------|-------|---------|
| `-RemoveVolumes` | switch | Xóa tất cả volumes | false |

---

## 🐛 Troubleshooting Scripts

### Script không chạy được

**Problem:** "execution policy" error

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Script không tìm thấy docker-compose

**Problem:** "docker-compose: command not found"

**Solution:**
```powershell
# Cài Docker Desktop
# Verify:
docker-compose version
```

### Setup-env tạo .env nhưng không set key

**Problem:** Key vẫn là placeholder

**Solution:**
```powershell
# Manual edit
notepad .env
# Change: GROQ_API_KEY=gsk_your_actual_key

# Hoặc run lại với parameter
pwsh scripts/setup-env.ps1 -GroqApiKey "gsk_..."
```

### Build-all fails on Java service

**Problem:** Maven build error

**Solution:**
```powershell
# Check JDK version
java -version  # Need JDK 17+ (prefer 21)

# Try manual build
cd <service-folder>
.\mvnw.cmd clean package -DskipTests -X  # Verbose mode
```

### Up script - AI service không healthy

**Problem:** Health check fails for AI service

**Solution:**
```powershell
# 1. Check logs
docker-compose logs ai-service ai-worker

# 2. Common issues:
# - GROQ_API_KEY not set → Edit .env
# - PostgreSQL not ready → Wait longer
# - Port conflict → Check port 8000

# 3. Restart
docker-compose restart ai-service ai-worker
```

---

## 🎯 Best Practices

1. **Luôn chạy health-check sau khi start**
   ```powershell
   .\scripts\up.ps1
   Start-Sleep -Seconds 10
   .\scripts\health-check.ps1
   ```

2. **Backup .env trước khi chạy setup-env**
   ```powershell
   Copy-Item .env .env.backup
   ```

3. **Sử dụng down thường xuyên để clean state**
   ```powershell
   # Mỗi ngày:
   .\scripts\down.ps1
   # Mỗi tuần:
   .\scripts\down.ps1 -RemoveVolumes
   ```

4. **Check logs khi có vấn đề**
   ```powershell
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f ai-service
   
   # Last 100 lines
   docker-compose logs --tail=100 ai-service
   ```

5. **Sử dụng -Build flag khi rebuild**
   ```powershell
   .\scripts\up.ps1 -Build
   # Thay vì:
   .\scripts\build-all.ps1
   .\scripts\up.ps1
   ```

---

## 📚 Related Documentation

- **[../DEPLOY.md](../DEPLOY.md)** - Full deployment guide
- **[../ai-service/PHASE_1_2_3_SETUP.md](../ai-service/PHASE_1_2_3_SETUP.md)** - AI Service setup
- **[../README.md](../README.md)** - Project overview
