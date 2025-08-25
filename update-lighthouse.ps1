# PowerShell script to update Lighthouse dependencies and restart service
Write-Host "Updating Lighthouse dependencies..." -ForegroundColor Yellow

# Navigate to lighthouse service directory
Set-Location "lighthouse-service"

# Update dependencies
Write-Host "Installing updated dependencies..." -ForegroundColor Cyan
npm install

# Kill any existing processes on port 3001
Write-Host "Stopping existing Lighthouse service..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue }
if ($processes) {
    $processes | Stop-Process -Force
    Write-Host "Killed existing processes on port 3001" -ForegroundColor Green
}

# Wait a moment
Start-Sleep -Seconds 3

# Start the updated Lighthouse service
Write-Host "Starting updated Lighthouse service..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "index.js" -WindowStyle Minimized

Write-Host "Lighthouse service updated and restarted!" -ForegroundColor Green
Write-Host "Service should now be running on http://localhost:3001" -ForegroundColor Cyan
Write-Host "Test health endpoint: http://localhost:3001/health" -ForegroundColor Cyan

# Return to project root
Set-Location ".."
