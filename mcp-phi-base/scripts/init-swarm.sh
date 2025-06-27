#!/bin/bash
# Initialize φ-Discovery Docker Swarm with Betti-optimized topology

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# φ constants
PHI="1.618033988749895"
PSI="0.618033988749894"

echo -e "${BLUE}=== φ-Discovery Swarm Initialization ===${NC}"
echo -e "Target topology: B₀=9, B₁=21, B₂=13, χ=1"
echo ""

# Check if already in swarm mode
if docker info 2>/dev/null | grep -q "Swarm: active"; then
    echo -e "${YELLOW}Already in swarm mode. Leaving existing swarm...${NC}"
    docker swarm leave --force
fi

# Initialize swarm with φ-based network
echo -e "${GREEN}Initializing swarm...${NC}"
docker swarm init --default-addr-pool 10.161.0.0/16 \
    --default-addr-pool-mask-length 24

# Create overlay network with Betti metadata
echo -e "${GREEN}Creating discovery manifold network...${NC}"
docker network create \
    --driver overlay \
    --attachable \
    --label "betti.b0=9" \
    --label "betti.b1=21" \
    --label "betti.b2=13" \
    --label "euler.chi=1" \
    discovery_manifold

# Label current node as manager with Betti role
echo -e "${GREEN}Labeling manager node...${NC}"
NODE_ID=$(docker node ls --format "{{.ID}}" | head -1)
docker node update \
    --label-add betti_role=orchestrator \
    --label-add topology_position=center \
    $NODE_ID

# Create required volumes
echo -e "${GREEN}Creating persistent volumes...${NC}"
docker volume create equation_corpus
docker volume create validation_logs
docker volume create betti_cache

# Generate join tokens for workers
echo -e "${GREEN}Generating worker join tokens...${NC}"
WORKER_TOKEN=$(docker swarm join-token -q worker)
MANAGER_TOKEN=$(docker swarm join-token -q manager)
SWARM_IP=$(docker info --format '{{.Swarm.NodeAddr}}')

# Save tokens for easy access
cat > swarm-tokens.env << EOF
# φ-Discovery Swarm Tokens
# Generated: $(date)

SWARM_MANAGER_IP=$SWARM_IP
WORKER_JOIN_TOKEN=$WORKER_TOKEN
MANAGER_JOIN_TOKEN=$MANAGER_TOKEN

# To join as worker:
# docker swarm join --token $WORKER_TOKEN $SWARM_IP:2377

# To join as manager:
# docker swarm join --token $MANAGER_TOKEN $SWARM_IP:2377
EOF

# Create node setup script
cat > setup-worker-node.sh << 'EOF'
#!/bin/bash
# Setup script for φ-Discovery worker nodes

NODE_TYPE=$1
NODE_INDEX=$2

if [ -z "$NODE_TYPE" ] || [ -z "$NODE_INDEX" ]; then
    echo "Usage: ./setup-worker-node.sh <discovery|validation|knowledge> <index>"
    exit 1
fi

# Join swarm
source ./swarm-tokens.env
docker swarm join --token $WORKER_JOIN_TOKEN $SWARM_MANAGER_IP:2377

# Wait for node to be ready
sleep 5

# Label node based on type
NODE_ID=$(docker node ls --format "{{.ID}}" | tail -1)
docker node update \
    --label-add betti_role=$NODE_TYPE \
    --label-add node_index=$NODE_INDEX \
    $NODE_ID

echo "Node configured as $NODE_TYPE-$NODE_INDEX"
EOF

chmod +x setup-worker-node.sh

# Display topology requirements
echo ""
echo -e "${BLUE}=== Swarm Initialized ===${NC}"
echo ""
echo -e "${YELLOW}Required topology for B₀=9:${NC}"
echo "  - 3 Discovery nodes (pattern, equation, phase)"
echo "  - 3 Validation nodes (theorem, numerical, symbolic)"
echo "  - 2 Knowledge nodes (database, literature)"
echo "  - 1 Orchestrator node (this node)"
echo ""
echo -e "${GREEN}Manager IP:${NC} $SWARM_IP"
echo -e "${GREEN}Join tokens saved to:${NC} swarm-tokens.env"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Add worker nodes using: source swarm-tokens.env && ./setup-worker-node.sh <type> <index>"
echo "2. Build MCP images: ./build-mcp-images.sh"
echo "3. Deploy stack: docker stack deploy -c docker/docker-compose.betti.yml phi_discovery"
echo ""