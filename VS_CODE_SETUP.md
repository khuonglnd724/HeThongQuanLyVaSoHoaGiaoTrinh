# VS Code Setup Guide - Complete

## 🚀 Để Chạy Project Này, Bạn Cần Cài Đặt:

### **BƯỚC 1: Cài Đặt Essentials**

#### 1️⃣ **Java Development Kit (JDK)**
- **Download**: https://www.oracle.com/java/technologies/downloads/
- **Cần**: JDK 17+ (vì dự án dùng Java 17)
- **Verify**:
  ```bash
  java -version
  ```
- **Set PATH** (nếu cần):
  - Windows: Thêm vào Environment Variables

#### 2️⃣ **Node.js & npm**
- **Download**: https://nodejs.org/ (LTS version)
- **Verify**:
  ```bash
  node --version
  npm --version
  ```

#### 3️⃣ **Maven** (cho Java)
- **Download**: https://maven.apache.org/download.cgi
- **Verify**:
  ```bash
  mvn --version
  ```
- **Hoặc**: Project dùng `mvnw` (Maven Wrapper), không cần cài

#### 4️⃣ **Docker** (Optional nhưng recommended)
- **Download**: https://www.docker.com/products/docker-desktop
- **Verify**:
  ```bash
  docker --version
  docker-compose --version
  ```

---

### **BƯỚC 2: VS Code Extensions (TUYỆT ĐỐI CẦN)**

#### **For Java Backend Development**
1. **Extension Pack for Java** (`vscjava.vscode-java-pack`)
   - 📦 Includes: Language Support + Debugger + Test Runner
   - 🔍 Mã: `vscjava.vscode-java-pack`

2. **Spring Boot Extension Pack** (`vmware.vscode-spring-boot`)
   - ⚙️ Hỗ trợ Spring Boot, Maven, properties files
   - 🔍 Mã: `vmware.vscode-spring-boot`

3. **Maven for Java** (`vscjava.vscode-maven`)
   - 🔨 Build + Run Maven projects
   - 🔍 Mã: `vscjava.vscode-maven`

4. **Lombok Annotations Support** (`GabrielBB.vscode-lombok`)
   - 📝 Hỗ trợ @Data, @Builder annotations
   - 🔍 Mã: `GabrielBB.vscode-lombok`

#### **For React Frontend Development**
1. **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`)
   - 💻 Snippets + code completion
   - 🔍 Mã: `dsznajder.es7-react-js-snippets`

2. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
   - 🎨 Autocomplete Tailwind classes
   - 🔍 Mã: `bradlc.vscode-tailwindcss`

3. **Prettier - Code formatter** (`esbenp.prettier-vscode`)
   - 📋 Format code automatically
   - 🔍 Mã: `esbenp.prettier-vscode`

#### **General Tools (Recommended)**
1. **Git Graph** (`mhutchie.git-graph`)
2. **GitLens** (`eamodio.gitlens`)
3. **REST Client** (`humao.rest-client`)
4. **Docker** (`ms-azuretools.vscode-docker`)
5. **Thunder Client** (`rangav.vscode-thunder-client`) - API tester

---

### **BƯỚC 3: Cài Đặt Extensions (Cách Nhanh Nhất)**

#### **Cách 1: Từ Command Palette** (RECOMMENDED)
```bash
Ctrl + Shift + X  (hoặc Cmd + Shift + X trên Mac)
```
Sau đó search từng extension và install.

#### **Cách 2: Command Line**
```bash
code --install-extension vscjava.vscode-java-pack
code --install-extension vmware.vscode-spring-boot
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension GabrielBB.vscode-lombok
```

#### **Cách 3: Từ File** (EASIEST)
```bash
# Tạo file extensions.txt với nội dung:
vscjava.vscode-java-pack
vmware.vscode-spring-boot
vscjava.vscode-maven
dsznajder.es7-react-js-snippets
bradlc.vscode-tailwindcss
esbenp.prettier-vscode
GabrielBB.vscode-lombok
ms-azuretools.vscode-docker
humao.rest-client

