# Install Python dependencies for backend

Write-Host "Installing Python dependencies for backend..." -ForegroundColor Cyan

# Create virtual environment if it doesn't exist
$venvPath = "backend\venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv backend\venv
}

$reqPath = "backend\requirements.txt"
$pipExe = "$venvPath\Scripts\pip.exe"

Write-Host "Installing packages from $reqPath..." -ForegroundColor Yellow
& $pipExe install -r $reqPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Dependency installation failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}
