# This script simulates the GitHub Actions CI checks for local development.
# PowerShell version with better error handling and colored output.

# Set error action preference
$ErrorActionPreference = "Stop"

# Start timing
$StartTime = Get-Date

Write-Host "========================================" -ForegroundColor Blue
Write-Host "     Local CI Check Starting...        " -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

try {
    # Check if Node.js is installed
    $null = Get-Command node -ErrorAction Stop
    $null = Get-Command npm -ErrorAction Stop
}
catch {
    Write-Host "ERROR: Node.js or npm is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

try {
    # --- Install Dependencies ---
    Write-Host "[1/4] Installing dependencies..." -ForegroundColor Yellow
    npm ci
    if ($LASTEXITCODE -ne 0) { throw "Failed to install dependencies" }
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
    Write-Host ""

    # --- Lint Code ---
    Write-Host "[2/4] Linting code..." -ForegroundColor Yellow
    npm run lint
    if ($LASTEXITCODE -ne 0) { throw "Linting failed" }
    Write-Host "✓ Code linting passed" -ForegroundColor Green
    Write-Host ""

    # --- Build Project ---
    Write-Host "[3/4] Building project..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
    Write-Host "✓ Project built successfully" -ForegroundColor Green
    Write-Host ""

    # --- Run Tests ---
    Write-Host "[4/4] Running tests..." -ForegroundColor Yellow
    npm test
    if ($LASTEXITCODE -ne 0) { throw "Tests failed" }
    Write-Host "✓ All tests passed" -ForegroundColor Green
    Write-Host ""

    # Success message
    $EndTime = Get-Date
    $Duration = $EndTime - $StartTime
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "     CI Check Completed Successfully!   " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Duration: $($Duration.ToString('mm\:ss'))" -ForegroundColor Blue
    Write-Host ""
    Write-Host "All checks passed! Your code is ready for CI." -ForegroundColor Green
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Read-Host "Press Enter to exit"
}