# Rồi chạy:
cat extensions.txt | xargs -L 1 code --install-extension
```

---

### **BƯỚC 4: VS Code Settings**

#### **File: `.vscode/settings.json`**

Tạo trong project root:

```json
{
  // Java
  "java.home": "C:/Program Files/Java/jdk-17.0.0",  // Update path if needed
  "java.version": "17",
  "[java]": {
    "editor.defaultFormatter": "redhat.java",
    "editor.formatOnSave": true,
    "editor.tabSize": 4
  },
  
  // JavaScript/React
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[jsx]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  
  // General
  "editor.wordWrap": "on",
  "editor.fontSize": 13,
  "editor.fontFamily": "'Courier New', monospace",
  "editor.rulers": [80, 120],
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/target": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/target": true,
    "**/.git": true
  }
}
```

---

### **BƯỚC 5: Cấu Hình Java Compiler**

#### **Tệp: `.vscode/extensions/vscjava.vscode-java-pack/settings.json`**

Hoặc thêm vào `.vscode/settings.json`:

```json
{
  "java.project.referencedLibraries": {
    "include": ["lib/**/*.jar"],
    "exclude": ["lib/excluded/**"]
  },
  "java.configuration.runtimes": [
    {
      "name": "JavaSE-17",
      "path": "C:\\Program Files\\Java\\jdk-17.0.0"
    }
  ]
}
```

---

### **BƯỚC 6: Chạy Project**

#### **Backend (Java + Spring Boot)**

```bash
# Điều hướng đến backend
cd backend/public-service

# Build
mvn clean install

# Chạy
mvn spring-boot:run

# Hoặc từ VS Code:
# - Mở Command Palette (Ctrl+Shift+P)
# - Tìm "Java: Start Debugging" hoặc "Maven: Run"
```

#### **Frontend (React)**

```bash
# Điều hướng đến frontend
cd frontend/public-portal

# Cài đặt dependencies
npm install

# Chạy dev server
npm start

# Hoặc từ VS Code:
# - Mở Terminal (Ctrl+`)
# - npm start
```

---

### **BƯỚC 7: Verify Setup**

#### **Check Java**
```bash
java -version
javac -version
```

#### **Check Maven**
```bash
mvn --version
```

#### **Check Node**
```bash
node --version
npm --version
```

#### **Check Docker** (nếu cần)
```bash
docker --version
docker-compose --version
```

---

## ✅ **Quick Checklist**

- [ ] JDK 17+ cài đặt
- [ ] Node.js + npm cài đặt
- [ ] Maven cài đặt
- [ ] VS Code đã cài Extension Pack for Java
- [ ] VS Code đã cài Spring Boot Extension Pack
- [ ] VS Code đã cài ES7+ React snippets
- [ ] VS Code đã cài Tailwind CSS IntelliSense
- [ ] VS Code đã cài Prettier
- [ ] `.vscode/settings.json` đã cấu hình
- [ ] `mvn --version` chạy ok
- [ ] `npm --version` chạy ok

---

## 🚀 **Chạy Project Đầu Tiên**

### **Terminal 1: Backend**
```bash
cd backend/public-service
mvn spring-boot:run
# Sẽ chạy ở http://localhost:8083
```

### **Terminal 2: Frontend**
```bash
cd frontend/public-portal
npm start
# Sẽ chạy ở http://localhost:3000
```

### **Terminal 3: Docker** (Optional)
```bash
cd docker
docker-compose up -d
# Khởi động tất cả services
```

---

## 🆘 **Troubleshooting**

### ❌ "Maven command not found"
```bash
# Set PATH hoặc dùng Maven Wrapper
./mvnw clean install  (Linux/Mac)
mvnw.cmd clean install  (Windows)
```

### ❌ "Java not found"
```bash
# Check Java path
where java  (Windows)
which java  (Mac/Linux)

# Set JAVA_HOME
export JAVA_HOME=/path/to/jdk  (Mac/Linux)
```

### ❌ "npm modules issues"
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Port already in use"
```bash
# Kill process on port
# Windows
netstat -ano | findstr :8083
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8083
kill -9 <PID>
```

### ❌ "VS Code không recognize Java"
- Reload VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"
- Check Java Language Server: Bottom left corner "Language Status"

---

## 📚 **Resources**

- [VS Code for Java](https://code.visualstudio.com/docs/languages/java)
- [Spring Boot in VS Code](https://code.visualstudio.com/docs/java/spring-boot-tutorial)
- [React in VS Code](https://code.visualstudio.com/docs/nodejs/reactjs-tutorial)
- [Maven Official](https://maven.apache.org/)
- [Node.js Official](https://nodejs.org/)

---

**Date**: January 19, 2026  
**Status**: ✅ Complete Setup Guide
