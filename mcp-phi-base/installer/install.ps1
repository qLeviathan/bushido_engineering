# φ-Discovery System Installer for Windows
# PowerShell installation script

$ErrorActionPreference = "Stop"

# Colors
function Write-ColorOutput($ForegroundColor, $Text) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Text
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Yellow "╭────────────────────────────────────────╮"
Write-ColorOutput Yellow "│     φ-Discovery System Installer       │"
Write-ColorOutput Yellow "│   Mathematical Discovery with AI       │"
Write-ColorOutput Yellow "╰────────────────────────────────────────╯"
Write-Output ""

# Check prerequisites
function Test-Command($cmdname) {
    try {
        Get-Command -Name $cmdname -ErrorAction Stop | Out-Null
        Write-ColorOutput Green "[OK] $cmdname is installed"
        return $true
    }
    catch {
        Write-ColorOutput Red "[X] $cmdname is not installed"
        return $false
    }
}

Write-Output "Checking prerequisites..."
Write-Output "------------------------"

$missingDeps = $false

# Check required commands
$commands = @("node", "npm", "docker")
foreach ($cmd in $commands) {
    if (-not (Test-Command $cmd)) {
        $missingDeps = $true
    }
}

if ($missingDeps) {
    Write-ColorOutput Red "`nMissing dependencies detected!"
    Write-Output "Please install the missing dependencies and run this installer again."
    Write-Output ""
    Write-Output "Installation guides:"
    Write-Output "- Node.js: https://nodejs.org/"
    Write-Output "- Docker Desktop: https://docs.docker.com/desktop/windows/install/"
    exit 1
}

Write-ColorOutput Green "`nAll prerequisites satisfied!"

# Install Node.js dependencies
Write-Output "`nInstalling Node.js dependencies..."
Write-Output "--------------------------------"
npm install --silent

# Install web interface dependencies
Write-ColorOutput Green "`nInstalling web interface..."
Set-Location web-interface
npm install --silent
Set-Location ..

# Create environment file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-ColorOutput Yellow "`nCreating environment configuration..."
    @"
# φ-Discovery Environment Configuration

# RabbitMQ Configuration
RABBITMQ_USER=phi_user
RABBITMQ_PASSWORD=phi_discovery_2024
RABBITMQ_VHOST=phi_discovery

# Redis Configuration  
REDIS_PASSWORD=phi_redis_2024

# PostgreSQL Configuration
POSTGRES_USER=phi_user
POSTGRES_PASSWORD=phi_postgres_2024
POSTGRES_DB=phi_discovery

# Web Interface
WEB_PORT=3000

# Discovery Settings
PHI_PRECISION=50
VALIDATION_THRESHOLD=0.618
DISCOVERY_RATE=fibonacci
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-ColorOutput Green "[OK] Environment file created"
}

# Build Docker images
Write-ColorOutput Yellow "`nBuilding Docker images..."
Write-Output "This may take a few minutes on first run..."

# Build worker images
$workers = @("discovery", "validation", "transform")
foreach ($worker in $workers) {
    Write-Output "`nBuilding $worker worker..."
    docker build -t "phi-${worker}:latest" -f "workers/$worker/Dockerfile" "workers/$worker/"
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "Failed to build $worker worker"
        exit 1
    }
}

Write-ColorOutput Green "`n[OK] All Docker images built successfully"

# Create start script
Write-ColorOutput Yellow "`nCreating launcher scripts..."

@"
@echo off
REM Start φ-Discovery System

cd /d "%~dp0"

REM Check if already running
docker stack ls | findstr phi_discovery >nul
if %errorlevel% == 0 (
    echo φ-Discovery is already running!
    echo Opening web interface...
    timeout /t 2 >nul
    start http://localhost:3000
    exit /b 0
)

REM Start the system
echo Starting φ-Discovery System...
docker stack deploy -c docker-compose.betti.yml phi_discovery

REM Wait for services to start
echo Waiting for services to initialize...
timeout /t 10 >nul

REM Start web interface
cd web-interface
start /b npm start

REM Wait a bit for server to start
timeout /t 3 >nul

REM Open browser
echo Opening web interface...
start http://localhost:3000

REM Keep window open
pause
"@ | Out-File -FilePath "start-phi-discovery.bat" -Encoding ASCII

# Create stop script
@"
@echo off
REM Stop φ-Discovery System

echo Stopping φ-Discovery System...

REM Stop Docker stack
docker stack rm phi_discovery 2>nul

REM Stop web server
taskkill /F /IM node.exe 2>nul

echo φ-Discovery stopped.
pause
"@ | Out-File -FilePath "stop-phi-discovery.bat" -Encoding ASCII

# Create desktop shortcut
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$Home\Desktop\φ-Discovery.lnk")
$Shortcut.TargetPath = "$PWD\start-phi-discovery.bat"
$Shortcut.WorkingDirectory = $PWD
$Shortcut.IconLocation = "$PWD\assets\phi-icon.ico"
$Shortcut.Description = "Launch φ-Discovery Mathematical Discovery System"
$Shortcut.Save()

# Installation complete
Write-ColorOutput Green "`n═══════════════════════════════════════════"
Write-ColorOutput Green "     Installation Complete! 🎉              "
Write-ColorOutput Green "═══════════════════════════════════════════"
Write-Output ""
Write-Output "To start φ-Discovery:"
Write-ColorOutput Yellow "  Double-click start-phi-discovery.bat"
Write-ColorOutput Yellow "  Or use the desktop shortcut"
Write-Output ""
Write-Output "To stop φ-Discovery:"
Write-ColorOutput Yellow "  Double-click stop-phi-discovery.bat"
Write-Output ""
Write-Output "The web interface will open automatically at:"
Write-ColorOutput Green "  http://localhost:3000"
Write-Output ""
Write-Output "Get your Claude API key at:"
Write-ColorOutput Green "  https://console.anthropic.com/"
Write-Output ""
Write-ColorOutput Yellow "Happy discovering! ✨"
Write-Output ""
Write-Output "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")