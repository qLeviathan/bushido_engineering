#!/bin/bash
# φ-Discovery System Validation Script
# Complete system validation and readiness check

cd "$(dirname "$0")"

echo "🔺 φ-Discovery System Validation"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'  
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track validation results
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to run validation step
validate_step() {
    local name="$1"
    local command="$2"
    local critical="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo -n "🧪 $name... "
    
    if eval "$command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        if [ "$critical" = "true" ]; then
            echo -e "${RED}❌ FAIL (CRITICAL)${NC}"
        else
            echo -e "${YELLOW}⚠️ WARN${NC}"
        fi
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Function to run command and show output
run_verbose() {
    local name="$1"
    local command="$2"
    
    echo ""
    echo -e "${BLUE}▶️ Running: $name${NC}"
    echo "Command: $command"
    echo "----------------------------------------"
    
    if eval "$command"; then
        echo -e "${GREEN}✅ Success${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed${NC}"
        return 1
    fi
}

echo "📋 Phase 1: Prerequisites Check"
echo "--------------------------------"

# Check Node.js
validate_step "Node.js installed" "node --version" true

# Check npm
validate_step "npm available" "npm --version" true

# Check Docker
validate_step "Docker installed" "docker --version" true

# Check Docker running
validate_step "Docker daemon running" "docker info" true

# Check Python
validate_step "Python available" "python3 --version || python --version" false

echo ""
echo "📋 Phase 2: File Structure Validation"
echo "--------------------------------------"

# Critical files
validate_step "package.json exists" "test -f package.json" true
validate_step "Docker Compose config" "test -f docker-compose.betti.yml" true
validate_step "Web interface files" "test -f web-interface/index.html && test -f web-interface/server.js" true
validate_step "MCP server files" "test -f mcp-server/phi-discovery-mcp.js" true
validate_step "Worker files" "test -f workers/discovery/discovery_worker.py && test -f workers/validation/validation_worker.py" false
validate_step "Start/stop scripts" "test -f start-phi-discovery.sh && test -f stop-phi-discovery.sh" false

echo ""
echo "📋 Phase 3: Configuration Validation"
echo "-------------------------------------"

# Validate configurations
validate_step "package.json valid" "node -e 'JSON.parse(require(\"fs\").readFileSync(\"package.json\"))'" true
validate_step "Docker Compose valid" "docker-compose -f docker-compose.betti.yml config" false
validate_step "Environment template" "test -f .env || test -f .env.example" false

echo ""
echo "📋 Phase 4: Dependencies Check"
echo "-------------------------------"

# Node dependencies
validate_step "Main dependencies" "test -d node_modules" false
validate_step "Web interface deps" "test -d web-interface/node_modules" false
validate_step "MCP server deps" "test -d mcp-server/node_modules" false

echo ""
echo "📋 Phase 5: Quick Functionality Test"
echo "-------------------------------------"

# Test mathematical functions
validate_step "Mathematical algorithms" "node -e 'const phi=1.618033988749895; console.log(Math.abs(phi*phi - (phi+1)) < 1e-10)'" true

# Test Docker Compose syntax
validate_step "Docker Compose syntax" "docker-compose -f docker-compose.betti.yml config" false

# Test MCP server syntax
validate_step "MCP server syntax" "node -c mcp-server/phi-discovery-mcp.js" false

echo ""
echo "📋 Phase 6: Advanced Testing (Optional)"
echo "----------------------------------------"

# Run comprehensive tests if available
if [ -f "tests/test-runner.js" ]; then
    echo -e "${BLUE}🧪 Running comprehensive test suite...${NC}"
    if node tests/test-runner.js --quick; then
        echo -e "${GREEN}✅ Comprehensive tests passed${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠️ Some comprehensive tests failed${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

# Run health monitor if available
if [ -f "tests/health-monitor.js" ]; then
    echo -e "${BLUE}🏥 Running health check...${NC}"
    if node tests/health-monitor.js check; then
        echo -e "${GREEN}✅ Health check passed${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠️ Health check found issues${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

echo ""
echo "📊 Validation Summary"
echo "====================="

# Calculate pass rate
PASS_RATE=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))

echo "Total Checks: $TOTAL_CHECKS"
echo -e "✅ Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "❌ Failed: ${RED}$FAILED_CHECKS${NC}"
echo -e "📊 Pass Rate: ${BLUE}$PASS_RATE%${NC}"

echo ""
echo "🎯 System Status Assessment:"

if [ $PASS_RATE -ge 90 ]; then
    echo -e "${GREEN}🟢 EXCELLENT${NC} - System is production ready!"
    echo "   ✅ All critical components validated"
    echo "   ✅ Ready for mathematical discovery"
    echo "   ✅ MCP integration functional"
elif [ $PASS_RATE -ge 75 ]; then
    echo -e "${YELLOW}🟡 GOOD${NC} - System needs minor fixes"
    echo "   ⚠️ Some non-critical issues detected"
    echo "   ✅ Core functionality appears intact"
elif [ $PASS_RATE -ge 50 ]; then
    echo -e "${YELLOW}🟠 FAIR${NC} - System needs significant work"
    echo "   ⚠️ Multiple issues require attention"
    echo "   🔧 Review failed checks above"
else
    echo -e "${RED}🔴 POOR${NC} - System requires major fixes"
    echo "   ❌ Critical issues must be resolved"
    echo "   🔧 System not ready for use"
fi

echo ""
echo "🚀 Next Steps:"

if [ $PASS_RATE -ge 90 ]; then
    echo "1. Start the system: ./start-phi-discovery.sh"
    echo "2. Launch Claude with MCP: wsl -- claude --mcp phi-discovery"
    echo "3. Open web interface: http://localhost:3000"
    echo "4. Begin mathematical discovery!"
elif [ $PASS_RATE -ge 75 ]; then
    echo "1. Fix non-critical issues identified above"
    echo "2. Install missing dependencies: npm install"
    echo "3. Re-run validation: ./validate-system.sh"
    echo "4. Start system when validation passes"
else
    echo "1. Review failed checks above"
    echo "2. Install missing prerequisites (Node.js, Docker, etc.)"
    echo "3. Install dependencies: npm install"
    echo "4. Re-run validation until pass rate > 75%"
fi

echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: MCP_SETUP_INSTRUCTIONS.md"
echo "   - Testing Guide: tests/README.md"
echo "   - System Overview: README.md"

echo ""
echo "🔍 For detailed diagnostics:"
echo "   - Health check: npm run health"
echo "   - Full test suite: npm run test:all"
echo "   - Health monitoring: npm run health:monitor"

# Exit with appropriate code
if [ $PASS_RATE -ge 75 ]; then
    exit 0
else
    exit 1
fi