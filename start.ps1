# Start WisperFlow locally (no Docker)
# Requires: Python 3.10+, Node 18+, ffmpeg on PATH

Write-Host "`n=== WisperFlow — Hindi & English STT ===" -ForegroundColor Cyan

# Backend
Write-Host "`n[1/2] Starting FastAPI backend on http://localhost:8000 ..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PSScriptRoot\backend"
    if (-not (Test-Path ".venv")) {
        python -m venv .venv
        .\.venv\Scripts\pip install -r requirements.txt
    }
    .\.venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
}

Start-Sleep -Seconds 3

# Frontend
Write-Host "[2/2] Starting React frontend on http://localhost:5173 ..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PSScriptRoot\frontend"
    if (-not (Test-Path "node_modules")) { npm install }
    npm run dev
}

Write-Host "`nBoth services started. Press Ctrl+C to stop." -ForegroundColor Green
Write-Host "  Frontend : http://localhost:5173"
Write-Host "  API docs : http://localhost:8000/docs`n"

try {
    Wait-Job $backendJob, $frontendJob
} finally {
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
}
