# φ-Discovery System Testing Guide

## Prerequisites

1. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your passwords
   # DO NOT commit .env to git!
   ```

2. **Required Software**
   - Docker 20.10+
   - Docker Compose 2.0+
   - Python 3.11+
   - Node.js 18+

## Testing Phases

### Phase 1: Infrastructure Testing

Start the core infrastructure services:

```bash
# Start PostgreSQL, Redis, RabbitMQ
docker-compose -f docker/docker-compose.infrastructure.yml up -d

# Wait for services to be healthy
docker-compose -f docker/docker-compose.infrastructure.yml ps
```

#### Verify PostgreSQL
```bash
# Check database initialization
docker exec -it mcp-phi-base_postgres_1 psql -U phi_user -d phi_discovery -c "\dt"

# Should show tables:
# - validated_equations
# - equation_dependencies  
# - discovery_history
# - literature_references
```

#### Verify Redis
```bash
# Test Redis connection
docker exec -it mcp-phi-base_redis_1 redis-cli -a fibonacci_sequence_112358 ping
# Expected: PONG

# Check for keys
docker exec -it mcp-phi-base_redis_1 redis-cli -a fibonacci_sequence_112358 keys "*"
```

#### Verify RabbitMQ
```bash
# Access management UI
open http://localhost:15672
# Login: phi_discovery / betti_topology_921

# Check for:
# - Virtual host: /phi
# - No errors in overview
```

### Phase 2: Worker Testing (Local)

#### Test Discovery Worker
```bash
cd workers/discovery

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Test pattern recognizer
python discovery_worker.py pattern_recognizer
```

In another terminal, send a test message:
```python
import pika
import json

# Connect to RabbitMQ
credentials = pika.PlainCredentials('phi_discovery', 'betti_topology_921')
connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost', 5672, '/phi', credentials)
)
channel = connection.channel()

# Send test equation
message = {
    'equation': 'φ² = φ + 1',
    'timestamp': '2024-01-01T00:00:00Z'
}

channel.basic_publish(
    exchange='phi.discovery',
    routing_key='discovery.past.init',
    body=json.dumps(message)
)

print("Sent test equation")
connection.close()
```

#### Test Validation Worker
```bash
cd workers/validation

# Similar setup
python validation_worker.py theorem_checker
```

### Phase 3: Docker Image Building

```bash
# Build base image
docker build -t mcp-phi-base:latest -f docker/Dockerfile.mcp-base .

# Build worker images
docker build -t phi-discovery:latest -f workers/discovery/Dockerfile workers/discovery/
docker build -t phi-validation:latest -f workers/validation/Dockerfile workers/validation/
```

### Phase 4: Swarm Testing (Single Node)

```bash
# Initialize swarm
./scripts/init-swarm.sh

# Deploy services
docker stack deploy -c docker/docker-compose.betti.yml phi_discovery

# Check services
docker service ls

# Should see 11 services starting up
```

### Phase 5: Integration Testing

#### Monitor Discovery Flow
```bash
# Watch pattern recognizer logs
docker service logs -f phi_discovery_pattern_recognizer

# In another terminal, watch equation generator
docker service logs -f phi_discovery_equation_generator

# And phase optimizer
docker service logs -f phi_discovery_phase_optimizer
```

#### Send Test Equation
```bash
# Use the proof theater to send equations
node visualizers/topological-proof-theater.js

# Commands in theater:
# - validate φ² = φ + 1
# - validate E = mc²
# - validate ∇²ψ + k²ψ = 0
```

#### Check Results

**Redis State:**
```bash
# Check current discovery
docker exec -it mcp-phi-base_redis_1 redis-cli -a fibonacci_sequence_112358 hgetall current_discovery

# Check phase states
docker exec -it mcp-phi-base_redis_1 redis-cli -a fibonacci_sequence_112358 keys "phase:*"

# Check chi value
docker exec -it mcp-phi-base_redis_1 redis-cli -a fibonacci_sequence_112358 get chi_current
```

**PostgreSQL Results:**
```sql
-- Connect to database
docker exec -it mcp-phi-base_postgres_1 psql -U phi_user -d phi_discovery

-- Check validated equations
SELECT equation, confidence, validation_type, chi 
FROM validated_equations 
ORDER BY created_at DESC;

-- Check discovery history
SELECT equation, worker_type, phase, phase_lock 
FROM discovery_history 
ORDER BY timestamp DESC 
LIMIT 10;
```

### Phase 6: Phase Lock Testing

Monitor phase coherence across workers:

```bash
# Watch for phase lock events in Redis
watch -n 1 'docker exec -it mcp-phi-base_redis_1 redis-cli -a fibonacci_sequence_112358 mget phase:pattern_recognizer phase:equation_generator phase:phase_optimizer'
```

### Phase 7: Validation Consensus Testing

Send same equation to all validators:

```python
# Test validation consensus
equations = [
    'φ² = φ + 1',        # Should pass all validators
    'E = mc²',           # Should pass with high confidence
    'invalid = = test',  # Should fail validation
]

for eq in equations:
    # Send to validation.request topic
    # Watch how 3 validators vote
    # Check if consensus is reached (2/3 agreement)
```

## Expected Behaviors

### ✓ Success Indicators

1. **Discovery Pipeline**
   - Equations flow: pattern → equation → phase → validation
   - Each stage adds metadata (patterns, derivatives, implications)
   - Phase lock coherence > 0.618 (ψ threshold)

2. **Validation Triangle**
   - All 3 validators process each equation
   - Consensus reached when 2/3 agree
   - Valid equations stored in PostgreSQL

3. **Topology Preservation**
   - χ (Euler characteristic) remains stable
   - Betti numbers computed correctly
   - No topology violations in logs

### ⚠️ Common Issues

1. **Services Won't Start**
   - Check Docker memory limits (need ~4GB)
   - Verify no port conflicts (5432, 6379, 5672)
   - Check .env file has all required variables

2. **Workers Can't Connect**
   - Ensure infrastructure is fully up
   - Check network connectivity between containers
   - Verify credentials in .env match

3. **No Message Flow**
   - Check RabbitMQ exchanges exist
   - Verify routing keys match
   - Look for dead letter queues

## Performance Metrics

Monitor these for system health:

```bash
# RabbitMQ metrics
- Message rate: Should see φ-timed bursts
- Queue depth: Should not grow unbounded
- Connection count: 1 per worker + orchestrators

# Redis metrics  
- Key count: Should stabilize around 20-30
- Memory usage: < 100MB for normal operation
- Command rate: Bursts during discovery

# PostgreSQL metrics
- Connection count: ~10-15 active
- Query rate: Spikes during validation
- Table sizes: Grow with discoveries
```

## Debugging Commands

```bash
# Check all container logs
docker-compose -f docker/docker-compose.infrastructure.yml logs

# Inspect service tasks
docker service ps phi_discovery_pattern_recognizer

# Check network connectivity
docker network inspect discovery_manifold

# Force service update
docker service update --force phi_discovery_pattern_recognizer
```

## Next Steps

Once basic testing passes:

1. **Scale Testing**: Add more worker replicas
2. **Load Testing**: Send many equations rapidly  
3. **Failure Testing**: Kill services and verify recovery
4. **Performance Testing**: Measure discovery rate
5. **UI Integration**: Connect React app to WebSocket endpoints

Remember: The system should exhibit φ-recursive behavior, with discoveries building on each other to reveal deeper mathematical truths!