#!/usr/bin/env node
/**
 * Web Interface Server for φ-Discovery
 * Serves the UI and bridges to the MCP backend
 */

const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.WEB_PORT || 3000;

// Middleware for JSON parsing
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// In-memory storage for validated equations
const masterEquations = new Map();
let equationIdCounter = 1;

// Proxy API requests to backend services
app.use('/api/rabbitmq', createProxyMiddleware({
    target: `http://localhost:15672`,
    changeOrigin: true,
    auth: `${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}`
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Get all stored equations
app.get('/api/equations', (req, res) => {
    const equations = Array.from(masterEquations.values())
        .sort((a, b) => b.timestamp - a.timestamp);
    res.json({ equations, count: equations.length });
});

// Save a validated equation
app.post('/api/equations', (req, res) => {
    const { equation, betti, chi, confidence, phiCoherence, archetype } = req.body;
    
    if (!equation) {
        return res.status(400).json({ error: 'Equation is required' });
    }
    
    const id = equationIdCounter++;
    const equationData = {
        id,
        equation,
        betti: betti || [0, 0, 0],
        chi: chi || 0,
        confidence: confidence || 0,
        phiCoherence: phiCoherence || 0.618,
        archetype: archetype || 'unknown',
        timestamp: new Date().toISOString(),
        validatedAt: new Date().toISOString()
    };
    
    masterEquations.set(id, equationData);
    
    // Broadcast to all WebSocket clients
    broadcast({
        type: 'equation_stored',
        equation: equationData
    });
    
    res.json({ success: true, equation: equationData });
});

// Delete an equation
app.delete('/api/equations/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (masterEquations.has(id)) {
        masterEquations.delete(id);
        
        broadcast({
            type: 'equation_deleted',
            id
        });
        
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Equation not found' });
    }
});

// Search equations
app.get('/api/equations/search', (req, res) => {
    const { query, archetype, minConfidence } = req.query;
    let results = Array.from(masterEquations.values());
    
    if (query) {
        results = results.filter(eq => 
            eq.equation.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    if (archetype) {
        results = results.filter(eq => eq.archetype === archetype);
    }
    
    if (minConfidence) {
        results = results.filter(eq => eq.confidence >= parseFloat(minConfidence));
    }
    
    res.json({ equations: results, count: results.length });
});

// Start HTTP server
const server = app.listen(PORT, () => {
    console.log(`φ-Discovery Web Interface running at http://localhost:${PORT}`);
});

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ server, path: '/ws' });

// Broadcast to all connected clients
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    // Send initial status
    ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to φ-Discovery backend'
    }));
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleClientMessage(ws, data);
        } catch (error) {
            console.error('Invalid message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Handle messages from web clients
async function handleClientMessage(ws, data) {
    switch (data.type) {
        case 'start':
            // Start the discovery system
            startDiscoverySystem(ws);
            break;
            
        case 'stop':
            // Stop the discovery system
            stopDiscoverySystem(ws);
            break;
            
        case 'validate':
            // Validate an equation
            validateEquation(ws, data.equation);
            break;
            
        case 'get_status':
            // Get system status
            getSystemStatus(ws);
            break;
            
        case 'mcp_request':
            // Handle MCP requests
            handleMCPRequest(ws, data);
            break;
            
        case 'equation_selected':
            // Handle equation selection for AI context
            handleEquationSelection(ws, data);
            break;
            
        case 'chat_message':
            // Handle chat messages with context
            handleChatMessage(ws, data);
            break;
            
        case 'set_context':
            // Set equation context for AI
            handleSetContext(ws, data);
            break;
            
        case 'save_equation':
            // Save equation to master list
            saveEquationToMaster(ws, data);
            break;
            
        case 'get_equations':
            // Get all stored equations
            sendStoredEquations(ws);
            break;
    }
}

// System control functions
async function startDiscoverySystem(ws) {
    try {
        // In a real implementation, this would start Docker services
        // For now, simulate the response
        broadcast({
            type: 'log',
            message: '[System] Starting φ-Discovery services...'
        });
        
        setTimeout(() => {
            broadcast({
                type: 'status',
                status: 'running',
                message: 'System Running'
            });
            
            // Start sending mock discoveries
            startMockDiscoveries();
        }, 2000);
        
    } catch (error) {
        ws.send(JSON.stringify({
            type: 'error',
            message: error.message
        }));
    }
}

async function stopDiscoverySystem(ws) {
    broadcast({
        type: 'status',
        status: 'stopped',
        message: 'System Stopped'
    });
    
    stopMockDiscoveries();
}

// Mock discovery generation
let discoveryInterval;

function startMockDiscoveries() {
    const equations = [
        'φ² = φ + 1',
        'E = mc²',
        '∇²ψ + k²ψ = 0',
        'χ = B₀ - B₁ + B₂',
        'F = ma',
        'PV = nRT',
        'S = k ln(Ω)'
    ];
    
    discoveryInterval = setInterval(() => {
        const equation = equations[Math.floor(Math.random() * equations.length)];
        const confidence = Math.random() * 0.3 + 0.7;
        
        broadcast({
            type: 'discovery',
            equation,
            result: {
                valid: confidence > 0.618,
                confidence,
                betti: [
                    Math.floor(Math.random() * 3) + 1,
                    Math.floor(Math.random() * 5),
                    Math.floor(Math.random() * 2)
                ],
                chi: 1,
                timestamp: new Date().toISOString()
            }
        });
        
        // Update metrics
        broadcast({
            type: 'metrics',
            phaseLock: Math.random() * 0.5 + 0.5,
            phiCoherence: 0.618 + Math.random() * 0.2
        });
        
    }, 5000);
}

function stopMockDiscoveries() {
    if (discoveryInterval) {
        clearInterval(discoveryInterval);
        discoveryInterval = null;
    }
}

async function validateEquation(ws, equation) {
    // Calculate Betti numbers
    const b0 = (equation.match(/=/g) || []).length + 1;
    const b1 = Math.floor((equation.match(/[()]/g) || []).length / 2);
    const b2 = (equation.match(/∫/g) || []).length;
    const betti = [b0, b1, b2];
    const chi = b0 - b1 + b2;
    
    // Simulate validation
    const confidence = Math.random() * 0.3 + 0.7;
    
    ws.send(JSON.stringify({
        type: 'discovery',
        equation,
        result: {
            valid: confidence > 0.618,
            confidence,
            betti,
            chi,
            timestamp: new Date().toISOString()
        }
    }));
}

// Handle MCP requests
async function handleMCPRequest(ws, data) {
    const { action, data: requestData } = data;
    
    switch (action) {
        case 'validate':
            // Validate equation through MCP
            const result = await validateThroughMCP(requestData.equation);
            ws.send(JSON.stringify({
                type: 'mcp_response',
                action: 'validate',
                result
            }));
            break;
            
        case 'ask':
            // Send question to Claude through MCP
            // In a real implementation, this would connect to Claude MCP server
            // For now, we'll return a helpful message
            ws.send(JSON.stringify({
                type: 'mcp_response',
                action: 'ask',
                response: `To process this question through Claude MCP:

1. Ensure Claude is running with MCP servers enabled
2. The MCP server should be configured to connect to this discovery system
3. Questions will be processed through the φ-Discovery MCP integration

Your question: "${requestData.question}"

For now, you can use the equation validator to test mathematical expressions.`
            }));
            break;
    }
}

// Validate through MCP (simulated for now)
async function validateThroughMCP(equation) {
    // Calculate Betti numbers
    const b0 = (equation.match(/=/g) || []).length + 1;
    const b1 = Math.floor((equation.match(/[()]/g) || []).length / 2);
    const b2 = (equation.match(/∫/g) || []).length;
    const betti = [b0, b1, b2];
    const chi = b0 - b1 + b2;
    
    // Check for golden ratio presence
    const hasGoldenRatio = equation.includes('φ') || equation.includes('1.618');
    const confidence = hasGoldenRatio ? 0.9 + Math.random() * 0.1 : Math.random() * 0.3 + 0.7;
    
    return {
        equation,
        valid: confidence > 0.618,
        confidence,
        betti,
        chi,
        phiCoherence: 0.618 + Math.random() * 0.2,
        timestamp: new Date().toISOString()
    };
}

// Handle equation selection
function handleEquationSelection(ws, data) {
    const { equation, betti, archetype } = data;
    
    // Store context for this WebSocket connection
    ws.equationContext = {
        equation,
        betti,
        archetype,
        timestamp: new Date().toISOString()
    };
    
    // Send acknowledgment
    ws.send(JSON.stringify({
        type: 'context_set',
        equation,
        message: `Context set to ${equation}. Ask me anything about this equation!`
    }));
}

// Handle chat messages with context
function handleChatMessage(ws, data) {
    const { message, context, mode } = data;
    
    // Build AI prompt with context
    let aiPrompt = '';
    
    if (context) {
        aiPrompt = `Context: The user is exploring the equation "${context.equation}" (${context.data.name}).
`;
        aiPrompt += `Topological properties: Betti numbers [${context.data.betti.join(', ')}], which means:
`;
        aiPrompt += `- B₀ = ${context.data.betti[0]} (connected components)
`;
        aiPrompt += `- B₁ = ${context.data.betti[1]} (cycles/holes)
`;
        aiPrompt += `- B₂ = ${context.data.betti[2]} (voids/cavities)

`;
        
        if (mode === 'learn') {
            aiPrompt += 'Mode: Learning - Provide educational explanations and connect concepts.

';
        } else if (mode === 'solve') {
            aiPrompt += 'Mode: Problem Solving - Help solve problems step by step.

';
        }
    }
    
    aiPrompt += `User question: ${message}`;
    
    // Simulate AI response (in production, this would call Claude API)
    const response = generateAIResponse(aiPrompt, context);
    
    ws.send(JSON.stringify({
        type: 'ai_response',
        response
    }));
}

// Generate AI response (simulation)
function generateAIResponse(prompt, context) {
    if (!context) {
        return "I'd be happy to help! Please select an equation from the mind map first, or ask me any physics question.";
    }
    
    const equation = context.equation;
    
    // Provide contextual responses based on equation
    const responses = {
        'E = mc²': `This is Einstein's mass-energy equivalence equation. The Betti numbers show it has a simple connected structure (B₀=1) with a void (B₂=1), representing the deep unity between mass and energy. Would you like me to explain the derivation or explore its applications?`,
        
        'F = ma': `Newton's Second Law describes the fundamental relationship between force, mass, and acceleration. Its simple topology (B₀=1, others 0) reflects its direct, linear nature. I can help you solve problems using this equation or explore its vector form.`,
        
        'E = hf': `The Planck-Einstein relation bridges classical and quantum physics. The cycle in its topology (B₁=1) represents the wave-particle duality. Let me know if you'd like to explore photon energy calculations or the photoelectric effect.`,
        
        'φ² = φ + 1': `The golden ratio equation has the richest topology (all Betti numbers = 1), reflecting its self-referential nature and appearances throughout mathematics and nature. I can show you its derivation or explore Fibonacci connections.`,
        
        'PV = nRT': `The ideal gas law connects pressure, volume, temperature, and amount of gas. Its simple topology reflects the direct proportionality relationships. I can help with gas calculations or explain the kinetic theory derivation.`,
        
        '∇·E = ρ/ε₀': `Gauss's law for electric fields shows how charge creates electric flux. The cycle (B₁=1) represents the closed surface integral nature of the law. Would you like to explore field calculations or see how it fits into Maxwell's equations?`
    };
    
    return responses[equation] || `Let me help you understand ${equation}. This equation has interesting topological properties that reflect its mathematical structure. What specific aspect would you like to explore?`;
}

// Handle setting context
function handleSetContext(ws, data) {
    ws.equationContext = data;
    
    ws.send(JSON.stringify({
        type: 'context_updated',
        equation: data.equation,
        message: `I'm now focused on ${data.equation}. Feel free to ask about its physics, mathematics, or applications!`
    }));
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down φ-Discovery web server...');
    stopMockDiscoveries();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});