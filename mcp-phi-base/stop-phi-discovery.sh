#!/bin/bash
# Stop φ-Discovery System

echo "🛑 Stopping φ-Discovery System..."

# Stop Docker stack
echo "🐳 Stopping Docker services..."
docker stack rm phi_discovery 2>/dev/null

# Stop Node.js servers
echo "🔗 Stopping MCP server..."
pkill -f "mcp-server" 2>/dev/null

echo "🌐 Stopping web interface..."
pkill -f "web-interface.*server.js" 2>/dev/null
pkill -f "node.*server.js" 2>/dev/null

# Wait a moment for cleanup
sleep 2

# Check if services are stopped
DOCKER_RUNNING=$(docker stack ls | grep -c phi_discovery || echo 0)
NODE_RUNNING=$(pgrep -f "server.js" | wc -l)

echo ""
echo "📊 Shutdown Status:"
echo "   - Docker Services: $([ $DOCKER_RUNNING -eq 0 ] && echo 'Stopped ✅' || echo 'Still running ⚠️')"
echo "   - Node Servers: $([ $NODE_RUNNING -eq 0 ] && echo 'Stopped ✅' || echo 'Still running ⚠️')"

if [ $DOCKER_RUNNING -eq 0 ] && [ $NODE_RUNNING -eq 0 ]; then
    echo "✅ φ-Discovery System completely stopped"
else
    echo "⚠️  Some services may still be running"
    echo "   Run 'docker ps' and 'ps aux | grep node' to check"
fi

echo ""
echo "🔄 To restart: ./start-phi-discovery.sh"