# Cài Đặt Node.js - Hướng Dẫn Chi Tiết

## ❌ Vấn đề Hiện Tại
```
bash: npm: command not found
```
👉 **Nguyên nhân**: Node.js chưa cài hoặc chưa thêm vào PATH

---

## ✅ GIẢI PHÁP - Cài Node.js

### **BƯỚC 1: Tải Node.js**

#### **Trên Windows**
1. Truy cập: https://nodejs.org/
2. Click **"Download"** → Chọn **LTS** (18.x hoặc 20.x)
3. Tải file `.msi` (installer)
4. Chạy installer
5. Làm theo wizard cài đặt
6. **Tick "Add to PATH"** ✅ (QUAN TRỌNG!)
7. Finish & Restart máy

#### **Trên macOS**
```bash
# Cách 1: Dùng Homebrew (RECOMMENDED)
brew install node

# Cách 2: Download từ https://nodejs.org/
# Tải .pkg file và chạy installer
```

#### **Trên Linux (Ubuntu/Debian)**
```bash
# Update package list
sudo apt update

# Cài Node.js & npm
sudo apt install nodejs npm

# Hoặc từ NodeSource repo (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## ✓ BƯỚC 2: Verify Installation

Mở terminal mới (QUAN TRỌNG - restart terminal sau khi cài):

```bash
# Check Node version
node --version
# Kết quả: v18.x.x hoặc v20.x.x

# Check npm version
npm --version
# Kết quả: 9.x.x hoặc 10.x.x
```

✅ **Nếu thấy số version → Cài đặt thành công!**

❌ **Nếu vẫn báo "command not found" → Xem phần Troubleshooting dưới**

---

## 🔧 Troubleshooting

### ❌ "Vẫn command not found sau khi cài"

#### **Windows**
1. Restart PowerShell/CMD (QUAN TRỌNG!)
2. Nếu vẫn lỗi, check PATH:
   ```cmd
   echo %PATH%
   ```
   - Tìm path Node.js (vd: `C:\Program Files\nodejs`)
   - Nếu không có → Thêm thủ công

**Cách thêm PATH trên Windows:**
- Mở **Control Panel** → **System** → **Advanced system settings**
- Click **Environment Variables**
- Under "System variables" → click **Edit** (PATH)
- Click **New** → Thêm: `C:\Program Files\nodejs`
- Click **OK** x3
- **Restart PowerShell/CMD**

#### **macOS/Linux**
```bash
# Check Node path
which node
which npm

# Nếu không có output → Node chưa cài
# Cài lại:
brew install node  (macOS)
sudo apt install nodejs npm  (Linux)

# Nếu còn lỗi, add to PATH:
export PATH="/usr/local/bin:$PATH"
```

### ❌ "npm install lỗi"
```bash
# Clear npm cache
npm cache clean --force

# Cài lại dependencies
npm install
```

### ❌ "Port 3000 đã sử dụng"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

---

## ✅ SAU KHI CÀI XONG

### **Test Node.js**
```bash
# Kiểm tra version
node --version
npm --version

# Test npm hoạt động
npm list -g
```

### **Chạy Frontend**
```bash
cd frontend/public-portal

# Cài dependencies lần đầu
npm install

# Chạy dev server
npm start
# → Sẽ mở http://localhost:3000
```

---

## 📋 Checklist

- [ ] Tải Node.js từ https://nodejs.org/ (LTS)
- [ ] Chạy installer
- [ ] **Tick "Add to PATH"** khi cài
- [ ] **Restart máy hoặc terminal**
- [ ] Verify: `node --version` (phải thấy version)
- [ ] Verify: `npm --version` (phải thấy version)
- [ ] Chạy `npm install` trong folder `frontend/public-portal`
- [ ] Chạy `npm start` để test

---

## 💡 Ghi chú quan trọng

- ⚠️ **Phải restart terminal sau khi cài Node.js**
- ⚠️ **Trên Windows, phải tick "Add to PATH" khi cài installer**
- ⚠️ **Cài phiên bản LTS (18.x hoặc 20.x), không phải version mới nhất**

---

**Status**: 🚀 Ready to install Node.js
