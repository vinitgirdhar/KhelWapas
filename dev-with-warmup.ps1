# dev-with-warmup.ps1
# Start Next.js dev server and warm up routes automatically

Write-Host "🚀 Starting Next.js development server..." -ForegroundColor Cyan
Write-Host ""

# Start the dev server in background
$devProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -PassThru -WindowStyle Normal

Write-Host "⏳ Waiting 15 seconds for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "🔥 Warming up routes..." -ForegroundColor Green
npm run warmup

Write-Host ""
Write-Host "✨ Dev server is ready with warmed routes!" -ForegroundColor Green
Write-Host "   Server running at: http://localhost:9002" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to stop the dev server..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop the dev server
Stop-Process -Id $devProcess.Id -Force
Write-Host "👋 Dev server stopped." -ForegroundColor Yellow
