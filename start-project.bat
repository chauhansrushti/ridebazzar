@echo off
echo.
echo ===============================================
echo    🚗 RideBazzar - Full Stack Application
echo ===============================================
echo.

echo 📋 Checking prerequisites...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    pause
    exit /b 1
)
echo ✅ Node.js is installed

:: Check if MySQL is running
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL is not installed or not in PATH
    pause
    exit /b 1
)
echo ✅ MySQL is available

echo.
echo 🚀 Starting RideBazzar Backend...
echo.

:: Navigate to backend directory
cd /d "%~dp0backend"

:: Check if dependencies are installed
if not exist node_modules (
    echo 📦 Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Start the backend server
echo.
echo 🔄 Starting backend server on port 5000...
echo 📡 API will be available at: http://localhost:5000
echo 🏥 Health check: http://localhost:5000/api/health
echo.
echo 🎯 To access your application:
echo    Frontend: file:///%~dp0home.html
echo    Dashboard: file:///%~dp0dashboard.html
echo    Integration Test: file:///%~dp0integration-test.html
echo.
echo 👤 Admin Login Credentials:
echo    Username: admin
echo    Password: admin123
echo.
echo 📝 Press Ctrl+C to stop the server
echo ===============================================
echo.

npm run dev

pause
