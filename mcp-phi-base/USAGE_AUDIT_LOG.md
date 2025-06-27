# φ-Discovery System Usage Audit Log

**Generated:** 2025-06-27  
**Purpose:** Identify actively used vs dormant components in mcp-phi-base project

## Executive Summary

The mcp-phi-base project shows significant technical debt with many defined but unused components. The system appears to be in a partially implemented state with multiple architectural layers that are not fully integrated.

---

## ✅ ACTIVELY USED Components

### Core Dependencies
- **ws (WebSocket)** - Used in mcp-server, web-interface, and tests
- **express** - Used in web-interface/server.js
- **dotenv** - Used for environment configuration
- **@modelcontextprotocol/sdk** - Core MCP functionality in mcp-server

### Active Files
- `/mcp-server/phi-discovery-mcp.js` - MCP server implementation
- `/web-interface/server.js` - Web interface backend
- `/web-interface/index.html` - Main web UI
- `/validators/betti-fibonacci-validator.js` - Mathematical validation
- `/start-phi-discovery.sh` - System startup script
- `/stop-phi-discovery.sh` - System shutdown script

### Docker Services (Defined in docker-compose.betti.yml)
- Docker stack deployment mechanism is used
- Services are defined but deployment status unknown

---

## ⚠️ PARTIALLY USED Components

### Node.js Dependencies
- **http-proxy-middleware** - Imported in web-interface but only for RabbitMQ proxy
- **blessed/blessed-contrib** - Only used in topological-proof-theater.js visualizer
- **jest** - Test framework configured but limited test coverage

### Scripts
- `/scripts/discovery-node.js` - Imports Redis/AMQP but not called by main flow
- `/scripts/validation-node.js` - Orchestrator script exists but unused
- `/visualizers/topological-proof-theater.js` - Terminal UI exists but not integrated

### Python Workers
- `/workers/discovery/discovery_worker.py` - Defined but no integration point
- `/workers/validation/validation_worker.py` - Defined but no integration point

---

## ❌ NOT USED Components

### Unused Dependencies (in package.json but never imported)
- **pg** (PostgreSQL) - Listed but no database connections found
- **redis** - Only imported in unused scripts
- **amqplib** - Only imported in unused scripts
- **electron-store** - Listed in root package.json but only used in electron-app
- **electron-updater** - In electron-app but app not integrated

### Unused Infrastructure
- **RabbitMQ** - Proxy configured but no actual message queue usage
- **PostgreSQL** - No database initialization or connections
- **Redis** - No cache implementation found
- **Docker Swarm** - Stack defined but no evidence of multi-node deployment

### Dormant Features
- **Electron App** (`/electron-app/`) - Separate desktop app not integrated
- **Rust Implementation** (`/src/lib.rs`) - Comprehensive Rust library with no build integration
- **Python Workers** - Discovery and validation workers not connected
- **Health Monitoring** (`/tests/health-monitor.js`) - Exists but not in active use

### Alternative Interfaces
- `/web-interface/equation-mindmap.html` - Alternative UI
- `/web-interface/equation-mindmap-enhanced.html` - Enhanced version unused
- `/web-interface/integrated-physics-learning.html` - Educational interface
- `/web-interface/physics-validator.html` - Duplicate validator interface
- `/physics-validator.html` - Root level duplicate

---

## 🗑️ DEAD CODE (Can be safely removed)

### Duplicate/Old Files
- `/web-interface/index-old.html` - Backup of old interface
- `/web-interface/test-enhanced-mindmap.html` - Test file
- `/physics-validator.html` - Duplicate of web-interface version
- `/docker/docker-compose.betti.yml` - Duplicate of root version
- Multiple README versions (README_v2.md, README_USER.md)
- Multiple MCP setup versions (MCP_SETUP_INSTRUCTIONS_v2.md)
- Multiple infrastructure maps (INFRASTRUCTURE_MAP_v3.md)

### Unused Docker Configurations
- `/docker/Dockerfile.discovery` - Not referenced in compose files
- `/docker/Dockerfile.mcp-base` - Not used in current setup
- `/docker/init-db.sql` - Database init script for unused PostgreSQL

### Orphaned Scripts
- `/scripts/init-swarm.sh` - Swarm initialization not used
- `/scripts/package-app.sh` - App packaging script not integrated
- `/launcher/launcher.py` - Python launcher superseded by shell scripts
- `/launcher/phi-discovery-launcher.py` - Duplicate launcher

### Test Artifacts
- `/test-results.json` - Old test results
- `/health-report.json` - Old health check data

---

## Architecture Analysis

### What's Actually Running
1. **MCP Server** - Node.js server providing MCP protocol interface
2. **Web Interface** - Express server serving static HTML/JS
3. **WebSocket Bridge** - Connects web UI to MCP server
4. **Docker Stack** - Defined but actual runtime unclear

### What's Missing
1. **Data Persistence** - No active database despite PostgreSQL dependencies
2. **Message Queue** - RabbitMQ configured but not utilized
3. **Caching Layer** - Redis installed but never used
4. **Python Integration** - Workers defined but not connected
5. **Rust Integration** - Complete library with no build/runtime integration

### Integration Gaps
- Python workers have no connection to Node.js services
- Rust library is completely isolated
- Electron app is a separate entity
- Multiple validation approaches without unified interface

---

## Recommendations

### Immediate Cleanup (Low Risk)
1. Remove all files marked as 🗑️ DEAD CODE
2. Remove unused dependencies from package.json files
3. Consolidate duplicate documentation files
4. Delete test artifacts and old backups

### Architecture Decisions Needed
1. **Choose primary implementation language:** Currently split between JavaScript, Python, and Rust
2. **Database strategy:** PostgreSQL is configured but unused
3. **Message queue necessity:** RabbitMQ adds complexity without current benefit
4. **Desktop vs Web:** Electron app duplicates web functionality

### Technical Debt Reduction
1. Either implement or remove Python worker integration
2. Either build and use Rust library or remove it
3. Implement actual data persistence or remove database dependencies
4. Create integration tests for active components

### Documentation Consolidation
- Merge multiple README versions into single source of truth
- Update setup instructions to reflect actual architecture
- Document which components are experimental vs production

---

## Dependency Usage Matrix

| Dependency | Defined In | Actually Used | Can Remove |
|------------|------------|---------------|------------|
| ws | All package.json | ✅ Yes | No |
| express | Root, web-interface | ✅ Yes | No |
| blessed | Root | ⚠️ Only visualizer | Maybe |
| pg | Root | ❌ No | Yes |
| redis | Root | ❌ No | Yes |
| amqplib | Root | ❌ No | Yes |
| electron-store | Root | ❌ No | Yes |
| @modelcontextprotocol/sdk | mcp-server | ✅ Yes | No |
| http-proxy-middleware | web-interface | ⚠️ Minimal | Maybe |
| jest | Root | ⚠️ Minimal | No |

---

## Component Status Summary

- **Total Files:** ~100+
- **Actively Used:** ~15-20 files (15-20%)
- **Partially Used:** ~10-15 files (10-15%)
- **Not Used:** ~40-50 files (40-50%)
- **Dead Code:** ~20-25 files (20-25%)

The project appears to be in an experimental state with multiple parallel implementations that haven't been integrated. Significant cleanup and architectural decisions are needed to reduce complexity and technical debt.