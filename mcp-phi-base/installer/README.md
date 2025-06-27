# φ-Discovery System Installer

One-click installation for the φ-Discovery Mathematical Discovery System.

## Quick Install

### Windows
```powershell
powershell -ExecutionPolicy Bypass -File install.ps1
```

### Linux/Mac
```bash
./install.sh
```

## What Gets Installed

1. **Node.js Dependencies**: All required npm packages
2. **Docker Images**: Discovery, validation, and transform workers
3. **Environment Configuration**: Secure defaults for all services
4. **Desktop Shortcuts**: Easy launch/stop scripts
5. **Web Interface**: Beautiful UI at http://localhost:3000

## Prerequisites

The installer will check for:
- Node.js (v14 or higher)
- npm
- Docker
- Docker Compose (or Docker Desktop)

## Installation Process

1. **Dependency Check**: Verifies all prerequisites
2. **Package Installation**: Installs Node.js dependencies
3. **Docker Build**: Builds all worker images
4. **Configuration**: Creates secure environment settings
5. **Shortcuts**: Creates launch scripts

## After Installation

### Starting the System
- **Windows**: Double-click `start-phi-discovery.bat` or desktop shortcut
- **Linux/Mac**: Run `./start-phi-discovery.sh`

### Accessing the Interface
- Open http://localhost:3000 in your browser
- Enter your Claude API key (get one at https://console.anthropic.com/)
- Use password: `phi`

### Stopping the System
- **Windows**: Double-click `stop-phi-discovery.bat`
- **Linux/Mac**: Run `./stop-phi-discovery.sh`

## Troubleshooting

### "Docker not found"
- Install Docker Desktop from https://docs.docker.com/get-docker/
- Ensure Docker is running

### "npm not found"
- Install Node.js from https://nodejs.org/
- This includes npm

### Port 3000 in use
- Edit `.env` file and change `WEB_PORT` to another port
- Access the interface at the new port

### Build failures
- Ensure Docker daemon is running
- Check disk space (need ~2GB free)
- Try running installer with admin/sudo privileges

## Manual Installation

If the installer fails, you can install manually:

1. Install dependencies:
   ```bash
   npm install
   cd web-interface && npm install && cd ..
   ```

2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Build Docker images:
   ```bash
   docker-compose -f docker-compose.betti.yml build
   ```

4. Start the system:
   ```bash
   docker stack deploy -c docker-compose.betti.yml phi_discovery
   cd web-interface && npm start
   ```

## Security Notes

- Default passwords are secure but should be changed for production
- API keys are never stored in code or logs
- All services run in isolated Docker containers
- Network traffic between services is encrypted

## Support

For issues or questions:
- Check the main README.md
- Review VALIDATION_REPORT.md for system details
- Open an issue on GitHub