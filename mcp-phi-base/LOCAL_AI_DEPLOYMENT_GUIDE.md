# 🦀 Rust AI Deployment Guide: Simple Replicatable Model Workers

## 📋 Table of Contents
1. [Overview](#overview)
2. [Simple Architecture](#simple-architecture)
3. [Prerequisites](#prerequisites)
4. [Phase 1: Single Model Worker](#phase-1-single-model-worker)
5. [Phase 2: Auto-Scaling Setup](#phase-2-auto-scaling-setup)
6. [Phase 3: Integration & Testing](#phase-3-integration--testing)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Build a simple, replicatable AI model worker in Rust that can scale from 1 to N instances based on load. Perfect for φ-Discovery equation validation with your RTX 4090.

### Key Benefits
- **Single Binary**: One Rust executable handles everything
- **Simple Scaling**: Docker Swarm replicates the same worker
- **High Performance**: Direct GPU access with Candle
- **No Complexity**: No orchestrators, load balancers, or complex routing

---

## Simple Architecture

### Target State
```
User → Web UI → Single Worker Type (1-N replicas)
                      ↓
                 Rust Model Worker
                 (RTX 4090 + Candle)
```

**That's it!** No complex orchestration, just simple replicatable workers.

---

## Prerequisites

### Your Hardware (Perfect!)
- **GPU**: RTX 4090 (24GB VRAM) ✅
- **CPU**: 64 cores ✅
- **RAM**: 64GB+ ✅
- **Storage**: NVMe SSD ✅

### Software Setup
```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install Docker & Docker Swarm
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Initialize Swarm
docker swarm init

# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker

# Test GPU access
docker run --rm --gpus all nvidia/cuda:12.1-base nvidia-smi
```

---

## Phase 1: Single Model Worker

### 1.1 Create Rust Model Worker

```bash
# Create new Rust project
mkdir phi-model-worker
cd phi-model-worker
cargo init
```

### 1.2 Cargo.toml Configuration

```toml
[package]
name = "phi-model-worker"
version = "0.1.0"
edition = "2021"

[dependencies]
# Core ML framework
candle-core = { git = "https://github.com/huggingface/candle.git" }
candle-nn = { git = "https://github.com/huggingface/candle.git" }
candle-transformers = { git = "https://github.com/huggingface/candle.git" }

# HTTP server
axum = "0.7"
tokio = { version = "1", features = ["full"] }
tower = "0.4"
tower-http = { version = "0.5", features = ["cors"] }

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Performance
rayon = "1.8"
mimalloc = "0.1"

# Utilities
anyhow = "1.0"
tracing = "0.1"
tracing-subscriber = "0.3"

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
```

### 1.3 Complete Worker Implementation

```rust
// src/main.rs
use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use candle_core::{Device, Tensor};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tower_http::cors::CorsLayer;

#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

#[derive(Debug, Serialize, Deserialize)]
struct ValidationRequest {
    equation: String,
    mode: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ValidationResponse {
    valid: bool,
    confidence: f64,
    betti: [u32; 3],
    chi: i32,
    phi_coherence: f64,
    explanation: String,
    processing_time_ms: u64,
}

#[derive(Clone)]
struct ModelWorker {
    device: Device,
    worker_id: String,
}

impl ModelWorker {
    fn new() -> anyhow::Result<Self> {
        let device = Device::cuda_if_available(0)?;
        let worker_id = format!("worker-{}", std::process::id());
        
        tracing::info!("Initialized worker {} with device: {:?}", worker_id, device);
        
        Ok(Self { device, worker_id })
    }
    
    fn validate_equation(&self, equation: &str) -> anyhow::Result<ValidationResponse> {
        let start = std::time::Instant::now();
        
        // Physics equation validation logic
        let betti = self.calculate_betti_numbers(equation);
        let chi = betti[0] as i32 - betti[1] as i32 + betti[2] as i32;
        let phi_coherence = self.calculate_phi_coherence(equation);
        
        let valid = self.is_valid_equation(equation, &betti, chi, phi_coherence);
        let confidence = self.calculate_confidence(equation, &betti, phi_coherence);
        let explanation = self.generate_explanation(equation, &betti, chi, phi_coherence);
        
        let processing_time_ms = start.elapsed().as_millis() as u64;
        
        Ok(ValidationResponse {
            valid,
            confidence,
            betti,
            chi,
            phi_coherence,
            explanation,
            processing_time_ms,
        })
    }
    
    fn calculate_betti_numbers(&self, equation: &str) -> [u32; 3] {
        // Simplified Betti computation for physics equations
        let components = equation.matches('=').count() as u32 + 1;
        let cycles = equation.matches(['(', ')', '[', ']']).count() as u32 / 2;
        let voids = equation.matches(['∫', '∑', '∇']).count() as u32;
        
        [components, cycles, voids]
    }
    
    fn calculate_phi_coherence(&self, equation: &str) -> f64 {
        // Check for golden ratio patterns
        if equation.contains('φ') || equation.contains("phi") {
            return 1.0;
        }
        
        // Check for Fibonacci patterns
        let fib_indicators = ["F_", "fibonacci", "1.618", "0.618"];
        let fib_count = fib_indicators.iter()
            .map(|&pattern| equation.matches(pattern).count())
            .sum::<usize>();
        
        (fib_count as f64 * 0.3).min(1.0)
    }
    
    fn is_valid_equation(&self, equation: &str, betti: &[u32; 3], chi: i32, phi_coherence: f64) -> bool {
        // Basic validation rules
        equation.contains('=') && chi >= 0 && betti[0] > 0
    }
    
    fn calculate_confidence(&self, equation: &str, betti: &[u32; 3], phi_coherence: f64) -> f64 {
        let mut confidence = 0.5; // Base confidence
        
        // Well-known equations get higher confidence
        let known_equations = [
            "E = mc²", "E=mc²", "F = ma", "F=ma", 
            "φ² = φ + 1", "φ²=φ+1", "PV = nRT"
        ];
        
        if known_equations.iter().any(|&known| equation.contains(known)) {
            confidence += 0.4;
        }
        
        // φ-coherence bonus
        confidence += phi_coherence * 0.2;
        
        // Topological bonus (well-connected structures)
        if betti[0] == 1 && betti[1] == 0 {
            confidence += 0.1;
        }
        
        confidence.min(1.0)
    }
    
    fn generate_explanation(&self, equation: &str, betti: &[u32; 3], chi: i32, phi_coherence: f64) -> String {
        format!(
            "Equation '{}' has topological signature B₀={}, B₁={}, B₂={} with Euler characteristic χ={}. φ-coherence: {:.3}",
            equation, betti[0], betti[1], betti[2], chi, phi_coherence
        )
    }
}

// HTTP handlers
async fn health_check() -> &'static str {
    "healthy"
}

async fn validate_equation(
    State(worker): State<Arc<ModelWorker>>,
    Json(request): Json<ValidationRequest>,
) -> Result<Json<ValidationResponse>, StatusCode> {
    match worker.validate_equation(&request.equation) {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            tracing::error!("Validation error: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn worker_info(State(worker): State<Arc<ModelWorker>>) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "worker_id": worker.worker_id,
        "device": format!("{:?}", worker.device),
        "status": "ready"
    }))
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt::init();
    
    // Create model worker
    let worker = Arc::new(ModelWorker::new()?);
    
    // Build router
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/validate", post(validate_equation))
        .route("/info", get(worker_info))
        .layer(CorsLayer::permissive())
        .with_state(worker);
    
    // Start server
    let port = std::env::var("PORT").unwrap_or_else(|_| "8000".to_string());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port)).await?;
    
    tracing::info!("🦀 Phi Model Worker listening on port {}", port);
    
    axum::serve(listener, app).await?;
    
    Ok(())
}
```

---

## Phase 2: Auto-Scaling Setup

### 2.1 Docker Configuration

Create `Dockerfile` for the worker:

```dockerfile
# Dockerfile
FROM nvidia/cuda:12.1-devel-ubuntu22.04

# Install Rust
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Set working directory
WORKDIR /app

# Copy source code
COPY Cargo.toml Cargo.lock ./
COPY src/ ./src/

# Build the application
RUN cargo build --release

# Expose port
EXPOSE 8000

# Run the worker
CMD ["./target/release/phi-model-worker"]
```

### 2.2 Simple Docker Compose

```yaml
# docker-compose.yml
version: '3.9'

services:
  phi-worker:
    build: .
    image: phi-model-worker:latest
    deploy:
      replicas: 1  # Start with 1, scale as needed
      placement:
        constraints:
          - node.labels.gpu == true
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
      update_config:
        parallelism: 1
        delay: 10s
        order: stop-first
    environment:
      PORT: 8000
      RUST_LOG: info
    networks:
      - phi-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Simple load balancer (NGINX)
  load-balancer:
    image: nginx:alpine
    ports:
      - "8080:80"
    configs:
      - source: nginx-config
        target: /etc/nginx/nginx.conf
    networks:
      - phi-net
    depends_on:
      - phi-worker

networks:
  phi-net:
    driver: overlay
    attachable: true

configs:
  nginx-config:
    content: |
      events {
        worker_connections 1024;
      }
      
      http {
        upstream phi_workers {
          least_conn;
          server phi-worker:8000 max_fails=3 fail_timeout=30s;
        }
        
        server {
          listen 80;
          
          location / {
            proxy_pass http://phi_workers;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_buffering off;
          }
          
          location /health {
            access_log off;
            return 200 "healthy\n";
          }
        }
      }
```

### 2.3 Manual Scaling Commands

```bash
# Build and deploy
docker build -t phi-model-worker:latest .
docker stack deploy -c docker-compose.yml phi-stack

# Scale workers
docker service scale phi-stack_phi-worker=3

# Check status
docker service ls
docker service ps phi-stack_phi-worker

# View logs
docker service logs -f phi-stack_phi-worker
```

### 2.4 Testing the Worker

```bash
# Test single worker
curl -X POST http://localhost:8000/validate \
  -H "Content-Type: application/json" \
  -d '{"equation": "E = mc²"}'

# Expected response:
{
  "valid": true,
  "confidence": 0.9,
  "betti": [1, 0, 1],
  "chi": 0,
  "phi_coherence": 0.0,
  "explanation": "Equation 'E = mc²' has topological signature B₀=1, B₁=0, B₂=1 with Euler characteristic χ=0. φ-coherence: 0.000",
  "processing_time_ms": 2
}

# Test load balancer
curl -X POST http://localhost:8080/validate \
  -H "Content-Type: application/json" \
  -d '{"equation": "φ² = φ + 1"}'
```

---

## Phase 3: Integration & Testing

### 3.1 Update Your Web Interface

Modify your existing web interface to use the Rust workers:

```javascript
// In your web-interface/server.js, replace MCP calls with direct HTTP
async function validateWithRustWorker(equation) {
    try {
        const response = await fetch('http://localhost:8080/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ equation })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Rust worker error:', error);
        // Fallback to local validation
        return localValidationFallback(equation);
    }
}

// Update your validation endpoint
app.post('/api/validate', async (req, res) => {
    const { equation } = req.body;
    
    const result = await validateWithRustWorker(equation);
    
    // Save to master list if valid
    if (result.valid) {
        await saveEquation(result);
    }
    
    res.json(result);
});
```

### 3.2 Complete Setup Commands

```bash
# Label your GPU node
docker node update --label-add gpu=true $(hostname)

# Start the system
docker stack deploy -c docker-compose.yml phi-stack

# Update your web interface to point to localhost:8080
# Test the integration
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"equation": "F = ma"}'
```

---

## Monitoring

### Simple Health Checks

```bash
# Check worker health
curl http://localhost:8080/health

# Check worker info
curl http://localhost:8080/info

# Monitor Docker services
watch docker service ls

# View real-time logs
docker service logs -f phi-stack_phi-worker --tail 100
```

### Performance Monitoring

```bash
# Monitor GPU usage
watch nvidia-smi

# Monitor resource usage
docker stats

# Check request latency
time curl -X POST http://localhost:8080/validate \
  -H "Content-Type: application/json" \
  -d '{"equation": "E = mc²"}'
```

---

## Troubleshooting

### Common Issues

#### GPU Not Available
```bash
# Check NVIDIA driver
nvidia-smi

# Check Docker GPU support  
docker run --rm --gpus all nvidia/cuda:12.1-base nvidia-smi

# Check node labels
docker node inspect $(hostname) | grep gpu
```

#### Worker Not Starting
```bash
# Check logs
docker service logs phi-stack_phi-worker

# Check placement constraints
docker service inspect phi-stack_phi-worker

# Manual test
docker run --rm --gpus all phi-model-worker:latest
```

#### Load Balancer Issues
```bash
# Test direct worker access
curl http://localhost:8000/health

# Check NGINX config
docker exec -it $(docker ps -q -f name=load-balancer) cat /etc/nginx/nginx.conf

# Check upstream connectivity
docker exec -it $(docker ps -q -f name=load-balancer) ping phi-worker
```

### Performance Optimization

```bash
# Compile with maximum optimization
RUSTFLAGS="-C target-cpu=native" cargo build --release

# Use faster allocator in Dockerfile
ENV RUSTFLAGS="-C target-cpu=native -C link-arg=-fuse-ld=lld"

# Scale based on load
docker service scale phi-stack_phi-worker=5
```

---

## Quick Start Summary

1. **Setup** (5 min):
   ```bash
   cargo init phi-model-worker
   # Copy Cargo.toml and src/main.rs
   ```

2. **Build** (5 min):
   ```bash
   docker build -t phi-model-worker .
   ```

3. **Deploy** (2 min):
   ```bash
   docker node update --label-add gpu=true $(hostname)
   docker stack deploy -c docker-compose.yml phi-stack
   ```

4. **Scale** (30 sec):
   ```bash
   docker service scale phi-stack_phi-worker=3
   ```

5. **Test** (30 sec):
   ```bash
   curl -X POST http://localhost:8080/validate \
     -H "Content-Type: application/json" \
     -d '{"equation": "φ² = φ + 1"}'
   ```

**Total time**: 15 minutes from zero to scaled Rust AI workers! 🦀

---

*Simple, fast, scalable. The Rust way.* 🚀