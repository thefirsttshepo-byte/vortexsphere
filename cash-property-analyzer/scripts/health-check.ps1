# Check application health
Write-Host "🧪 Health Check for Financial App" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# 1. Test calculations
Write-Host "1. Running calculation tests..." -ForegroundColor Yellow
npm run test -- --run calculations.test.ts

# 2. Test scoring
Write-Host "2. Running scoring tests..." -ForegroundColor Yellow
npm run test -- --run scoring.test.ts

# 3. Verify golden deals
Write-Host "3. Running golden deals tests..." -ForegroundColor Yellow
npm run test -- --run goldenDeals.test.ts

Write-Host "✅ Health check complete!" -ForegroundColor Green