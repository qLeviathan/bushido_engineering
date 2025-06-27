#!/usr/bin/env node
/**
 * Validation Node Orchestrator
 * Coordinates validation workers and manages consensus
 */

const { spawn } = require('child_process');
const WebSocket = require('ws');
const redis = require('redis');
const amqp = require('amqplib');
const { Pool } = require('pg');
require('dotenv').config();

const PHI = 1.618033988749895;
const PSI = 0.618033988749894;

class ValidationNode {
    constructor(nodeType) {
        this.nodeType = nodeType;
        this.validationResults = new Map();
        this.pythonWorker = null;
    }

    async initialize() {
        console.log(`Initializing validation node: ${this.nodeType}`);
        
        // Connect to PostgreSQL
        this.pgPool = new Pool({
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT,
            database: process.env.POSTGRES_DB,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD
        });
        
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
        
        // Set up validation result queue
        await this.setupValidationQueues();
        
        // Start Python worker
        this.startPythonWorker();
        
        // Set up WebSocket
        this.setupWebSocket();
        
        // Start consensus monitor
        this.startConsensusMonitor();
    }

    async setupValidationQueues() {
        // Queue for collecting validation results
        await this.amqpChannel.assertQueue('validation.results', { durable: true });
        
        // Consume validation results
        await this.amqpChannel.consume('validation.results', async (msg) => {
            if (msg) {
                const result = JSON.parse(msg.content.toString());
                await this.handleValidationResult(result);
                this.amqpChannel.ack(msg);
            }
        });
    }

    startPythonWorker() {
        const pythonScript = '/app/workers/validation/validation_worker.py';
        
        this.pythonWorker = spawn('python', [pythonScript, this.nodeType], {
            env: { ...process.env, WORKER_TYPE: this.nodeType }
        });

        this.pythonWorker.stdout.on('data', (data) => {
            console.log(`Validation worker: ${data}`);
        });

        this.pythonWorker.stderr.on('data', (data) => {
            console.error(`Validation worker error: ${data}`);
        });

        this.pythonWorker.on('close', (code) => {
            console.log(`Validation worker exited with code ${code}`);
            // Restart with exponential backoff
            setTimeout(() => this.startPythonWorker(), this.getFibonacciDelay() * 1000);
        });
    }

    setupWebSocket() {
        this.ws = new WebSocket(process.env.REACT_APP_WS_URL);
        
        this.ws.on('open', () => {
            console.log('Connected to UI WebSocket');
            this.ws.send(JSON.stringify({
                type: 'validator_online',
                nodeId: this.nodeType,
                timestamp: new Date().toISOString()
            }));
        });

        this.ws.on('message', (data) => {
            const message = JSON.parse(data);
            this.handleUIMessage(message);
        });
    }

    async handleValidationResult(result) {
        const equation = result.equation;
        
        // Store result by validator type
        if (!this.validationResults.has(equation)) {
            this.validationResults.set(equation, {});
        }
        
        this.validationResults.get(equation)[result.validation_type] = result;
        
        // Check if we have consensus (all three validators)
        const results = this.validationResults.get(equation);
        const validators = ['theorem', 'numerical', 'symbolic'];
        
        if (validators.every(v => v in results)) {
            await this.processConsensus(equation, results);
        }
    }

    async processConsensus(equation, results) {
        // Calculate consensus
        const validCount = Object.values(results).filter(r => r.valid).length;
        const avgConfidence = Object.values(results)
            .reduce((sum, r) => sum + r.confidence, 0) / 3;
        
        const consensus = {
            equation,
            valid: validCount >= 2,  // 2 out of 3 validators must agree
            confidence: avgConfidence,
            validators: results,
            timestamp: new Date().toISOString()
        };
        
        console.log(`Consensus for ${equation}: ${consensus.valid} (${avgConfidence})`);
        
        // Update Redis
        await this.redis.hSet('consensus:latest', {
            equation,
            valid: consensus.valid.toString(),
            confidence: avgConfidence.toString()
        });
        
        // Store in PostgreSQL if valid
        if (consensus.valid && avgConfidence > PSI) {
            await this.storeValidatedEquation(consensus);
        }
        
        // Broadcast to UI
        this.broadcastToUI('validation_complete', consensus);
        
        // Clean up
        this.validationResults.delete(equation);
    }

    async storeValidatedEquation(consensus) {
        try {
            const client = await this.pgPool.connect();
            
            // First check if equation already exists
            const existing = await client.query(
                'SELECT id FROM validated_equations WHERE equation = $1',
                [consensus.equation]
            );
            
            if (existing.rows.length === 0) {
                // Insert new equation
                await client.query(`
                    INSERT INTO validated_equations 
                    (equation, confidence, validation_type, metadata)
                    VALUES ($1, $2, $3, $4)
                `, [
                    consensus.equation,
                    consensus.confidence,
                    'consensus',
                    JSON.stringify(consensus)
                ]);
                
                console.log(`Stored new equation: ${consensus.equation}`);
            } else {
                // Update confidence if higher
                await client.query(`
                    UPDATE validated_equations 
                    SET confidence = GREATEST(confidence, $2),
                        metadata = $3,
                        updated_at = NOW()
                    WHERE equation = $1
                `, [
                    consensus.equation,
                    consensus.confidence,
                    JSON.stringify(consensus)
                ]);
            }
            
            client.release();
        } catch (err) {
            console.error('Database error:', err);
        }
    }

    async handleUIMessage(message) {
        switch (message.type) {
            case 'validate':
                await this.initiateValidation(message.equation);
                break;
            case 'get_validations':
                await this.sendValidationHistory();
                break;
        }
    }

    async initiateValidation(equation) {
        // Publish validation request
        await this.amqpChannel.publish(
            'phi.discovery',
            'validation.request',
            Buffer.from(JSON.stringify({
                equation,
                requested_by: 'ui',
                timestamp: new Date().toISOString()
            })),
            { persistent: true }
        );
    }

    broadcastToUI(type, data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, ...data }));
        }
    }

    getFibonacciDelay(n = 3) {
        const fib = [1, 1, 2, 3, 5, 8, 13, 21];
        return fib[n % fib.length];
    }

    async startConsensusMonitor() {
        // Monitor validation triangle health
        setInterval(async () => {
            const validators = ['theorem_checker', 'numerical_validator', 'symbolic_verifier'];
            const health = {};
            
            for (const validator of validators) {
                const heartbeat = await this.redis.get(`heartbeat:${validator}`);
                health[validator] = heartbeat ? 'active' : 'inactive';
            }
            
            this.broadcastToUI('validation_health', health);
        }, 5000);
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
        if (this.pgPool) {
            await this.pgPool.end();
        }
    }
}

// Main execution
if (require.main === module) {
    const nodeType = process.env.MCP_ROLE || 'theorem_checker';
    const node = new ValidationNode(nodeType);
    
    node.initialize().catch(console.error);
    
    process.on('SIGTERM', async () => {
        console.log('Shutting down validation node...');
        await node.cleanup();
        process.exit(0);
    });
}