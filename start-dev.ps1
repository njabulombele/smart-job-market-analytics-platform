# ─────────────────────────────────────────────────────────────────────────────
# start-dev.ps1  —  Smart Job Market Analytics Platform dev launcher
# Usage:
#   .\start-dev.ps1                  # start infra, print instructions
#   .\start-dev.ps1 -WithMonitoring  # also start Prometheus + Grafana
#   .\start-dev.ps1 -Stop            # stop infra containers
# ─────────────────────────────────────────────────────────────────────────────
param(
  [switch]$WithMonitoring,
  [switch]$Stop
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# ── Stop mode ──────────────────────────────────────────────────────────────
if ($Stop) {
  Write-Host "`nStopping infrastructure containers..." -ForegroundColor Yellow
  docker compose stop postgres redis kafka prometheus grafana 2>$null
  Write-Host "Done. Stop backend / frontend / ml-service manually (Ctrl+C in their terminals).`n" -ForegroundColor Green
  exit 0
}

# ── Banner ─────────────────────────────────────────────────────────────────
Write-Host @"

  ┌──────────────────────────────────────────────────────┐
  │   Smart Job Market Analytics Platform  — Dev Launcher │
  └──────────────────────────────────────────────────────┘
"@ -ForegroundColor Cyan

# ── Check Docker ───────────────────────────────────────────────────────────
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host "ERROR: Docker not found. Install Docker Desktop first." -ForegroundColor Red; exit 1
}

# ── Start infrastructure ───────────────────────────────────────────────────
Write-Host "`n[1/3] Starting infrastructure (Postgres, Redis, Kafka)..." -ForegroundColor Cyan
docker compose up -d postgres redis kafka 2>&1 | Out-Null
Write-Host "      Containers started." -ForegroundColor Green

if ($WithMonitoring) {
  Write-Host "[+]   Starting monitoring (Prometheus, Grafana)..." -ForegroundColor Cyan
  docker compose up -d prometheus grafana 2>&1 | Out-Null
  Write-Host "      Grafana:    http://localhost:3003  (admin / admin)" -ForegroundColor DarkGray
  Write-Host "      Prometheus: http://localhost:9090" -ForegroundColor DarkGray
}

# ── Wait for Postgres ──────────────────────────────────────────────────────
Write-Host "`n[2/3] Waiting for PostgreSQL to be ready..." -ForegroundColor Cyan
$retries = 0
do {
  Start-Sleep -Seconds 3
  $health = docker inspect --format="{{.State.Health.Status}}" jobmarket-postgres 2>$null
  $retries++
  Write-Host "      attempt $retries — status: $health" -ForegroundColor DarkGray
} while ($health -ne "healthy" -and $retries -lt 15)

if ($health -eq "healthy") {
  Write-Host "      PostgreSQL is healthy ✅" -ForegroundColor Green
} else {
  Write-Host "      WARNING: Postgres may not be fully ready yet." -ForegroundColor Yellow
}

# ── Print instructions ─────────────────────────────────────────────────────
Write-Host "`n[3/3] Infrastructure is up. Open 3 new terminals and run:" -ForegroundColor Cyan

Write-Host @"

  ┌─ Terminal 1 — Backend (Spring Boot) ──────────────────────
  │  cd backend
  │  mvn spring-boot:run
  │  → http://localhost:8080
  │  → http://localhost:8080/swagger-ui.html

  ┌─ Terminal 2 — Frontend (Next.js) ─────────────────────────
  │  cd frontend
  │  npm run dev
  │  → http://localhost:3000

  ┌─ Terminal 3 — ML Service (FastAPI) ───────────────────────
  │  cd ml-service
  │  python -m uvicorn main:app --reload --port 8000
  │  → http://localhost:8000/docs

"@ -ForegroundColor White

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor DarkCyan
Write-Host "  🌐  Frontend    →  http://localhost:3000" -ForegroundColor Green
Write-Host "  🔧  Backend API →  http://localhost:8080/api/v1" -ForegroundColor Green
Write-Host "  📄  Swagger UI  →  http://localhost:8080/swagger-ui.html" -ForegroundColor Green
Write-Host "  🤖  ML Docs     →  http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  🔑  Login       →  admin@jobmarket.com / Admin1234!" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor DarkCyan
