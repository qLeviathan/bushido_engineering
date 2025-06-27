#!/bin/bash
# φ-Discovery System Installer
# One-click installation script

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║     φ-Discovery System Installer       ║${NC}"
echo -e "${YELLOW}║   Mathematical Discovery with AI       ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
echo

# Check prerequisites
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}✗ $1 is not installed${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $1 is installed${NC}"
        return 0
    fi
}

echo "Checking prerequisites..."
echo "------------------------"

MISSING_DEPS=0

# Check required commands
for cmd in node npm docker docker-compose; do
    check_command $cmd || MISSING_DEPS=1
done

if [ $MISSING_DEPS -eq 1 ]; then
    echo -e "\n${RED}Missing dependencies detected!${NC}"
    echo "Please install the missing dependencies and run this installer again."
    echo ""
    echo "Installation guides:"
    echo "- Node.js: https://nodejs.org/"
    echo "- Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "\n${GREEN}All prerequisites satisfied!${NC}\n"

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
echo "--------------------------------"
npm install --silent

# Install web interface dependencies
echo -e "\n${GREEN}Installing web interface...${NC}"
cd web-interface
npm install --silent
cd ..

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "\n${YELLOW}Creating environment configuration...${NC}"
    cat > .env << 'EOF'
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
EOF
    echo -e "${GREEN}✓ Environment file created${NC}"
fi

# Build Docker images
echo -e "\n${YELLOW}Building Docker images...${NC}"
echo "This may take a few minutes on first run..."

# Build worker images
for worker in discovery validation transform; do
    echo -e "\nBuilding $worker worker..."
    docker build -t phi-$worker:latest -f workers/$worker/Dockerfile workers/$worker/ || {
        echo -e "${RED}Failed to build $worker worker${NC}"
        exit 1
    }
done

echo -e "\n${GREEN}✓ All Docker images built successfully${NC}"

# Create desktop shortcuts
echo -e "\n${YELLOW}Creating desktop shortcuts...${NC}"

# Create start script
cat > start-phi-discovery.sh << 'EOF'
#!/bin/bash
# Start φ-Discovery System

cd "$(dirname "$0")"

# Check if already running
if docker stack ls | grep -q phi_discovery; then
    echo "φ-Discovery is already running!"
    echo "Opening web interface..."
    sleep 2
    xdg-open http://localhost:3000 2>/dev/null || open http://localhost:3000 2>/dev/null || start http://localhost:3000
    exit 0
fi

# Start the system
echo "Starting φ-Discovery System..."
docker stack deploy -c docker-compose.betti.yml phi_discovery

# Wait for services to start
echo "Waiting for services to initialize..."
sleep 10

# Start web interface
cd web-interface
npm start &
WEB_PID=$!

# Wait a bit for server to start
sleep 3

# Open browser
echo "Opening web interface..."
xdg-open http://localhost:3000 2>/dev/null || open http://localhost:3000 2>/dev/null || start http://localhost:3000

# Keep running
wait $WEB_PID
EOF

chmod +x start-phi-discovery.sh

# Create stop script
cat > stop-phi-discovery.sh << 'EOF'
#!/bin/bash
# Stop φ-Discovery System

echo "Stopping φ-Discovery System..."

# Stop Docker stack
docker stack rm phi_discovery 2>/dev/null

# Stop web server
pkill -f "node.*server.js" 2>/dev/null

echo "φ-Discovery stopped."
EOF

chmod +x stop-phi-discovery.sh

# Installation complete
echo -e "\n${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}     Installation Complete! 🎉              ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo "To start φ-Discovery:"
echo -e "  ${YELLOW}./start-phi-discovery.sh${NC}"
echo ""
echo "To stop φ-Discovery:"
echo -e "  ${YELLOW}./stop-phi-discovery.sh${NC}"
echo ""
echo "The web interface will open automatically at:"
echo -e "  ${GREEN}http://localhost:3000${NC}"
echo ""
echo "Get your Claude API key at:"
echo -e "  ${GREEN}https://console.anthropic.com/${NC}"
echo ""
echo -e "${YELLOW}Happy discovering! ✨${NC}"