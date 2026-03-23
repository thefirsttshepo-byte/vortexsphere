# deploy-check.ps1 - Fixed version that writes to output stream
[CmdletBinding()]
param(
    [string]$LogFile = $null
)

# Function to write to both console and log
function Write-Both {
    param(
        [string]$Message,
        [string]$Color = "White",
        [switch]$NoNewLine
    )
    
    # Write to console with color
    if ($NoNewLine) {
        Write-Host $Message -ForegroundColor $Color -NoNewline
    } else {
        Write-Host $Message -ForegroundColor $Color
    }
    
    # Write to file if specified (strip color codes)
    if ($LogFile) {
        $cleanMessage = $Message -replace '\x1b\[[0-9;]*m', ''  # Remove ANSI color codes
        if ($NoNewLine) {
            $cleanMessage | Out-File -FilePath $LogFile -Append -NoNewline -Encoding UTF8
        } else {
            $cleanMessage | Out-File -FilePath $LogFile -Append -Encoding UTF8
        }
    }
    
    # Also write to output stream for redirection
    Write-Output $Message
}

# Start the verification
Write-Both "" -Color Cyan
Write-Both "🚀 CASH-ONLY PROPERTY ANALYZER - DEPLOYMENT VERIFICATION" -Color Cyan
Write-Both "==========================================================" -Color Cyan
Write-Both ""

# Record start time
$startTime = Get-Date

# Track overall success
$allPassed = $true
$failedSteps = @()

Write-Both "📊 STEP 1: ENVIRONMENT CHECK" -Color Yellow
Write-Both "[1.1] Checking Node.js version..." -Color Gray
$nodeVersion = node --version
if ($nodeVersion -match "v(18|20|22)") {
    Write-Both "  ✅ Node.js $nodeVersion" -Color Green
} else {
    Write-Both "  ❌ Node.js $nodeVersion (need v18, v20, or v22)" -Color Red
    $allPassed = $false
    $failedSteps += "Node.js version"
}

Write-Both "[1.2] Checking npm version..." -Color Gray
$npmVersion = npm --version
Write-Both "  ✅ npm v$npmVersion" -Color Green

Write-Both ""
Write-Both "🔧 STEP 2: DEPENDENCIES & BUILD" -Color Yellow

Write-Both "[2.1] TypeScript type checking..." -Color Gray
try {
    $tscOutput = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Both "  ✅ TypeScript compilation passed" -Color Green
    } else {
        Write-Both "  ❌ TypeScript compilation failed" -Color Red
        Write-Both "    $tscOutput" -Color DarkGray
        $allPassed = $false
        $failedSteps += "TypeScript compilation"
    }
} catch {
    Write-Both "  ❌ TypeScript check failed: $_" -Color Red
    $allPassed = $false
    $failedSteps += "TypeScript compilation"
}

Write-Both "[2.2] Building application..." -Color Gray
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0 -and (Test-Path "dist")) {
        $buildSize = [math]::Round(((Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB), 2)
        Write-Both "  ✅ Build successful ($buildSize MB)" -Color Green
    } else {
        Write-Both "  ❌ Build failed" -Color Red
        Write-Both "    $buildOutput" -Color DarkGray
        $allPassed = $false
        $failedSteps += "Build"
    }
} catch {
    Write-Both "  ❌ Build failed: $_" -Color Red
    $allPassed = $false
    $failedSteps += "Build"
}

Write-Both ""
Write-Both "🧪 STEP 3: TEST SUITE" -Color Yellow

# Check if tests exist before running
Write-Both "[3.1] Checking test files..." -Color Gray
if (Test-Path "src/tests/golden/goldenDeals.test.ts") {
    Write-Both "  ✅ Test files found" -Color Green
} else {
    Write-Both "  ⚠️  Test files not found (skipping tests)" -Color Yellow
    $allPassed = $false
    $failedSteps += "Missing test files"
}

if ($allPassed) {
    Write-Both "[3.2] Running golden reference tests..." -Color Gray
    try {
        $goldenOutput = npm run test:golden 2>&1
        if ($LASTEXITCODE -eq 0) {
            # Extract test count
            if ($goldenOutput -match "Tests\s+(\d+) passed") {
                $testCount = $matches[1]
                Write-Both "  ✅ Golden tests passed ($testCount tests)" -Color Green
            } else {
                Write-Both "  ✅ Golden tests passed" -Color Green
            }
        } else {
            Write-Both "  ❌ Golden tests failed" -Color Red
            Write-Both "    Last 3 lines of output:" -Color DarkGray
            $goldenOutput -split "`n" | Select-Object -Last 3 | ForEach-Object {
                Write-Both "    $_" -Color DarkGray
            }
            $allPassed = $false
            $failedSteps += "Golden tests"
        }
    } catch {
        Write-Both "  ❌ Golden tests failed: $_" -Color Red
        $allPassed = $false
        $failedSteps += "Golden tests"
    }
}

Write-Both ""
Write-Both "📦 STEP 4: DEPLOYMENT ARTIFACTS" -Color Yellow

Write-Both "[4.1] Checking dist folder structure..." -Color Gray
if (Test-Path "dist") {
    $distFiles = Get-ChildItem "dist" -Recurse -File
    if ($distFiles.Count -gt 0) {
        Write-Both "  ✅ Dist folder has $($distFiles.Count) files" -Color Green
        
        # Check for essential files
        $essentialFiles = @("index.html", "assets/index-*.js", "*.css")
        $missing = @()
        foreach ($pattern in $essentialFiles) {
            if (-not (Get-ChildItem "dist" -Recurse -Include $pattern -ErrorAction SilentlyContinue)) {
                $missing += $pattern
            }
        }
        
        if ($missing.Count -eq 0) {
            Write-Both "  ✅ All essential files present" -Color Green
        } else {
            Write-Both "  ⚠️  Missing files: $($missing -join ', ')" -Color Yellow
        }
    } else {
        Write-Both "  ❌ Dist folder is empty" -Color Red
        $allPassed = $false
        $failedSteps += "Empty dist folder"
    }
} else {
    Write-Both "  ❌ Dist folder not found" -Color Red
    $allPassed = $false
    $failedSteps += "Dist folder missing"
}

# Calculate total time
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Both ""
Write-Both "📋 FINAL RESULTS" -Color Cyan
Write-Both "================" -Color Cyan

if ($allPassed) {
    Write-Both "🎉 DEPLOYMENT READY!" -Color Green
    Write-Both ""
    Write-Both "Next steps:" -Color White
    Write-Both "1. Copy the entire 'dist' folder to your private server" -Color White
    Write-Both "2. Ensure server serves index.html for all routes (SPA routing)" -Color White
    Write-Both "3. Test offline functionality on your server" -Color White
    Write-Both ""
    Write-Both "Your capital protection engine is ready for production use." -Color Green
} else {
    Write-Both "🚫 DEPLOYMENT BLOCKED" -Color Red
    Write-Both ""
    Write-Both "Failed steps:" -Color Red
    foreach ($step in $failedSteps) {
        Write-Both "  • $step" -Color Red
    }
    Write-Both ""
    Write-Both "Fix the issues above before deploying." -Color Yellow
}

Write-Both ""
Write-Both "⏱️  Total verification time: $($duration.TotalSeconds.ToString('F1')) seconds" -Color Gray

# Exit with appropriate code
if ($allPassed) {
    exit 0
} else {
    exit 1
}