# φ-Discovery Testing & Validation System

A comprehensive testing framework to validate the φ-Discovery mathematical discovery system.

## 🚀 Quick Start

```bash
# Run all tests and health checks
npm run test:all

# Quick system validation  
npm run test:quick

# Health check only
npm run health

# Continuous health monitoring
npm run health:monitor
```

## 📋 Test Categories

### 1. **System Health Checks**
Real-time monitoring and diagnostics:
```bash
node tests/health-monitor.js check     # One-time health check
node tests/health-monitor.js monitor   # Continuous monitoring
```

**Monitors:**
- ✅ Docker Engine & Swarm
- ✅ Web Interface (localhost:3000)
- ✅ MCP Server & WebSocket
- ✅ Database Services (PostgreSQL, Redis, RabbitMQ)  
- ✅ Discovery Workers
- ✅ File System Integrity
- ✅ System Resources

### 2. **Unit Tests**
Core mathematical and algorithmic validation:
```bash
npm run test:unit
# OR
jest tests/unit/
```

**Tests:**
- 🔢 Golden Ratio (φ) calculations
- 📐 Fibonacci sequence generation  
- 🔶 Betti number computation
- ⚡ Equation validation algorithms
- 🌀 Phase lock calculations
- 📊 φ-coherence scoring

### 3. **Integration Tests**
System component integration validation:
```bash
npm run test:integration
# OR  
jest tests/integration/
```

**Tests:**
- 🔗 MCP (Model Context Protocol) integration
- 🐳 Docker container & swarm deployment
- 🌐 WebSocket communication
- 🔄 Service orchestration
- 📡 Real-time data flow

### 4. **Comprehensive System Tests**
Full system validation with detailed reporting:
```bash
node tests/test-runner.js           # Full test suite
node tests/test-runner.js --quick   # Quick validation
node tests/test-runner.js --verbose # Detailed output
```

## 📊 Test Results & Reporting

### Health Report
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "overallHealth": "HEALTHY",
  "services": [
    {
      "id": "docker",
      "name": "Docker Engine", 
      "status": "healthy",
      "message": "Docker 24.0.0",
      "critical": true
    }
  ],
  "summary": {
    "total": 10,
    "healthy": 8,
    "warning": 2, 
    "unhealthy": 0
  }
}
```

### Test Coverage Report
```
📊 φ-Discovery System Test Report
════════════════════════════════════════════════════════════
📈 Overall Results:
   Total Tests: 87
   ✅ Passed: 82
   ❌ Failed: 3
   ⏭️ Skipped: 2
   📊 Pass Rate: 94.3%

📂 Results by Category:
   filesystem: 15/15 passed (100.0%)
   mathematics: 25/25 passed (100.0%)
   dependencies: 8/10 passed (80.0%)
   docker: 12/15 passed (80.0%)
   web: 10/10 passed (100.0%)
   mcp: 8/8 passed (100.0%)
   python: 4/4 passed (100.0%)

🎯 System Readiness: 🟢 EXCELLENT - System is production ready
```

## 🧪 Test Specifications

### Mathematical Function Tests
```javascript
describe('Golden Ratio (φ) Functions', () => {
    it('should validate φ² = φ + 1', () => {
        const phi_squared = PHI * PHI;
        const phi_plus_one = PHI + 1;
        const difference = Math.abs(phi_squared - phi_plus_one);
        assert(difference < PRECISION);
    });
});
```

### MCP Integration Tests  
```javascript
describe('MCP Tool Execution', () => {
    it('should execute validate_equation with proper response', (done) => {
        ws.send(JSON.stringify({
            type: 'mcp_request',
            action: 'validate',
            data: { equation: 'φ² = φ + 1' }
        }));
        // Validates response format and mathematical correctness
    });
});
```

### Docker Infrastructure Tests
```javascript  
describe('Docker Environment', () => {
    it('should build discovery worker image', () => {
        execSync('docker build -t phi-discovery-test workers/discovery/');
        // Validates container builds successfully
    });
});
```

## 🔧 Configuration

### Jest Configuration (`package.json`)
```json
{
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/tests/**/*.test.js"],
    "verbose": true,
    "testTimeout": 30000
  }
}
```

### Health Monitor Settings
```javascript
// Customize check intervals
this.checks.set('web', {
    name: 'Web Interface',
    check: () => this.checkWebInterface(),
    critical: true,
    interval: 15000  // 15 seconds
});
```

## 🎯 Test Strategies

### 1. **Smoke Tests** (Quick Validation)
- File existence checks
- Basic service availability  
- Dependency verification
- Configuration validation

### 2. **Functional Tests** (Core Features)
- Mathematical algorithm accuracy
- MCP tool execution
- WebSocket communication
- Database connectivity

### 3. **Integration Tests** (System-wide)
- Docker container orchestration
- Service mesh communication
- End-to-end workflows
- Performance validation

### 4. **Health Monitoring** (Continuous)
- Real-time service status
- Resource utilization
- Error rate tracking
- Performance metrics

## 🚨 Troubleshooting Tests

### Common Test Failures

#### Docker Tests Failing
```bash
# Check Docker installation
docker --version
docker info

# Initialize swarm if needed  
docker swarm init

# Fix permissions
sudo usermod -aG docker $USER
```

#### MCP Tests Failing
```bash
# Check web server is running
curl http://localhost:3000/health

# Check WebSocket connectivity
npm run health

# Restart MCP server
cd mcp-server && npm start
```

#### Mathematical Tests Failing
```bash
# Verify precision constants
node -e "console.log((1 + Math.sqrt(5)) / 2)"

# Test algorithm manually
npm run validate
```

### Test Environment Setup
```bash
# Install all dependencies
npm install
cd web-interface && npm install && cd ..
cd mcp-server && npm install && cd ..

# Set up environment
cp .env.example .env

# Ensure Docker is ready
docker info
```

## 📈 Performance Benchmarks

### Expected Performance Metrics
- **Mathematical calculations**: < 1ms per equation
- **WebSocket response**: < 100ms
- **Docker health check**: < 5s
- **MCP tool execution**: < 2s
- **Full test suite**: < 5 minutes

### Performance Test Results
```
🔬 Performance Tests:
   ✅ File sizes reasonable (< 1MB per component)
   ✅ Startup scripts fast (< 1s parse time)
   ✅ WebSocket response time (< 100ms)
   ✅ Mathematical calculations (< 1ms)
```

## 🔒 Security Test Validations

- ✅ No hardcoded passwords in source code
- ✅ Environment variables used for secrets
- ✅ Containers don't run as root user
- ✅ Limited port exposure
- ✅ Secure WebSocket connections

## 📅 Continuous Testing

### Pre-commit Tests
```bash
# Run before committing code
npm run test:quick
npm run health
```

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: φ-Discovery Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:all
```

### Monitoring Schedule
- **Health checks**: Every 60 seconds (production)
- **Full test suite**: Daily (development)
- **Integration tests**: On deployment
- **Performance tests**: Weekly

---

## 🎯 Test Results Interpretation

### Health Status Meanings
- **🟢 HEALTHY**: All systems operational
- **🟡 WARNING**: Non-critical issues detected  
- **🔴 UNHEALTHY**: Critical systems failing

### Pass Rate Guidelines
- **> 95%**: Production ready ✅
- **85-95%**: Good, minor fixes needed ⚠️
- **70-85%**: Fair, significant work required 🔧
- **< 70%**: Poor, major issues to resolve ❌

The testing framework ensures the φ-Discovery system maintains mathematical accuracy, system reliability, and production readiness. 🌟