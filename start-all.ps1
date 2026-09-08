# =====================================================
# SkillHub Startup Script (PowerShell)
# Loads .env -> sets env vars -> starts backend + frontend
# =====================================================

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  SkillHub Platform Starting..." -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Load .env file from project root
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Write-Host "`n[ENV] Loading environment variables from .env..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line -split "=", 2
            if ($parts.Count -eq 2) {
                $key   = $parts[0].Trim()
                $value = $parts[1].Trim()
                [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
                Write-Host "  SET $key" -ForegroundColor DarkGray
            }
        }
    }
    Write-Host "[ENV] Done." -ForegroundColor Green
} else {
    Write-Host "[WARN] .env file not found at $envFile" -ForegroundColor Red
}

# Start Spring Boot backend in a new window (inherits env vars)
Write-Host "`n[1/2] Starting Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
$backendDir = Join-Path $PSScriptRoot "backend"
Start-Process "cmd.exe" -ArgumentList "/k cd /d `"$backendDir`" && mvnw.cmd spring-boot:run" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Vite frontend in a new window
Write-Host "[2/2] Starting React Frontend (Port 5173)..." -ForegroundColor Yellow
$frontendDir = Join-Path $PSScriptRoot "frontend"
Start-Process "cmd.exe" -ArgumentList "/k cd /d `"$frontendDir`" && npm run dev" -WindowStyle Normal

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "  SkillHub is starting up!" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor White
Write-Host "  Backend  : http://localhost:8080" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Green
