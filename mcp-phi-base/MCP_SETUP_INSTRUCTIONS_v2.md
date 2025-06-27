# φ-Discovery MCP Setup Instructions v2.0

This guide provides comprehensive instructions for integrating φ-Discovery with Claude through the Model Context Protocol (MCP), including all new features and interfaces.

## 🚀 Quick Start

### One-Line Installation
```bash
# Linux/Mac
curl -sSL https://raw.githubusercontent.com/[your-repo]/mcp-phi-base/main/installer/install.sh | bash

# Windows PowerShell (as Administrator)
iwr -useb https://raw.githubusercontent.com/[your-repo]/mcp-phi-base/main/installer/install.ps1 | iex
```

### Manual Quick Start
```bash
# 1. Start the Discovery System
./start-phi-discovery.sh

# 2. Launch Claude with MCP
wsl -- claude --mcp phi-discovery

# 3. Open Web Interface
# Navigate to http://localhost:3000
```

## 📋 Prerequisites

### System Requirements
- **OS**: Windows 10+ (with WSL2), macOS 10.14+, or Linux
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 10GB free space
- **CPU**: 4+ cores recommended

### Software Dependencies
- **Docker**: 20.10+ with Docker Compose
- **Node.js**: 16.x or 18.x LTS
- **Python**: 3.9+ (for workers)
- **Claude CLI**: Latest version installed
- **Git**: For cloning repository

### Optional Tools
- **WSL2**: Required for Windows users
- **Make**: For using Makefile commands
- **jq**: For JSON processing in scripts

## 🛠️ Detailed Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/[your-repo]/mcp-phi-base.git
cd mcp-phi-base
```

### Step 2: Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit configuration (optional)
nano .env  # or use your preferred editor
```

### Step 3: Install Dependencies

#### Main Project
```bash
npm install
```

#### Web Interface
```bash
cd web-interface
npm install
cd ..
```

#### MCP Server
```bash
cd mcp-server
npm install
cd ..
```

### Step 4: Docker Setup
```bash
# Initialize Docker Swarm (if not already done)
docker swarm init

# Pull required images
docker-compose -f docker/docker-compose.infrastructure.yml pull

# Start infrastructure services
docker-compose -f docker/docker-compose.infrastructure.yml up -d

# Verify services are running
docker ps
```

### Step 5: Configure MCP

Create or edit `~/.claude/mcp.json`:

```json
{
  "servers": {
    "phi-discovery": {
      "command": "node",
      "args": ["path/to/mcp-phi-base/mcp-server/phi-discovery-mcp.js"],
      "env": {
        "PHI_DISCOVERY_URL": "http://localhost:3000",
        "REDIS_URL": "redis://localhost:6379",
        "POSTGRES_URL": "postgresql://phi_user:phi_password@localhost:5432/phi_discovery",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**Important**: Replace `path/to/mcp-phi-base` with your actual absolute path.

## 🎯 Usage Guide

### Available Interfaces

#### 1. Main φ-Discovery Interface
- **URL**: http://localhost:3000
- **Features**: Equation validation, real-time discovery feed, MCP integration
- **Use Case**: General mathematical discovery and validation

#### 2. Physics Validator
- **URL**: http://localhost:3000/physics-validator.html
- **Features**: Domain-specific physics equation analysis
- **Use Case**: Validate physics equations with specialized analysis

#### 3. Equation Mind Map
- **URL**: http://localhost:3000/equation-mindmap-enhanced.html
- **Features**: Interactive D3.js visualization of equation relationships
- **Use Case**: Explore mathematical connections and patterns

#### 4. Integrated Physics Learning Platform
- **URL**: http://localhost:3000/integrated-physics-learning.html
- **Features**: Complete learning environment with all tools integrated
- **Use Case**: Educational exploration and research

### MCP Tools Reference

#### validate_equation
Validates mathematical equations using Betti topology and φ-coherence.

```
Example: "Use the validate_equation tool with equation 'E = mc²'"

Response includes:
- Betti numbers (B₀, B₁, B₂)
- Euler characteristic (χ)
- φ-coherence score
- Validation confidence
```

#### calculate_betti
Computes topological Betti numbers for mathematical expressions.

```
Example: "Calculate Betti numbers for the wave equation ∇²ψ - (1/c²)∂²ψ/∂t² = 0"

Response includes:
- B₀: Connected components
- B₁: Loops/cycles
- B₂: Voids/cavities
- Topological interpretation
```

#### check_phi_coherence
Analyzes golden ratio patterns and Fibonacci relationships.

```
Example: "Check φ-coherence for the sequence F(n+1)/F(n)"

Response includes:
- φ-coherence score (0-1)
- Fibonacci alignment
- Golden ratio proximity
- Pattern stability
```

#### discover_patterns
Finds mathematical relationships across equation sets.

```
Example: "Discover patterns in ['E=mc²', 'F=ma', 'p=mv', 'KE=½mv²']"

Response includes:
- Common patterns
- Variable relationships
- Dimensional analysis
- Suggested connections
```

#### analyze_physics
Performs domain-specific physics equation analysis.

```
Example: "Analyze the physics of Schrödinger's equation iℏ∂ψ/∂t = Ĥψ"

Response includes:
- Physics domain classification
- Unit consistency
- Conservation laws
- Physical interpretation
```

#### generate_mindmap
Creates visual mind map data for equation relationships.

```
Example: "Generate a mind map for thermodynamics equations"

