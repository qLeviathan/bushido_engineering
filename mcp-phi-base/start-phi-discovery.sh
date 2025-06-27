#!/bin/bash
# Start φ-Discovery System with MCP

cd "$(dirname "$0")"

echo "🔺 Starting φ-Discovery System..."

# Check if already running
if docker stack ls | grep -q phi_discovery; then
    echo "⚠️  φ-Discovery is already running!"
    echo "📱 Opening web interface..."
    sleep 2
    xdg-open http://localhost:3000 2>/dev/null || open http://localhost:3000 2>/dev/null || start http://localhost:3000
    exit 0
fi

# Start Docker services
echo "🐳 Deploying Docker services..."
docker stack deploy -c docker-compose.betti.yml phi_discovery

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 10

# Start MCP server
echo "🔗 Starting MCP server..."
cd mcp-server
npm start &
MCP_PID=$!
cd ..

# Start web interface
echo "🌐 Starting web interface..."
cd web-interface
npm start &
WEB_PID=$!
cd ..

# Wait a bit for servers to start
sleep 5

echo ""
echo "✅ φ-Discovery System Started!"
echo ""
echo "📋 Next Steps:"
echo "   1. Launch Claude with MCP:"
echo "      wsl -- claude --mcp phi-discovery"
echo ""
echo "   2. Open web interface:"
echo "      http://localhost:3000"
echo ""
echo "🔧 System Health:"
echo "   - Docker Services: $(docker stack ps phi_discovery --format 'table {{.CurrentState}}' | grep -c Running || echo 'Starting...')"
echo "   - MCP Server: Running (PID: $MCP_PID)"
echo "   - Web Interface: Running (PID: $WEB_PID)"

# Open web interface automatically
echo "🚀 Opening web interface..."
sleep 2
xdg-open http://localhost:3000 2>/dev/null || open http://localhost:3000 2>/dev/null || start http://localhost:3000

# Show MCP instructions
echo ""
echo "💡 To connect Claude:"
echo "   Make sure ~/.claude/mcp.json includes:"
echo '   {'
echo '     "servers": {'
echo '       "phi-discovery": {'
echo '         "command": "node",'
echo "         \"args\": [\"$(pwd)/mcp-server/phi-discovery-mcp.js\"]"
echo '       }'
echo '     }'
echo '   }'

# Keep running
echo ""
echo "💤 System running... Press Ctrl+C to stop"
wait $WEB_PID $MCP_PID