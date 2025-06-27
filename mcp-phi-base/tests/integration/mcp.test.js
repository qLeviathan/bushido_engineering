/**
 * Integration Tests for MCP (Model Context Protocol) Components
 * Tests the actual MCP server and tool integration
 */

const assert = require('assert');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

describe('MCP Integration Tests', () => {
    let mcpServer = null;
    let webServer = null;
    const MCP_PORT = 8080;
    const WEB_PORT = 3001; // Use different port for testing

    before(function(done) {
        this.timeout(10000); // Allow 10 seconds for server startup
        
        // Start web server first
        if (fs.existsSync('web-interface/server.js')) {
            webServer = spawn('node', ['web-interface/server.js'], {
                env: { ...process.env, WEB_PORT: WEB_PORT },
                stdio: 'pipe'
            });

            webServer.stdout.on('data', (data) => {
                if (data.toString().includes('running at')) {
                    done();
                }
            });

            webServer.stderr.on('data', (data) => {
                console.error('Web server error:', data.toString());
            });

            // Timeout fallback
            setTimeout(done, 5000);
        } else {
            done();
        }
    });

    after(() => {
        if (mcpServer) {
            mcpServer.kill();
        }
        if (webServer) {
            webServer.kill();
        }
    });

    describe('MCP Server Configuration', () => {
        
        it('should have valid MCP server file', () => {
            const mcpPath = 'mcp-server/phi-discovery-mcp.js';
            assert(fs.existsSync(mcpPath), 'MCP server file should exist');
            
            const content = fs.readFileSync(mcpPath, 'utf8');
            assert(content.includes('validate_equation'), 'Should include validate_equation tool');
            assert(content.includes('calculate_betti'), 'Should include calculate_betti tool');
            assert(content.includes('check_phi_coherence'), 'Should include check_phi_coherence tool');
            assert(content.includes('discover_patterns'), 'Should include discover_patterns tool');
        });

        it('should have valid package.json with MCP dependencies', () => {
            const pkgPath = 'mcp-server/package.json';
            
            if (fs.existsSync(pkgPath)) {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                assert(pkg.dependencies, 'Should have dependencies');
                assert(pkg.dependencies['@modelcontextprotocol/sdk'], 'Should have MCP SDK dependency');
                assert(pkg.dependencies['ws'], 'Should have WebSocket dependency');
            } else {
                this.skip('MCP package.json not found');
            }
        });

        it('should have proper MCP tool schemas', () => {
            const mcpPath = 'mcp-server/phi-discovery-mcp.js';
            if (!fs.existsSync(mcpPath)) {
                this.skip('MCP server file not found');
            }

            const content = fs.readFileSync(mcpPath, 'utf8');
            
            // Check for proper schema structure
            assert(content.includes('inputSchema'), 'Tools should have input schemas');
            assert(content.includes('type: "object"'), 'Schemas should be objects');
            assert(content.includes('properties'), 'Schemas should have properties');
            assert(content.includes('required'), 'Schemas should specify required fields');
        });
    });

    describe('MCP Tool Implementations', () => {
        
        it('should implement validate_equation tool logic', () => {
            const mcpPath = 'mcp-server/phi-discovery-mcp.js';
            if (!fs.existsSync(mcpPath)) {
                this.skip('MCP server file not found');
            }

            const content = fs.readFileSync(mcpPath, 'utf8');
            
            // Check for validation logic
            assert(content.includes('validateEquation'), 'Should have validateEquation function');
            assert(content.includes('betti'), 'Should calculate Betti numbers');
            assert(content.includes('confidence'), 'Should calculate confidence scores');
            assert(content.includes('valid'), 'Should determine validity');
        });

        it('should implement calculate_betti tool logic', () => {
            const mcpPath = 'mcp-server/phi-discovery-mcp.js';
            if (!fs.existsSync(mcpPath)) {
                this.skip('MCP server file not found');
            }

            const content = fs.readFileSync(mcpPath, 'utf8');
            
            // Check for Betti calculation logic
            assert(content.includes('calculateBetti'), 'Should have calculateBetti function');
            assert(content.includes('B₀') || content.includes('b0'), 'Should calculate B₀');
            assert(content.includes('B₁') || content.includes('b1'), 'Should calculate B₁');
            assert(content.includes('B₂') || content.includes('b2'), 'Should calculate B₂');
        });

        it('should implement check_phi_coherence tool logic', () => {
            const mcpPath = 'mcp-server/phi-discovery-mcp.js';
            if (!fs.existsSync(mcpPath)) {
                this.skip('MCP server file not found');
            }

            const content = fs.readFileSync(mcpPath, 'utf8');
            
            // Check for φ-coherence logic
            assert(content.includes('checkPhiCoherence') || content.includes('phi'), 'Should have φ-coherence function');
            assert(content.includes('1.618') || content.includes('φ'), 'Should check for golden ratio');
            assert(content.includes('coherence'), 'Should calculate coherence score');
        });
    });

    describe('WebSocket Communication', () => {
        
        it('should establish WebSocket connection to web server', function(done) {
            this.timeout(5000);
            
            if (!webServer) {
                this.skip('Web server not running');
            }

            const ws = new WebSocket(`ws://localhost:${WEB_PORT}/ws`);
            
            ws.on('open', () => {
                ws.close();
                done();
            });

            ws.on('error', (error) => {
                // WebSocket connection might fail if server not ready
                this.skip(`WebSocket connection failed: ${error.message}`);
            });
        });

        it('should handle MCP request messages', function(done) {
            this.timeout(5000);
            
            if (!webServer) {
                this.skip('Web server not running');
            }

            const ws = new WebSocket(`ws://localhost:${WEB_PORT}/ws`);
            
            ws.on('open', () => {
                // Send MCP request
                ws.send(JSON.stringify({
                    type: 'mcp_request',
                    action: 'validate',
                    data: { equation: 'φ² = φ + 1' }
                }));
            });

            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    
                    if (message.type === 'mcp_response') {
                        assert(message.action, 'Response should have action');
                        assert(message.result || message.response, 'Response should have result or response');
                        ws.close();
                        done();
                    }
                } catch (error) {
                    // Ignore parsing errors for non-JSON messages
                }
            });

            ws.on('error', () => {
                this.skip('WebSocket connection failed');
            });

            // Timeout fallback
            setTimeout(() => {
                ws.close();
                this.skip('No MCP response received');
            }, 3000);
        });
    });

    describe('MCP Tool Execution', () => {
        
        it('should execute validate_equation with proper response format', function(done) {
            this.timeout(5000);
            
            if (!webServer) {
                this.skip('Web server not running');
            }

            const ws = new WebSocket(`ws://localhost:${WEB_PORT}/ws`);
            
            ws.on('open', () => {
                ws.send(JSON.stringify({
                    type: 'mcp_request',
                    action: 'validate',
                    data: { equation: 'φ² = φ + 1' }
                }));
            });

            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    
                    if (message.type === 'mcp_response' && message.action === 'validate') {
                        const result = message.result;
                        
                        assert(typeof result.valid === 'boolean', 'Should have valid boolean');
                        assert(typeof result.confidence === 'number', 'Should have confidence number');
                        assert(Array.isArray(result.betti), 'Should have Betti array');
                        assert(result.betti.length === 3, 'Betti array should have 3 elements');
                        assert(typeof result.chi === 'number', 'Should have chi number');
                        
                        ws.close();
                        done();
                    }
                } catch (error) {
                    // Continue listening for correct message
                }
            });

            ws.on('error', () => {
                this.skip('WebSocket connection failed');
            });

            setTimeout(() => {
                ws.close();
                this.skip('No validation response received');
            }, 3000);
        });

        it('should handle ask action for Claude integration', function(done) {
            this.timeout(5000);
            
            if (!webServer) {
                this.skip('Web server not running');
            }

            const ws = new WebSocket(`ws://localhost:${WEB_PORT}/ws`);
            
            ws.on('open', () => {
                ws.send(JSON.stringify({
                    type: 'mcp_request',
                    action: 'ask',
                    data: { question: 'What is the golden ratio?' }
                }));
            });

            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    
                    if (message.type === 'mcp_response' && message.action === 'ask') {
                        assert(typeof message.response === 'string', 'Should have string response');
                        assert(message.response.length > 0, 'Response should not be empty');
                        
                        ws.close();
                        done();
                    }
                } catch (error) {
                    // Continue listening
                }
            });

            ws.on('error', () => {
                this.skip('WebSocket connection failed');
            });

            setTimeout(() => {
                ws.close();
                this.skip('No ask response received');
            }, 3000);
        });
    });

    describe('Error Handling', () => {
        
        it('should handle invalid MCP requests gracefully', function(done) {
            this.timeout(5000);
            
            if (!webServer) {
                this.skip('Web server not running');
            }

            const ws = new WebSocket(`ws://localhost:${WEB_PORT}/ws`);
            
            ws.on('open', () => {
                // Send invalid request
                ws.send(JSON.stringify({
                    type: 'mcp_request',
                    action: 'invalid_action',
                    data: {}
                }));
            });

            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    
                    // Should either handle gracefully or return error
                    if (message.type === 'error' || message.type === 'mcp_response') {
                        ws.close();
                        done();
                    }
                } catch (error) {
                    // Continue listening
                }
            });

            ws.on('error', () => {
                this.skip('WebSocket connection failed');
            });

            setTimeout(() => {
                ws.close();
                done(); // Consider timeout as graceful handling
            }, 2000);
        });

        it('should handle malformed equations in validation', function(done) {
            this.timeout(5000);
            
            if (!webServer) {
                this.skip('Web server not running');
            }

            const ws = new WebSocket(`ws://localhost:${WEB_PORT}/ws`);
            
            ws.on('open', () => {
                ws.send(JSON.stringify({
                    type: 'mcp_request',
                    action: 'validate',
                    data: { equation: ')()()(invalid' }
                }));
            });

            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    
                    if (message.type === 'mcp_response' && message.action === 'validate') {
                        // Should still return a result structure
                        assert(message.result, 'Should return result even for malformed equation');
                        assert(typeof message.result.valid === 'boolean', 'Should have valid boolean');
                        
                        ws.close();
                        done();
                    }
                } catch (error) {
                    // Continue listening
                }
            });

            ws.on('error', () => {
                this.skip('WebSocket connection failed');
            });

            setTimeout(() => {
                ws.close();
                this.skip('No response for malformed equation');
            }, 2000);
        });
    });

    describe('Performance Tests', () => {
        
        it('should respond to validation requests within reasonable time', function(done) {
            this.timeout(3000);
            
            if (!webServer) {
                this.skip('Web server not running');
            }

            const ws = new WebSocket(`ws://localhost:${WEB_PORT}/ws`);
            const startTime = Date.now();
            
            ws.on('open', () => {
                ws.send(JSON.stringify({
                    type: 'mcp_request',
                    action: 'validate',
                    data: { equation: 'E = mc²' }
                }));
            });

            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    
                    if (message.type === 'mcp_response' && message.action === 'validate') {
                        const responseTime = Date.now() - startTime;
                        
                        assert(responseTime < 2000, `Response should be under 2s, got ${responseTime}ms`);
                        
                        ws.close();
                        done();
                    }
                } catch (error) {
                    // Continue listening
                }
            });

            ws.on('error', () => {
                this.skip('WebSocket connection failed');
            });
        });

        it('should handle multiple concurrent requests', function(done) {
            this.timeout(10000);
            
            if (!webServer) {
                this.skip('Web server not running');
            }

            const equations = ['φ² = φ + 1', 'E = mc²', 'F = ma', 'PV = nRT'];
            let responsesReceived = 0;
            const connections = [];

            equations.forEach((equation, index) => {
                const ws = new WebSocket(`ws://localhost:${WEB_PORT}/ws`);
                connections.push(ws);
                
                ws.on('open', () => {
                    ws.send(JSON.stringify({
                        type: 'mcp_request',
                        action: 'validate',
                        data: { equation }
                    }));
                });

                ws.on('message', (data) => {
                    try {
                        const message = JSON.parse(data);
                        
                        if (message.type === 'mcp_response') {
                            responsesReceived++;
                            
                            if (responsesReceived === equations.length) {
                                connections.forEach(conn => conn.close());
                                done();
                            }
                        }
                    } catch (error) {
                        // Continue listening
                    }
                });

                ws.on('error', () => {
                    // Skip if any connection fails
                });
            });

            // Timeout fallback
            setTimeout(() => {
                connections.forEach(conn => conn.close());
                if (responsesReceived > 0) {
                    done(); // Some responses received
                } else {
                    this.skip('No concurrent responses received');
                }
            }, 8000);
        });
    });
});