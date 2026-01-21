@echo off
REM Script to start all frontend portals at different ports

echo.
echo ========================================
echo  Starting All Frontend Portals
echo ========================================
echo.

REM Define ports for each portal
set PUBLIC_PORT=3001
set LECTURER_PORT=3002
set ACADEMIC_PORT=3003
set ADMIN_SYSTEM_PORT=3004
set ADMIN_PORT=3005

echo Starting portals on:
echo  - Public Portal: http://localhost:%PUBLIC_PORT%
echo  - Lecturer Portal (Syllabus Builder): http://localhost:%LECTURER_PORT%
echo  - Academic Portal: http://localhost:%ACADEMIC_PORT%
echo  - Admin System: http://localhost:%ADMIN_SYSTEM_PORT%
echo  - Admin Portal: http://localhost:%ADMIN_PORT%
echo.

REM Create separate terminal windows for each frontend
start "Public Portal (3001)" cmd /k "cd d:\h_Nam_3\hocki1nam2025_2026_nam3\XDPM_HuongDoiTuong\ProjectCK\smd-microservices\frontend\public-portal && set PORT=%PUBLIC_PORT% && npm start"

timeout /t 5 /nobreak

start "Lecturer Portal - Syllabus (3002)" cmd /k "cd d:\h_Nam_3\hocki1nam2025_2026_nam3\XDPM_HuongDoiTuong\ProjectCK\smd-microservices\frontend\lecturer-portal\syllabus-builder && set VITE_PORT=%LECTURER_PORT% && npm run dev"

timeout /t 5 /nobreak

start "Academic Portal (3003)" cmd /k "cd d:\h_Nam_3\hocki1nam2025_2026_nam3\XDPM_HuongDoiTuong\ProjectCK\smd-microservices\frontend\academic-portal && set PORT=%ACADEMIC_PORT% && npm start"

timeout /t 5 /nobreak

start "Admin System (3004)" cmd /k "cd d:\h_Nam_3\hocki1nam2025_2026_nam3\XDPM_HuongDoiTuong\ProjectCK\smd-microservices\frontend\admin-system && set PORT=%ADMIN_SYSTEM_PORT% && npm start"

timeout /t 5 /nobreak

start "Admin Portal (3005)" cmd /k "cd d:\h_Nam_3\hocki1nam2025_2026_nam3\XDPM_HuongDoiTuong\ProjectCK\smd-microservices\frontend\admin-portal && set PORT=%ADMIN_PORT% && npm start"

echo.
echo ========================================
echo  All portals are starting...
echo  Main Landing Page: http://localhost:%PUBLIC_PORT%
echo ========================================
echo.
pause
