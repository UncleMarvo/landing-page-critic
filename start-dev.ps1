# start-dev.ps1
# Launch Chrome, Lighthouse service, and Next.js app in separate windows

# Step 1: Launch Chrome with remote debugging
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  -ArgumentList @(
    "--remote-debugging-port=9222",
    "--user-data-dir=C:\chrome-debug-profile",
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox"
  )


# Step 2: Launch Lighthouse service
Start-Process powershell -ArgumentList "-NoExit", "-Command cd lighthouse-service; node index.js"

# Step 3: Launch Next.js app
Start-Process powershell -ArgumentList "-NoExit", "-Command cd ..\landing-page-critic; npm run dev"



