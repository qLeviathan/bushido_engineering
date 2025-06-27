#!/usr/bin/env node
/**
 * Discovery Node Orchestrator
 * Bridges Python workers with MCP protocol
 */

const { spawn } = require('child_process');
const WebSocket = require('ws');
const redis = require('redis');
const amqp = require('amqplib');
require('dotenv').config();

const PHI = 1.618033988749895;
const PSI = 0.618033988749894;

class DiscoveryNode {
    constructor(nodeType) {
        this.nodeType = nodeType;
        this.phase = this.getPhase(nodeType);
        this.connections = {};
        this.pythonWorker = null;
    }

    getPhase(nodeType) {
        const phases = {
            'pattern_recognizer': 'past',
            'equation_generator': 'present',
            'phase_optimizer': 'future'
        };
        return phases[nodeType] || 'present';
    }

    async initialize() {
        console.log(`Initializing discovery node: ${this.nodeType}`);
        
        // Connect to Redis
        this.redis = redis.createClient({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD
        });
        
        await this.redis.connect();
        
        // Connect to RabbitMQ
        const amqpUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}${process.env.RABBITMQ_VHOST}`;
        this.amqpConnection = await amqp.connect(amqpUrl);
        this.amqpChannel = await this.amqpConnection.createChannel();
        
        // Start Python worker
        this.startPythonWorker();
        
        // Set up WebSocket for UI communication
        this.setupWebSocket();
        
        // Start φ-timed heartbeat
        this.startHeartbeat();
    }

    startPythonWorker() {
        const pythonScript = '/app/workers/discovery/discovery_worker.py';
        
        this.pythonWorker = spawn('python', [pythonScript, this.nodeType], {
            env: { ...process.env, WORKER_TYPE: this.nodeType }
        });

        this.pythonWorker.stdout.on('data', (data) => {
            console.log(`Python worker: ${data}`);
            this.broadcastToUI('log', { message: data.toString() });
        });

        this.pythonWorker.stderr.on('data', (data) => {
            console.error(`Python worker error: ${data}`);
        });

        this.pythonWorker.on('close', (code) => {
            console.log(`Python worker exited with code ${code}`);
            // Restart after Fibonacci delay
            setTimeout(() => this.startPythonWorker(), this.getFibonacciDelay() * 1000);
        });
    }

    setupWebSocket() {
        this.ws = new WebSocket(process.env.REACT_APP_WS_URL);
        
        this.ws.on('open', () => {
            console.log('Connected to UI WebSocket');
            this.ws.send(JSON.stringify({
                type: 'node_online',
                nodeId: this.nodeType,
                phase: this.phase,
                timestamp: new Date().toISOString()
            }));
        });

        this.ws.on('message', (data) => {
            const message = JSON.parse(data);
            this.handleUIMessage(message);
        });

        this.ws.on('error', (err) => {
            console.error('WebSocket error:', err);
        });
    }

    async handleUIMessage(message) {
        switch (message.type) {
            case 'discover':
                await this.initiateDiscovery(message.equation);
                break;
            case 'get_status':
                await this.sendStatus();
                break;
            case 'set_phase':
                this.phase = message.phase;
                break;
        }
    }

    async initiateDiscovery(equation) {
        const discovery = {
            equation,
            nodeType: this.nodeType,
            phase: this.phase,
            timestamp: new Date().toISOString(),
            betti: this.computeBetti(equation)
        };

        // Publish to RabbitMQ
        await this.amqpChannel.assertExchange('phi.discovery', 'topic', { durable: true });
        await this.amqpChannel.publish(
            'phi.discovery',
            `discovery.${this.phase}.init`,
            Buffer.from(JSON.stringify(discovery)),
            { persistent: true }
        );

        // Update Redis state
        await this.redis.hSet('current_discovery', {
            equation,
            phase: this.phase,
            node: this.nodeType
        });
    }

    computeBetti(equation) {
        const b0 = (equation.match(/=/g) || []).length + 1;
        const b1 = Math.floor((equation.match(/[()]/g) || []).length / 2);
        const b2 = (equation.match(/∫/g) || []).length;
        return [b0, b1, b2];
    }

    async sendStatus() {
        const status = {
            type: 'node_status',
            nodeId: this.nodeType,
            phase: this.phase,
            health: 'active',
            lastDiscovery: await this.redis.hGetAll('last_discovery'),
            chi: await this.redis.get('chi_current') || '1',
            timestamp: new Date().toISOString()
        };

        this.broadcastToUI('status', status);
    }

    broadcastToUI(type, data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, ...data }));
        }
    }

    getFibonacciDelay(n = 5) {
        const fib = [1, 1, 2, 3, 5, 8, 13, 21];
        return fib[n % fib.length];
    }

    async startHeartbeat() {
        setInterval(async () => {
            const heartbeat = {
                node: this.nodeType,
                phase: this.phase,
                timestamp: Date.now()
            };
            
            await this.redis.setEx(
                `heartbeat:${this.nodeType}`,
                60,
                JSON.stringify(heartbeat)
            );
            
            // Check phase lock
            const phaseLock = await this.checkPhaseLock();
            if (phaseLock > PSI) {
                this.broadcastToUI('phase_lock', { coherence: phaseLock });
            }
        }, PHI * 1000);
    }

    async checkPhaseLock() {
        const keys = await this.redis.keys('heartbeat:*');
        if (keys.length < 2) return 0;

        const timestamps = [];
        for (const key of keys) {
            const data = await this.redis.get(key);
            if (data) {
                timestamps.push(JSON.parse(data).timestamp);
            }
        }

        // Calculate phase coherence
        const mean = timestamps.reduce((a, b) => a + b) / timestamps.length;
        const variance = timestamps.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / timestamps.length;
        const stdDev = Math.sqrt(variance);
        
        return Math.max(0, 1 - (stdDev / (PSI * 1000)));
    }

    async cleanup() {
        if (this.pythonWorker) {
            this.pythonWorker.kill();
        }
        if (this.ws) {
            this.ws.close();
        }
        if (this.amqpConnection) {
            await this.amqpConnection.close();
        }
        if (this.redis) {
            await this.redis.quit();
        }
    }
}

// Main execution
if (require.main === module) {
    const nodeType = process.env.MCP_ROLE || 'pattern_recognizer';
    const node = new DiscoveryNode(nodeType);
    
    node.initialize().catch(console.error);
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
        console.log('Shutting down gracefully...');
        await node.cleanup();
        process.exit(0);
    });
}