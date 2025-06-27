#!/usr/bin/env node
/**
 * φ-Discovery System Test Runner
 * Comprehensive testing and validation framework
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const WebSocket = require('ws');

class PhiDiscoveryTester {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            categories: {}
        };
        this.verbose = process.argv.includes('--verbose');
        this.quick = process.argv.includes('--quick');
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colors = {
            info: '\x1b[36m',     // Cyan
            success: '\x1b[32m',  // Green
            error: '\x1b[31m',    // Red
            warning: '\x1b[33m',  // Yellow
            reset: '\x1b[0m'
        };
        
        const color = colors[type] || colors.info;
        console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
    }

    async runTest(name, testFn, category = 'general') {
        this.results.total++;
        
        if (!this.results.categories[category]) {
            this.results.categories[category] = { passed: 0, failed: 0, skipped: 0 };
        }

        try {
            this.log(`🧪 Testing: ${name}`, 'info');
            const startTime = Date.now();
            
            const result = await testFn();
            const duration = Date.now() - startTime;
            
            if (result === 'skip') {
                this.results.skipped++;
                this.results.categories[category].skipped++;
                this.log(`⏭️  SKIPPED: ${name} (${duration}ms)`, 'warning');
            } else if (result === false) {
                throw new Error('Test returned false');
            } else {
                this.results.passed++;
                this.results.categories[category].passed++;
                this.log(`✅ PASSED: ${name} (${duration}ms)`, 'success');
            }
        } catch (error) {
            this.results.failed++;
            this.results.categories[category].failed++;
            this.log(`❌ FAILED: ${name} - ${error.message}`, 'error');
            if (this.verbose) {
                console.error(error);
            }
        }
    }

    // File System Tests
    async testFileStructure() {
        const requiredFiles = [
            'package.json',
            'docker-compose.betti.yml',
            'web-interface/index.html',
            'web-interface/server.js',
            'mcp-server/phi-discovery-mcp.js',
            'workers/discovery/discovery_worker.py',
            'workers/validation/validation_worker.py',
            'start-phi-discovery.sh',
            'stop-phi-discovery.sh'
        ];

        for (const file of requiredFiles) {
            await this.runTest(`File exists: ${file}`, () => {
                return fs.existsSync(file);
            }, 'filesystem');
        }
    }

    // Node.js Dependencies Tests
    async testNodeDependencies() {
        await this.runTest('package.json is valid JSON', () => {
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            return pkg.name && pkg.dependencies;
        }, 'dependencies');

        await this.runTest('Node modules installed', () => {
            return fs.existsSync('node_modules');
        }, 'dependencies');

        const webInterfacePkg = 'web-interface/package.json';
        if (fs.existsSync(webInterfacePkg)) {
            await this.runTest('Web interface dependencies', () => {
                return fs.existsSync('web-interface/node_modules');
            }, 'dependencies');
        }

        const mcpServerPkg = 'mcp-server/package.json';
        if (fs.existsSync(mcpServerPkg)) {
            await this.runTest('MCP server dependencies', () => {
                return fs.existsSync('mcp-server/node_modules');
            }, 'dependencies');
        }
    }

    // Docker Tests
    async testDockerSetup() {
        await this.runTest('Docker is installed', () => {
            try {
                execSync('docker --version', { stdio: 'pipe' });
                return true;
            } catch {
                return false;
            }
        }, 'docker');

        await this.runTest('Docker is running', () => {
            try {
                execSync('docker info', { stdio: 'pipe' });
                return true;
            } catch {
                return false;
            }
        }, 'docker');

        await this.runTest('Docker Compose files valid', async () => {
            try {
                execSync('docker-compose -f docker-compose.betti.yml config', { stdio: 'pipe' });
                return true;
            } catch {
                return false;
            }
        }, 'docker');

        await this.runTest('Docker Swarm available', () => {
            try {
                const output = execSync('docker info --format "{{.Swarm.LocalNodeState}}"', { 
                    encoding: 'utf8', 
                    stdio: 'pipe' 
                });
                return output.trim() !== 'inactive';
            } catch {
                return 'skip'; // Swarm not required for basic testing
            }
        }, 'docker');
    }

    // Python Environment Tests
    async testPythonEnvironment() {
        await this.runTest('Python 3 is available', () => {
            try {
                execSync('python3 --version', { stdio: 'pipe' });
                return true;
            } catch {
                try {
                    execSync('python --version', { stdio: 'pipe' });
                    return true;
                } catch {
                    return false;
                }
            }
        }, 'python');

        const workerDirs = ['workers/discovery', 'workers/validation'];
        for (const dir of workerDirs) {
            if (fs.existsSync(`${dir}/requirements.txt`)) {
                await this.runTest(`Python requirements readable: ${dir}`, () => {
                    const reqs = fs.readFileSync(`${dir}/requirements.txt`, 'utf8');
                    return reqs.length > 0 && reqs.includes('numpy');
                }, 'python');
            }
        }
    }

    // Mathematical Algorithm Tests
    async testMathematicalFunctions() {
        // Test Betti number calculation
        await this.runTest('Betti number calculation', () => {
            const equation = 'φ² = φ + 1';
            // Simple heuristic: count components, cycles, voids
            const b0 = (equation.match(/=/g) || []).length + 1;
            const b1 = Math.floor((equation.match(/[()]/g) || []).length / 2);
            const b2 = (equation.match(/∫/g) || []).length;
            const chi = b0 - b1 + b2;
            
            return b0 === 1 && b1 === 0 && b2 === 0 && chi === 1;
        }, 'mathematics');

        await this.runTest('Golden ratio validation', () => {
            const phi = 1.618033988749895;
            const phi_squared = phi * phi;
            const phi_plus_one = phi + 1;
            const difference = Math.abs(phi_squared - phi_plus_one);
            
            return difference < 0.000001; // φ² = φ + 1
        }, 'mathematics');

        await this.runTest('Fibonacci sequence generation', () => {
            const fib = (n) => n <= 1 ? n : fib(n - 1) + fib(n - 2);
            const sequence = [0, 1, 1, 2, 3, 5, 8, 13, 21];
            
            for (let i = 0; i < sequence.length; i++) {
                if (fib(i) !== sequence[i]) return false;
            }
            return true;
        }, 'mathematics');
    }

    // Web Interface Tests
    async testWebInterface() {
        const indexPath = 'web-interface/index.html';
        
        await this.runTest('Web interface HTML is valid', () => {
            if (!fs.existsSync(indexPath)) return false;
            
            const html = fs.readFileSync(indexPath, 'utf8');
            return html.includes('<!DOCTYPE html>') && 
                   html.includes('φ-Discovery') &&
                   html.includes('</html>');
        }, 'web');

        await this.runTest('Server.js has required functions', () => {
            const serverPath = 'web-interface/server.js';
            if (!fs.existsSync(serverPath)) return false;
            
            const server = fs.readFileSync(serverPath, 'utf8');
            return server.includes('WebSocket') &&
                   server.includes('express') &&
                   server.includes('handleClientMessage');
        }, 'web');

        // Test if web server can start (quick test)
        if (!this.quick) {
            await this.runTest('Web server can start', async () => {
                return new Promise((resolve) => {
                    const server = spawn('node', ['web-interface/server.js'], {
                        stdio: 'pipe',
                        env: { ...process.env, WEB_PORT: '3001' } // Use different port
                    });

                    const timeout = setTimeout(() => {
                        server.kill();
                        resolve(false);
                    }, 5000);

                    server.stdout.on('data', (data) => {
                        if (data.toString().includes('running at')) {
                            clearTimeout(timeout);
                            server.kill();
                            resolve(true);
                        }
                    });

                    server.on('error', () => {
                        clearTimeout(timeout);
                        resolve(false);
                    });
                });
            }, 'web');
        }
    }

    // MCP Server Tests
    async testMCPServer() {
        await this.runTest('MCP server file exists', () => {
            return fs.existsSync('mcp-server/phi-discovery-mcp.js');
        }, 'mcp');

        await this.runTest('MCP server has required tools', () => {
            const mcpPath = 'mcp-server/phi-discovery-mcp.js';
            if (!fs.existsSync(mcpPath)) return false;
            
            const mcp = fs.readFileSync(mcpPath, 'utf8');
            return mcp.includes('validate_equation') &&
                   mcp.includes('calculate_betti') &&
                   mcp.includes('check_phi_coherence') &&
                   mcp.includes('discover_patterns');
        }, 'mcp');

        await this.runTest('MCP package.json is valid', () => {
            const pkgPath = 'mcp-server/package.json';
            if (!fs.existsSync(pkgPath)) return false;
            
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            return pkg.dependencies && 
                   pkg.dependencies['@modelcontextprotocol/sdk'];
        }, 'mcp');
    }

    // System Integration Tests
    async testSystemIntegration() {
        await this.runTest('Scripts are executable', () => {
            try {
                const stats = fs.statSync('start-phi-discovery.sh');
                return (stats.mode & parseInt('111', 8)) !== 0; // Check execute permissions
            } catch {
                return false;
            }
        }, 'integration');

        await this.runTest('Environment template exists', () => {
            return fs.existsSync('.env') || fs.existsSync('.env.example');
        }, 'integration');

        // Test WebSocket connection capability
        if (!this.quick) {
            await this.runTest('WebSocket server can be created', async () => {
                return new Promise((resolve) => {
                    try {
                        const wss = new WebSocket.Server({ port: 8765 });
                        wss.on('listening', () => {
                            wss.close();
                            resolve(true);
                        });
                        wss.on('error', () => {
                            resolve(false);
                        });
                    } catch {
                        resolve(false);
                    }
                });
            }, 'integration');
        }
    }

    // Performance Tests
    async testPerformance() {
        await this.runTest('File sizes are reasonable', () => {
            const checkFileSize = (path, maxSizeMB) => {
                if (!fs.existsSync(path)) return true;
                const stats = fs.statSync(path);
                return stats.size < maxSizeMB * 1024 * 1024;
            };

            return checkFileSize('web-interface/index.html', 1) &&
                   checkFileSize('mcp-server/phi-discovery-mcp.js', 1) &&
                   checkFileSize('workers/discovery/discovery_worker.py', 1);
        }, 'performance');

        await this.runTest('Startup scripts execute quickly', async () => {
            const start = Date.now();
            try {
                execSync('bash -n start-phi-discovery.sh', { stdio: 'pipe' });
                const duration = Date.now() - start;
                return duration < 1000; // Should parse in under 1 second
            } catch {
                return false;
            }
        }, 'performance');
    }

    // Security Tests
    async testSecurity() {
        await this.runTest('No hardcoded passwords', () => {
            const sensitiveFiles = [
                'web-interface/server.js',
                'mcp-server/phi-discovery-mcp.js',
                'workers/discovery/discovery_worker.py',
                'workers/validation/validation_worker.py'
            ];

            for (const file of sensitiveFiles) {
                if (!fs.existsSync(file)) continue;
                
                const content = fs.readFileSync(file, 'utf8').toLowerCase();
                if (content.includes('password') && 
                    (content.includes('= "') || content.includes("= '"))) {
                    // Check if it's just a variable name or actual hardcoded password
                    const lines = content.split('\n');
                    for (const line of lines) {
                        if (line.includes('password') && 
                            (line.includes('= "') || line.includes("= '")) &&
                            !line.includes('process.env') &&
                            !line.includes('config')) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }, 'security');

        await this.runTest('Environment variables used for secrets', () => {
            const envExample = fs.existsSync('.env.example') ? 
                fs.readFileSync('.env.example', 'utf8') : '';
            
            return envExample.includes('PASSWORD') || 
                   envExample.includes('SECRET') ||
                   envExample.includes('_KEY');
        }, 'security');
    }

    // Generate comprehensive report
    generateReport() {
        const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 φ-Discovery System Test Report');
        console.log('='.repeat(60));
        
        console.log(`\n📈 Overall Results:`);
        console.log(`   Total Tests: ${this.results.total}`);
        console.log(`   ✅ Passed: ${this.results.passed}`);
        console.log(`   ❌ Failed: ${this.results.failed}`);
        console.log(`   ⏭️ Skipped: ${this.results.skipped}`);
        console.log(`   📊 Pass Rate: ${passRate}%`);

        console.log(`\n📂 Results by Category:`);
        for (const [category, results] of Object.entries(this.results.categories)) {
            const total = results.passed + results.failed + results.skipped;
            const rate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : '0.0';
            console.log(`   ${category}: ${results.passed}/${total} passed (${rate}%)`);
        }

        console.log('\n🎯 System Readiness Assessment:');
        if (passRate >= 90) {
            console.log('   🟢 EXCELLENT - System is production ready');
        } else if (passRate >= 75) {
            console.log('   🟡 GOOD - System needs minor fixes');
        } else if (passRate >= 50) {
            console.log('   🟠 FAIR - System needs significant work');
        } else {
            console.log('   🔴 POOR - System requires major fixes');
        }

        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            results: this.results,
            passRate: parseFloat(passRate),
            recommendations: this.generateRecommendations()
        };

        fs.writeFileSync('test-results.json', JSON.stringify(report, null, 2));
        console.log('\n💾 Detailed results saved to: test-results.json');
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.results.categories.docker?.failed > 0) {
            recommendations.push('Fix Docker setup - ensure Docker is installed and running');
        }
        
        if (this.results.categories.dependencies?.failed > 0) {
            recommendations.push('Install missing Node.js dependencies - run npm install');
        }
        
        if (this.results.categories.python?.failed > 0) {
            recommendations.push('Set up Python environment - install Python 3 and dependencies');
        }
        
        if (this.results.categories.mcp?.failed > 0) {
            recommendations.push('Fix MCP server configuration and dependencies');
        }
        
        if (this.results.categories.web?.failed > 0) {
            recommendations.push('Debug web interface issues - check server.js and dependencies');
        }

        return recommendations;
    }

    async runAllTests() {
        this.log('🚀 Starting φ-Discovery System Tests', 'info');
        this.log(`Mode: ${this.quick ? 'Quick' : 'Comprehensive'}`, 'info');
        
        await this.testFileStructure();
        await this.testNodeDependencies();
        await this.testDockerSetup();
        await this.testPythonEnvironment();
        await this.testMathematicalFunctions();
        await this.testWebInterface();
        await this.testMCPServer();
        await this.testSystemIntegration();
        await this.testPerformance();
        await this.testSecurity();
        
        this.generateReport();
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new PhiDiscoveryTester();
    tester.runAllTests().catch(console.error);
}

module.exports = PhiDiscoveryTester;