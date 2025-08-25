# PowerShell script to restart the Lighthouse service
Write-Host "Stopping Lighthouse service..." -ForegroundColor Yellow

# Kill any existing Node.js processes on port 3001
$processes = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue }
if ($processes) {
    $processes | Stop-Process -Force
    Write-Host "Killed existing processes on port 3001" -ForegroundColor Green
}

# Wait a moment
Start-Sleep -Seconds 2

# Start the Lighthouse service
Write-Host "Starting Lighthouse service..." -ForegroundColor Yellow
Set-Location "lighthouse-service"
Start-Process -FilePath "node" -ArgumentList "index.js" -WindowStyle Minimized

Write-Host "Lighthouse service should now be running on http://localhost:3001" -ForegroundColor Green
Write-Host "You can test it by visiting: http://localhost:3001/health" -ForegroundColor Cyan