Response includes:
- Node hierarchy
- Connection strengths
- Equation clusters
- Visualization data
```

## 🔧 Advanced Configuration

### Environment Variables

```bash
# Core Settings
PHI_PRECISION=50              # Decimal precision for φ calculations
VALIDATION_THRESHOLD=0.618    # Minimum validation confidence
DISCOVERY_RATE=fibonacci      # Discovery timing pattern

# Service URLs
REDIS_URL=redis://localhost:6379
POSTGRES_URL=postgresql://phi_user:phi_password@localhost:5432/phi_discovery
RABBITMQ_URL=amqp://localhost:5672

# Web Interface
WEB_PORT=3000
WS_PORT=3001                  # WebSocket port

# MCP Settings
MCP_PORT=8080
MCP_LOG_LEVEL=info
MCP_TIMEOUT=30000             # Request timeout in ms

# Feature Flags
ENABLE_PHYSICS_VALIDATOR=true
ENABLE_MINDMAP=true
ENABLE_3D_VISUALIZATION=true
ENABLE_HEALTH_MONITORING=true
```

### Docker Compose Overrides

Create `docker-compose.override.yml` for local customizations:

```yaml
version: '3.8'

services:
  postgres:
    ports:
      - "5432:5432"  # Expose PostgreSQL
    
  redis:
    ports:
      - "6379:6379"  # Expose Redis
    
  rabbitmq:
    ports:
      - "15672:15672"  # Management UI
```

### Performance Tuning

```bash
# Increase worker replicas
docker service scale phi_discovery_pattern_recognizer=3
docker service scale phi_discovery_numerical_validator=3

# Adjust memory limits in docker-compose.betti.yml
deploy:
  resources:
    limits:
      memory: 1G  # Increase as needed
```

## 🐛 Troubleshooting

### Common Issues

#### "MCP server not found"
```bash
# Check MCP configuration
cat ~/.claude/mcp.json

# Verify path is absolute
pwd  # Copy this path and use in mcp.json

# Test MCP server directly
node mcp-server/phi-discovery-mcp.js
```

#### "Connection refused on port 3000"
```bash
# Check if web server is running
ps aux | grep "node.*server.js"

# Start manually if needed
cd web-interface && npm start

# Check port availability
lsof -i :3000
```

#### "Docker services not starting"
```bash
# Check Docker daemon
docker info

# View service logs
docker service logs phi_discovery_discovery_orchestrator

# Restart stack
docker stack rm phi_discovery
docker stack deploy -c docker/docker-compose.betti.yml phi_discovery
```

#### "WebSocket connection failed"
```bash
# Check WebSocket server
netstat -an | grep 3001

# Test WebSocket directly
wscat -c ws://localhost:3001

# Check firewall rules
sudo ufw status  # Linux
```

### Health Monitoring

```bash
# Check system health
npm run health

# Monitor continuously
npm run health:monitor

# View detailed metrics
curl http://localhost:3000/health
```

### Log Analysis

```bash
# View all logs
docker-compose logs -f

# Filter by service
docker service logs phi_discovery_pattern_recognizer

# Check MCP logs
tail -f ~/.claude/logs/mcp-phi-discovery.log
```

## 🧪 Testing

### Run Test Suite
```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Quick smoke test
npm run test:quick
```

### Manual Testing
```bash
# Test equation validation
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"equation": "φ² = φ + 1"}'

# Test WebSocket
wscat -c ws://localhost:3001
> {"type": "ping"}
```

## 🚀 Production Deployment

### Security Hardening
```bash
# Use secrets for sensitive data
echo "phi_password" | docker secret create postgres_password -

# Update docker-compose with secrets
secrets:
  postgres_password:
    external: true
```

### SSL/TLS Setup
```nginx
# nginx.conf for HTTPS
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

### Monitoring Stack
```yaml
# Add to docker-compose.infrastructure.yml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
    
grafana:
  image: grafana/grafana
  ports:
    - "3333:3000"
```

## 📚 Examples and Workflows

### Research Workflow
```
1. Open integrated learning platform
2. Input research equations
3. Use Claude to analyze patterns:
   "Analyze the topological relationships between these quantum field theory equations"
4. Generate mind map visualization
5. Export results for publication
```

### Educational Workflow
```
1. Start with physics validator
2. Input student equations
3. Get detailed feedback
4. Explore corrections in mind map
5. Use Claude for explanations
```

### Discovery Workflow
```
1. Connect Claude with MCP
2. Feed equation corpus:
   "Discover patterns in this set of differential equations from my paper"
3. Monitor real-time discovery feed
4. Validate promising discoveries
5. Iterate with refinements
```

## 🔐 API Reference

### REST Endpoints
```
POST   /api/validate          - Validate equation
POST   /api/calculate-betti   - Calculate Betti numbers
POST   /api/discover-patterns - Pattern discovery
GET    /api/discoveries       - Recent discoveries
GET    /api/mindmap/:id       - Get mind map data
GET    /health               - System health
```

### WebSocket Events
```javascript
// Client → Server
{
  type: 'validate',
  data: { equation: 'E = mc²' }
}

// Server → Client
{
  type: 'validation_result',
  data: {
    betti: [1, 0, 0],
    chi: 1,
    confidence: 0.95
  }
}
```

## 🤝 Support and Community

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for Q&A
- **Updates**: Watch repository for releases

## 🎓 Learning Resources

1. **Mathematical Foundations**: `docs/mathematics.md`
2. **Topology Primer**: `docs/topology.md`
3. **φ-Coherence Theory**: `docs/phi-coherence.md`
4. **MCP Integration Guide**: `docs/mcp-guide.md`

---

*"Through MCP, Claude and φ-Discovery unite to explore the mathematical universe together."*