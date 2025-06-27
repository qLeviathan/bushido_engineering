# φ-Discovery: Mathematical Discovery with Claude MCP

A topological mathematical discovery system that integrates with Claude through the Model Context Protocol (MCP). Discover, validate, and explore mathematical relationships using Betti topology and φ-recursive patterns.

## Architecture

```
φ-Discovery System
│
├── 🌐 Web Interface (port 3000)
│   ├── Real-time equation validation
│   ├── Claude MCP integration
│   └── Discovery metrics dashboard
│
├── 🔗 MCP Server
│   ├── Mathematical validation tools
│   ├── Betti number calculation
│   ├── φ-coherence analysis
│   └── Pattern discovery
│
├── 🐳 Docker Swarm
│   ├── Discovery workers (9 nodes)
│   ├── Validation workers (21 edges) 
│   ├── Transform workers (13 voids)
│   └── Message queue (RabbitMQ)
│
└── 💾 Data Layer
    ├── Redis (shared state)
    ├── PostgreSQL (persistence)
    └── WebSocket (real-time)
```

## Core Features

### 🤖 Claude MCP Integration
- **No Login Required**: Direct integration with Claude through MCP
- **Mathematical Tools**: validate_equation, calculate_betti, check_phi_coherence, discover_patterns
- **Real-time Processing**: Equations processed through distributed workers
- **Intelligent Analysis**: Claude provides mathematical insights with topological validation

### 🧮 Mathematical Validation
- **Betti Topology**: Analyze equations using B₀, B₁, B₂ invariants
- **φ-Coherence**: Detect golden ratio patterns and Fibonacci relationships
- **Confidence Scoring**: Probabilistic validation with topological grounding
- **Pattern Discovery**: Find mathematical relationships across equation sets

### 🌐 Web Interface
- **Beautiful UI**: Dark theme with golden φ accents
- **Real-time Metrics**: Phase lock, validation rate, discovery feed
- **No Authentication**: Direct access to mathematical discovery
- **Mobile Friendly**: Responsive design for all devices

### 🐳 Distributed Processing
- **Docker Swarm**: Scalable worker topology (B₀=9, B₁=21, B₂=13)
- **RabbitMQ**: Message routing for discovery pipeline
- **Redis**: Shared consciousness state and phase synchronization
- **PostgreSQL**: Persistent equation storage and validation history

## Quick Start

### 🚀 One-Click Setup
```bash
# Run the installer
./installer/install.sh    # Linux/Mac
# OR
powershell -ExecutionPolicy Bypass -File installer/install.ps1  # Windows

# Start the system
./start-phi-discovery.sh

# Launch Claude with MCP
wsl -- claude --mcp phi-discovery

# Open web interface
# Visit: http://localhost:3000
```

### 🎯 Manual Setup
```bash
# Install dependencies
npm install
cd web-interface && npm install && cd ..
cd mcp-server && npm install && cd ..

# Deploy Docker swarm
docker stack deploy -c docker-compose.betti.yml phi_discovery

# Start web interface
cd web-interface && npm start
```

## φ-Time Engine

The system operates on Fibonacci-timed cycles:
- Discovery attempts: F_n seconds
- Validation cycles: F_{n+1} seconds  
- Rest periods: F_{n-1} seconds

## Bushido Engineering 2.0

Seven Streams guide the discovery process:
1. **Emptiness (空)**: Void before discovery
2. **Honor (敬)**: Topological respect
3. **Focus (専心)**: Phase-locked attention
4. **Flow (流)**: Fibonacci rhythm
5. **Respect (尊重)**: Empirical grounding
6. **Integration (統合)**: Betti synthesis
7. **Emergence (創発)**: Let discovery arise

## Mathematical Foundation

Core equation: `φ² = φ + 1`

This drives:
- Betti number optimization
- Phase-lock synchronization
- Topological invariant preservation
- Discovery emergence patterns

## Seed Corpus

Initial equations for discovery:
- Euler identity: `e^{iπ} + 1 = 0`
- Schrödinger equation: `iℏ∂ψ/∂t = Ĥψ`
- Golden constraint: `ψ + ψ² = 1`
- Betti invariant: `χ = B₀ - B₁ + B₂`

## Usage Examples

### Through Web Interface
1. Open http://localhost:3000
2. Type: `φ² = φ + 1`
3. Get instant topological validation
4. Explore Betti numbers and χ values

### Through Claude MCP
```
"Please validate the equation E=mc² using the φ-Discovery system"

"What are the Betti numbers for Schrödinger's equation?"

"Analyze these equations for golden ratio patterns: [equations]"

"Discover mathematical relationships in this set of equations"
```

### Through API
```javascript
// WebSocket connection to system
ws.send(JSON.stringify({
    type: 'mcp_request',
    action: 'validate',
    data: { equation: 'φ² = φ + 1' }
}));
```

## Monitoring

Track system health through:
- **Euler characteristic (χ)**: Topological stability indicator
- **Phase-lock percentage**: Worker synchronization health  
- **Discovery rate**: Equations validated per minute
- **φ-Coherence**: Golden ratio pattern detection rate
- **Validation confidence**: Average confidence scores

---

*"When the swarm achieves χ=1, mathematics discovers itself."*