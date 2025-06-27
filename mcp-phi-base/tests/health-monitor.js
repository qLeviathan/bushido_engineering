#!/usr/bin/env node
/**
 * φ-Discovery System Health Monitor
 * Real-time monitoring and diagnostics for the discovery system
 */

const { execSync, spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const http = require('http');

class HealthMonitor {
    constructor() {
        this.checks = new Map();
        this.services = new Map();
        this.metrics = {
            uptime: Date.now(),
            totalChecks: 0,
            healthyServices: 0,
            unhealthyServices: 0,
            lastUpdate: new Date()
        };
        
        this.setupChecks();
    }

    setupChecks() {
        // Define all health checks
        this.checks.set('docker', {
            name: 'Docker Engine',
            check: () => this.checkDocker(),
            critical: true,
            interval: 30000
        });

        this.checks.set('swarm', {
            name: 'Docker Swarm',
            check: () => this.checkSwarm(),
            critical: false,
            interval: 60000
        });

        this.checks.set('web', {
            name: 'Web Interface',
            check: () => this.checkWebInterface(),
            critical: true,
            interval: 15000
        });

        this.checks.set('mcp', {
            name: 'MCP Server',
            check: () => this.checkMCPServer(),
            critical: true,
            interval: 20000
        });

        this.checks.set('postgres', {
            name: 'PostgreSQL',
            check: () => this.checkPostgreSQL(),
            critical: false,
            interval: 30000
        });

        this.checks.set('redis', {
            name: 'Redis',
            check: () => this.checkRedis(),
            critical: false,
            interval: 30000
        });

        this.checks.set('rabbitmq', {
            name: 'RabbitMQ',
            check: () => this.checkRabbitMQ(),
            critical: false,
            interval: 30000
        });

        this.checks.set('workers', {
            name: 'Discovery Workers',
            check: () => this.checkWorkers(),
            critical: false,
            interval: 45000
        });

        this.checks.set('filesystem', {
            name: 'File System',
            check: () => this.checkFileSystem(),
            critical: true,
            interval: 120000
        });

        this.checks.set('resources', {
            name: 'System Resources',
            check: () => this.checkSystemResources(),
            critical: false,
            interval: 60000
        });
    }

    async checkDocker() {
        try {
            const version = execSync('docker --version', { 
                encoding: 'utf8', 
                timeout: 5000,
                stdio: 'pipe'
            });
            
            const info = execSync('docker info --format "{{.ServerVersion}}"', {
                encoding: 'utf8',
                timeout: 5000,
                stdio: 'pipe'
            });

            return {
                status: 'healthy',
                message: `Docker ${version.trim()}`,
                details: { serverVersion: info.trim() }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                message: 'Docker not available',
                details: { error: error.message }
            };
        }
    }

    async checkSwarm() {
        try {
            const swarmState = execSync('docker info --format "{{.Swarm.LocalNodeState}}"', {
                encoding: 'utf8',
                timeout: 5000,
                stdio: 'pipe'
            }).trim();

            if (swarmState === 'active') {
                const nodeCount = execSync('docker node ls --format "{{.ID}}" | wc -l', {
                    encoding: 'utf8',
                    timeout: 5000,
                    stdio: 'pipe'
                }).trim();

                return {
                    status: 'healthy',
                    message: `Swarm active with ${nodeCount} node(s)`,
                    details: { state: swarmState, nodes: parseInt(nodeCount) }
                };
            } else {
                return {
                    status: 'warning',
                    message: `Swarm ${swarmState}`,
                    details: { state: swarmState }
                };
            }
        } catch (error) {
            return {
                status: 'warning',
                message: 'Swarm info unavailable',
                details: { error: error.message }
            };
        }
    }

    async checkWebInterface() {
        return new Promise((resolve) => {
            const request = http.get('http://localhost:3000/health', { timeout: 5000 }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        resolve({
                            status: 'healthy',
                            message: 'Web interface responding',
                            details: { 
                                statusCode: res.statusCode,
                                timestamp: response.timestamp 
                            }
                        });
                    } catch {
                        resolve({
                            status: 'healthy',
                            message: 'Web interface responding',
                            details: { statusCode: res.statusCode }
                        });
                    }
                });
            });

            request.on('error', (error) => {
                resolve({
                    status: 'unhealthy',
                    message: 'Web interface not responding',
                    details: { error: error.message }
                });
            });

            request.on('timeout', () => {
                request.destroy();
                resolve({
                    status: 'unhealthy',
                    message: 'Web interface timeout',
                    details: { timeout: true }
                });
            });
        });
    }

    async checkMCPServer() {
        return new Promise((resolve) => {
            try {
                const ws = new WebSocket('ws://localhost:3000/ws');
                const timeout = setTimeout(() => {
                    ws.close();
                    resolve({
                        status: 'unhealthy',
                        message: 'MCP WebSocket timeout',
                        details: { timeout: true }
                    });
                }, 5000);

                ws.on('open', () => {
                    clearTimeout(timeout);
                    ws.close();
                    resolve({
                        status: 'healthy',
                        message: 'MCP WebSocket responding',
                        details: { connected: true }
                    });
                });

                ws.on('error', (error) => {
                    clearTimeout(timeout);
                    resolve({
                        status: 'unhealthy',
                        message: 'MCP WebSocket error',
                        details: { error: error.message }
                    });
                });
            } catch (error) {
                resolve({
                    status: 'unhealthy',
                    message: 'MCP connection failed',
                    details: { error: error.message }
                });
            }
        });
    }

    async checkPostgreSQL() {
        try {
            // Check if PostgreSQL container is running
            const containers = execSync('docker ps --filter name=postgres --format "{{.Names}}"', {
                encoding: 'utf8',
                timeout: 5000,
                stdio: 'pipe'
            });

            if (containers.trim()) {
                return {
                    status: 'healthy',
                    message: 'PostgreSQL container running',
                    details: { container: containers.trim() }
                };
            } else {
                return {
                    status: 'warning',
                    message: 'PostgreSQL container not found',
                    details: { running: false }
                };
            }
        } catch (error) {
            return {
                status: 'warning',
                message: 'PostgreSQL check failed',
                details: { error: error.message }
            };
        }
    }

    async checkRedis() {
        try {
            const containers = execSync('docker ps --filter name=redis --format "{{.Names}}"', {
                encoding: 'utf8',
                timeout: 5000,
                stdio: 'pipe'
            });

            if (containers.trim()) {
                return {
                    status: 'healthy',
                    message: 'Redis container running',
                    details: { container: containers.trim() }
                };
            } else {
                return {
                    status: 'warning',
                    message: 'Redis container not found',
                    details: { running: false }
                };
            }
        } catch (error) {
            return {
                status: 'warning',
                message: 'Redis check failed',
                details: { error: error.message }
            };
        }
    }

    async checkRabbitMQ() {
        try {
            const containers = execSync('docker ps --filter name=rabbitmq --format "{{.Names}}"', {
                encoding: 'utf8',
                timeout: 5000,
                stdio: 'pipe'
            });

            if (containers.trim()) {
                return {
                    status: 'healthy',
                    message: 'RabbitMQ container running',
                    details: { container: containers.trim() }
                };
            } else {
                return {
                    status: 'warning',
                    message: 'RabbitMQ container not found',
                    details: { running: false }
                };
            }
        } catch (error) {
            return {
                status: 'warning',
                message: 'RabbitMQ check failed',
                details: { error: error.message }
            };
        }
    }

    async checkWorkers() {
        try {
            // Check for phi-discovery stack services
            const services = execSync('docker stack services phi_discovery --format "{{.Name}} {{.Replicas}}" 2>/dev/null || echo ""', {
                encoding: 'utf8',
                timeout: 10000,
                stdio: 'pipe'
            });

            if (services.trim()) {
                const serviceLines = services.trim().split('\n');
                const totalServices = serviceLines.length;
                const runningServices = serviceLines.filter(line => 
                    line.includes('/') && !line.includes('0/')
                ).length;

                return {
                    status: runningServices > 0 ? 'healthy' : 'warning',
                    message: `${runningServices}/${totalServices} services running`,
                    details: { 
                        total: totalServices, 
                        running: runningServices,
                        services: serviceLines 
                    }
                };
            } else {
                return {
                    status: 'warning',
                    message: 'No discovery stack deployed',
                    details: { deployed: false }
                };
            }
        } catch (error) {
            return {
                status: 'warning',
                message: 'Workers check failed',
                details: { error: error.message }
            };
        }
    }

    async checkFileSystem() {
        try {
            const requiredFiles = [
                'package.json',
                'docker-compose.betti.yml',
                'web-interface/index.html',
                'web-interface/server.js',
                'mcp-server/phi-discovery-mcp.js'
            ];

            const missingFiles = [];
            for (const file of requiredFiles) {
                if (!fs.existsSync(file)) {
                    missingFiles.push(file);
                }
            }

            if (missingFiles.length === 0) {
                return {
                    status: 'healthy',
                    message: 'All required files present',
                    details: { checked: requiredFiles.length }
                };
            } else {
                return {
                    status: 'unhealthy',
                    message: `${missingFiles.length} files missing`,
                    details: { missing: missingFiles }
                };
            }
        } catch (error) {
            return {
                status: 'unhealthy',
                message: 'File system check failed',
                details: { error: error.message }
            };
        }
    }

    async checkSystemResources() {
        try {
            // Check disk space
            const diskInfo = execSync('df -h . | tail -1', {
                encoding: 'utf8',
                timeout: 5000,
                stdio: 'pipe'
            });

            const diskParts = diskInfo.trim().split(/\s+/);
            const usedPercent = parseInt(diskParts[4]);

            // Check memory (Linux/Mac)
            let memoryInfo = 'N/A';
            try {
                if (process.platform === 'linux') {
                    memoryInfo = execSync('free -m | awk "NR==2{printf \\"%.1f%%\\", $3*100/$2}"', {
                        encoding: 'utf8',
                        timeout: 5000,
                        stdio: 'pipe'
                    });
                }
            } catch {
                // Memory check is optional
            }

            const status = usedPercent > 90 ? 'warning' : 'healthy';

            return {
                status,
                message: `Disk: ${usedPercent}% used, Memory: ${memoryInfo}`,
                details: { 
                    diskUsed: usedPercent,
                    memory: memoryInfo,
                    diskInfo: diskParts
                }
            };
        } catch (error) {
            return {
                status: 'warning',
                message: 'Resource check failed',
                details: { error: error.message }
            };
        }
    }

    async runCheck(checkId) {
        const check = this.checks.get(checkId);
        if (!check) return null;

        try {
            const result = await check.check();
            result.timestamp = new Date();
            result.checkId = checkId;
            result.name = check.name;
            result.critical = check.critical;

            this.services.set(checkId, result);
            this.metrics.totalChecks++;

            if (result.status === 'healthy') {
                this.metrics.healthyServices++;
            } else {
                this.metrics.unhealthyServices++;
            }

            return result;
        } catch (error) {
            const result = {
                status: 'error',
                message: 'Check execution failed',
                details: { error: error.message },
                timestamp: new Date(),
                checkId,
                name: check.name,
                critical: check.critical
            };

            this.services.set(checkId, result);
            this.metrics.unhealthyServices++;
            return result;
        }
    }

    async runAllChecks() {
        console.log('🔍 Running health checks...\n');

        const results = [];
        for (const [checkId] of this.checks) {
            const result = await this.runCheck(checkId);
            if (result) {
                results.push(result);
                this.displayCheckResult(result);
            }
        }

        this.displaySummary();
        return results;
    }

    displayCheckResult(result) {
        const statusIcon = {
            'healthy': '✅',
            'warning': '⚠️',
            'unhealthy': '❌',
            'error': '💥'
        };

        const icon = statusIcon[result.status] || '❓';
        const critical = result.critical ? ' [CRITICAL]' : '';
        
        console.log(`${icon} ${result.name}${critical}: ${result.message}`);
        
        if (result.details && Object.keys(result.details).length > 0) {
            const detailsStr = JSON.stringify(result.details, null, 2)
                .split('\n')
                .map(line => `    ${line}`)
                .join('\n');
            console.log(`    Details: ${detailsStr}`);
        }
    }

    displaySummary() {
        const totalServices = this.services.size;
        const healthyCount = Array.from(this.services.values())
            .filter(s => s.status === 'healthy').length;
        const warningCount = Array.from(this.services.values())
            .filter(s => s.status === 'warning').length;
        const unhealthyCount = Array.from(this.services.values())
            .filter(s => s.status === 'unhealthy' || s.status === 'error').length;

        console.log('\n' + '='.repeat(50));
        console.log('📊 Health Summary');
        console.log('='.repeat(50));
        console.log(`Total Services: ${totalServices}`);
        console.log(`✅ Healthy: ${healthyCount}`);
        console.log(`⚠️  Warning: ${warningCount}`);
        console.log(`❌ Unhealthy: ${unhealthyCount}`);

        const overallHealth = unhealthyCount === 0 ? 
            (warningCount === 0 ? 'HEALTHY' : 'WARNING') : 'UNHEALTHY';

        console.log(`\n🎯 Overall Status: ${overallHealth}`);

        // Check critical services
        const criticalIssues = Array.from(this.services.values())
            .filter(s => s.critical && (s.status === 'unhealthy' || s.status === 'error'));

        if (criticalIssues.length > 0) {
            console.log('\n🚨 CRITICAL ISSUES:');
            criticalIssues.forEach(issue => {
                console.log(`   - ${issue.name}: ${issue.message}`);
            });
        }

        // Save results
        const report = {
            timestamp: new Date().toISOString(),
            overallHealth,
            services: Array.from(this.services.entries()).map(([id, service]) => ({
                id,
                ...service
            })),
            summary: {
                total: totalServices,
                healthy: healthyCount,
                warning: warningCount,
                unhealthy: unhealthyCount
            }
        };

        fs.writeFileSync('health-report.json', JSON.stringify(report, null, 2));
        console.log('\n💾 Health report saved to: health-report.json');
    }

    async startContinuousMonitoring(interval = 60000) {
        console.log(`🔄 Starting continuous monitoring (interval: ${interval}ms)`);
        
        const monitor = async () => {
            await this.runAllChecks();
            console.log(`\n⏰ Next check in ${interval/1000} seconds...\n`);
        };

        // Run initial check
        await monitor();

        // Set up continuous monitoring
        setInterval(monitor, interval);
    }

    generateRecommendations() {
        const issues = Array.from(this.services.values())
            .filter(s => s.status !== 'healthy');

        const recommendations = [];

        issues.forEach(issue => {
            switch (issue.checkId) {
                case 'docker':
                    recommendations.push('Install Docker and ensure Docker daemon is running');
                    break;
                case 'swarm':
                    recommendations.push('Initialize Docker Swarm: docker swarm init');
                    break;
                case 'web':
                    recommendations.push('Start web interface: cd web-interface && npm start');
                    break;
                case 'mcp':
                    recommendations.push('Start MCP server: cd mcp-server && npm start');
                    break;
                case 'workers':
                    recommendations.push('Deploy worker stack: docker stack deploy -c docker-compose.betti.yml phi_discovery');
                    break;
                case 'filesystem':
                    recommendations.push('Restore missing files from backup or repository');
                    break;
            }
        });

        if (recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            recommendations.forEach((rec, i) => {
                console.log(`   ${i + 1}. ${rec}`);
            });
        }

        return recommendations;
    }
}

// CLI usage
if (require.main === module) {
    const monitor = new HealthMonitor();
    
    const command = process.argv[2] || 'check';
    
    switch (command) {
        case 'check':
            monitor.runAllChecks().then(() => {
                monitor.generateRecommendations();
                process.exit(0);
            });
            break;
            
        case 'monitor':
            const interval = parseInt(process.argv[3]) || 60000;
            monitor.startContinuousMonitoring(interval);
            break;
            
        case 'help':
            console.log('φ-Discovery Health Monitor');
            console.log('');
            console.log('Commands:');
            console.log('  check                 Run all health checks once');
            console.log('  monitor [interval]    Start continuous monitoring');
            console.log('  help                  Show this help');
            console.log('');
            console.log('Examples:');
            console.log('  node health-monitor.js check');
            console.log('  node health-monitor.js monitor 30000');
            break;
            
        default:
            console.log('Unknown command. Use "help" for usage information.');
            process.exit(1);
    }
}

module.exports = HealthMonitor;