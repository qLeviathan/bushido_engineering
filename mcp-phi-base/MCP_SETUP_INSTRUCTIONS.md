# φ-Discovery MCP Setup Instructions

This guide shows how to integrate φ-Discovery with Claude through the Model Context Protocol (MCP).

## Quick Start

1. **Start the Discovery System**:
   ```bash
   ./start-phi-discovery.sh
   ```

2. **Launch Claude with MCP**:
   ```bash
   wsl -- claude --mcp phi-discovery
   ```

3. **Open Web Interface**:
   - Navigate to http://localhost:3000
   - Click "Connect MCP" 
   - Start discovering mathematics!

## Detailed Setup

### 1. Prerequisites

- **Windows with WSL**: For `wsl -- claude` command
- **Docker**: For the discovery system backend
- **Node.js**: For the web interface and MCP server
- **Claude CLI**: Installed and configured

### 2. Install Dependencies

```bash
# Install main dependencies
npm install

# Install MCP server dependencies
cd mcp-server
npm install
cd ..

# Install web interface dependencies
cd web-interface
npm install
cd ..
```

### 3. Configure MCP

Create or edit `~/.claude/mcp.json`:

```json
{
  "servers": {
    "phi-discovery": {
      "command": "node",
      "args": ["path/to/mcp-phi-base/mcp-server/phi-discovery-mcp.js"],
      "env": {
        "PHI_DISCOVERY_URL": "http://localhost:3000"
      }
    }
  }
}
```

**Important**: Replace `path/to/mcp-phi-base` with the actual absolute path to your project.

### 4. Start the System

#### Option A: Using Scripts (Recommended)
```bash
# Start everything with one command
./start-phi-discovery.sh

# In another terminal, start Claude with MCP
wsl -- claude --mcp phi-discovery
```

#### Option B: Manual Start
```bash
# 1. Start Docker Swarm
docker stack deploy -c docker-compose.betti.yml phi_discovery

# 2. Start web interface
cd web-interface
npm start &
cd ..

# 3. Start MCP server
cd mcp-server
npm start &
cd ..

# 4. Launch Claude with MCP
wsl -- claude --mcp phi-discovery
```

### 5. Using the System

#### In the Web Interface:
1. Open http://localhost:3000
2. No login required - direct access
3. Type equations or questions
4. Click "Connect MCP" if needed

#### In Claude:
You now have access to these MCP tools:

- **validate_equation**: Validate mathematical equations
  ```
  Use the validate_equation tool with the equation "φ² = φ + 1"
  ```

- **calculate_betti**: Get Betti numbers for expressions
  ```
  Use the calculate_betti tool with "∇²ψ + k²ψ = 0"
  ```

- **check_phi_coherence**: Analyze golden ratio patterns
  ```
  Use the check_phi_coherence tool with "F(n+1)/F(n) → φ"
  ```

- **discover_patterns**: Find patterns in equation sets
  ```
  Use the discover_patterns tool with equations ["E=mc²", "F=ma", "φ²=φ+1"]
  ```

## Example Workflow

1. **Ask Claude to validate equations**:
   ```
   Please validate the equation "φ² = φ + 1" using the φ-Discovery system
   ```

2. **Explore mathematical relationships**:
   ```
   What are the Betti numbers for Schrödinger's equation "iℏ∂ψ/∂t = Ĥψ"?
   ```

3. **Discover patterns**:
   ```
   Analyze these equations for mathematical patterns: ["E=mc²", "F=ma", "PV=nRT", "φ²=φ+1"]
   ```

## Architecture

```
Claude (with MCP) ←→ MCP Server ←→ Web Interface ←→ Docker Swarm
                      ↓
                 φ-Discovery Tools
                 (validate, analyze, discover)
```

## Troubleshooting

### "MCP server not found"
- Check the path in `~/.claude/mcp.json`
- Ensure the MCP server dependencies are installed: `cd mcp-server && npm install`

### "Connection refused" 
- Verify the web interface is running: http://localhost:3000
- Check Docker services: `docker stack ls`

### "WSL command not found"
- Ensure WSL is installed on Windows
- Verify Claude CLI is installed in WSL
- Alternative: Run Claude directly if not using WSL

### "Docker not running"
- Start Docker Desktop
- Initialize swarm: `docker swarm init`
- Deploy services: `docker stack deploy -c docker-compose.betti.yml phi_discovery`

## Configuration Options

### Environment Variables (.env)
```bash
# Web Interface
WEB_PORT=3000

# Discovery Settings
PHI_PRECISION=50
VALIDATION_THRESHOLD=0.618
DISCOVERY_RATE=fibonacci

# MCP Settings
MCP_PORT=8080
MCP_LOG_LEVEL=info
```

### MCP Server Settings
Edit `mcp-server/phi-discovery-mcp.js` to customize:
- Tool descriptions
- Validation algorithms
- Response formats
- Connection timeouts

## Advanced Usage

### Custom MCP Tools
Add new tools to the MCP server:

```javascript
// In phi-discovery-mcp.js
{
    name: 'my_custom_tool',
    description: 'My custom mathematical tool',
    inputSchema: {
        type: 'object',
        properties: {
            input: { type: 'string' }
        }
    }
}
```

### Integration with Other Systems
The MCP server can be extended to integrate with:
- Wolfram Alpha API
- SymPy for symbolic computation
- NumPy for numerical analysis
- LaTeX for equation rendering

### Batch Processing
Process multiple equations via Claude:

```
Use the discover_patterns tool to analyze all equations in this paper: [paste equations]
```

## Support

- **Web Interface**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Docker Status**: `docker stack ps phi_discovery`
- **MCP Logs**: Check Claude console output

## Next Steps

1. **Explore Mathematical Discovery**: Ask Claude to validate complex equations
2. **Pattern Recognition**: Use pattern discovery on your research equations  
3. **Topological Analysis**: Investigate Betti numbers of mathematical structures
4. **Golden Ratio Exploration**: Find φ-coherence in natural phenomena equations

---

*"Through MCP, Claude and φ-Discovery unite to explore the mathematical universe together."*