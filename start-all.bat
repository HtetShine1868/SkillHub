@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo 🚀 Starting SkillHub Platform (Backend + Frontend)
echo ===================================================
echo.

REM Load .env file and set each variable as an environment variable
set "ENV_FILE=%~dp0.env"
if exist "%ENV_FILE%" (
    for /f "usebackq tokens=* delims=" %%A in ("%ENV_FILE%") do (
        set "line=%%A"
        rem skip empty lines and comments
        if not "!line!"=="" (
            echo !line! | findstr /b "#" >nul && goto :skip
        )
        for /f "tokens=1* delims==" %%B in ("!line!") do (
            set "key=%%B"
            set "value=%%C"
            if defined key set "!key!=!value!"
        )
        :skip
    )
) else (
    echo [WARN] .env not found at %ENV_FILE%
)

REM ── Load .env from project root and build JVM -D args ──
set "ENV_FILE=%~dp0.env"
set "JVM_ARGS="

for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
    REM Skip comment lines and blank lines
    set "LINE=%%A"
    if not "%%A"=="" (
        echo %%A | findstr /r "^#" >nul 2>&1
        if errorlevel 1 (
            set "JVM_ARGS=%JVM_ARGS% -D%%A=%%B"
        )
    )
)

echo [1/2] Starting Spring Boot Backend (Port 8080)...
start "SkillHub Backend" cmd /k "cd /d %~dp0backend && mvnw.cmd spring-boot:run -Dspring-boot.run.jvmArguments=\"%JVM_ARGS%\""

echo.
echo [2/2] Starting React Frontend (Port 5173)...
start "SkillHub Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo ✅ SkillHub is running!
echo 🌐 Frontend: http://localhost:5173
echo ⚙️ Backend:  http://localhost:8080
echo ===================================================
