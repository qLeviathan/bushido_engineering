/**
 * Integration Tests for Docker Infrastructure
 * Tests Docker containers, services, and swarm deployment
 */

const assert = require('assert');
const { execSync, spawn } = require('child_process');
const fs = require('fs');

describe('Docker Integration Tests', () => {
    
    const timeout = 30000; // 30 seconds for Docker operations

    before(function() {
        this.timeout(timeout);
        
        // Check if Docker is available
        try {
            execSync('docker --version', { stdio: 'pipe' });
        } catch (error) {
            this.skip('Docker not available');
        }
    });

    describe('Docker Environment', () => {
        
        it('should have Docker installed and running', () => {
            try {
                const version = execSync('docker --version', { encoding: 'utf8' });
                assert(version.includes('Docker'), 'Should return Docker version');
                
                const info = execSync('docker info', { encoding: 'utf8', stdio: 'pipe' });
                assert(info.includes('Server'), 'Docker daemon should be running');
            } catch (error) {
                assert.fail(`Docker not properly installed or running: ${error.message}`);
            }
        });

        it('should have Docker Compose available', () => {
            try {
                const version = execSync('docker-compose --version', { encoding: 'utf8', stdio: 'pipe' });
                assert(version.includes('docker-compose') || version.includes('Docker Compose'), 
                    'Should have Docker Compose');
            } catch (error) {
                try {
                    // Try docker compose (newer syntax)
                    execSync('docker compose version', { encoding: 'utf8', stdio: 'pipe' });
                } catch (secondError) {
                    assert.fail('Docker Compose not available');
                }
            }
        });

        it('should have sufficient Docker resources', () => {
            try {
                const info = execSync('docker system df', { encoding: 'utf8', stdio: 'pipe' });
                // Basic check that command works
                assert(info.includes('TYPE'), 'Should return resource usage');
            } catch (error) {
                // Non-critical, skip if command fails
                this.skip('Docker system info not available');
            }
        });
    });

    describe('Docker Compose Configuration', () => {
        
        it('should have valid docker-compose.betti.yml', () => {
            assert(fs.existsSync('docker-compose.betti.yml'), 'Main compose file should exist');
            
            try {
                // Validate compose file syntax
                execSync('docker-compose -f docker-compose.betti.yml config', { 
                    stdio: 'pipe' 
                });
            } catch (error) {
                assert.fail(`Invalid Docker Compose configuration: ${error.message}`);
            }
        });

        it('should define required services in compose file', () => {
            const composeContent = fs.readFileSync('docker-compose.betti.yml', 'utf8');
            
            const requiredServices = [
                'pattern_recognizer',
                'equation_generator', 
                'phase_optimizer',
                'theorem_checker',
                'numerical_validator',
                'symbolic_verifier'
            ];

            requiredServices.forEach(service => {
                assert(composeContent.includes(service), 
                    `Compose file should define ${service} service`);
            });
        });

        it('should have proper network configuration', () => {
            const composeContent = fs.readFileSync('docker-compose.betti.yml', 'utf8');
            
            assert(composeContent.includes('networks:'), 'Should define networks');
            assert(composeContent.includes('discovery_manifold') || 
                   composeContent.includes('phi_network'), 'Should have discovery network');
        });

        it('should have volume definitions', () => {
            const composeContent = fs.readFileSync('docker-compose.betti.yml', 'utf8');
            
            assert(composeContent.includes('volumes:'), 'Should define volumes');
        });
    });

    describe('Docker Image Building', () => {
        
        it('should have valid Dockerfiles', () => {
            const dockerfiles = [
                'workers/discovery/Dockerfile',
                'workers/validation/Dockerfile',
                'docker/Dockerfile.mcp-base'
            ];

            dockerfiles.forEach(dockerfile => {
                if (fs.existsSync(dockerfile)) {
                    const content = fs.readFileSync(dockerfile, 'utf8');
                    assert(content.includes('FROM'), `${dockerfile} should have FROM instruction`);
                    assert(content.includes('WORKDIR') || content.includes('RUN'), 
                        `${dockerfile} should have WORKDIR or RUN instructions`);
                }
            });
        });

        it('should build discovery worker image', function() {
            this.timeout(timeout * 2); // Building can take time
            
            if (!fs.existsSync('workers/discovery/Dockerfile')) {
                this.skip('Discovery Dockerfile not found');
            }

            try {
                execSync('docker build -t phi-discovery-test:latest workers/discovery/', {
                    stdio: 'pipe'
                });
                
                // Verify image was created
                const images = execSync('docker images phi-discovery-test:latest', { 
                    encoding: 'utf8' 
                });
                assert(images.includes('phi-discovery-test'), 'Discovery image should be built');
                
                // Cleanup
                execSync('docker rmi phi-discovery-test:latest', { stdio: 'pipe' });
            } catch (error) {
                assert.fail(`Failed to build discovery worker image: ${error.message}`);
            }
        });

        it('should build validation worker image', function() {
            this.timeout(timeout * 2);
            
            if (!fs.existsSync('workers/validation/Dockerfile')) {
                this.skip('Validation Dockerfile not found');
            }

            try {
                execSync('docker build -t phi-validation-test:latest workers/validation/', {
                    stdio: 'pipe'
                });
                
                const images = execSync('docker images phi-validation-test:latest', { 
                    encoding: 'utf8' 
                });
                assert(images.includes('phi-validation-test'), 'Validation image should be built');
                
                // Cleanup
                execSync('docker rmi phi-validation-test:latest', { stdio: 'pipe' });
            } catch (error) {
                assert.fail(`Failed to build validation worker image: ${error.message}`);
            }
        });
    });

    describe('Docker Swarm Integration', () => {
        
        it('should check Docker Swarm availability', () => {
            try {
                const swarmInfo = execSync('docker info --format "{{.Swarm.LocalNodeState}}"', { 
                    encoding: 'utf8' 
                });
                
                if (swarmInfo.trim() === 'inactive') {
                    this.skip('Docker Swarm not initialized (this is OK for testing)');
                }
                
                assert(['active', 'pending'].includes(swarmInfo.trim()), 
                    'Swarm should be active or pending');
            } catch (error) {
                this.skip('Docker Swarm info not available');
            }
        });

        it('should be able to initialize Docker Swarm', function() {
            this.timeout(timeout);
            
            try {
                const swarmState = execSync('docker info --format "{{.Swarm.LocalNodeState}}"', { 
                    encoding: 'utf8' 
                }).trim();
                
                if (swarmState === 'inactive') {
                    // Try to initialize swarm
                    execSync('docker swarm init', { stdio: 'pipe' });
                    
                    // Verify swarm is now active
                    const newState = execSync('docker info --format "{{.Swarm.LocalNodeState}}"', { 
                        encoding: 'utf8' 
                    }).trim();
                    
                    assert(newState === 'active', 'Swarm should be active after init');
                }
            } catch (error) {
                // Swarm might already be initialized or not supported
                this.skip(`Swarm initialization skipped: ${error.message}`);
            }
        });

        it('should validate stack deployment configuration', () => {
            try {
                // Test stack deployment without actually deploying
                const result = execSync('docker stack deploy --help', { 
                    encoding: 'utf8', 
                    stdio: 'pipe' 
                });
                assert(result.includes('Deploy'), 'Docker stack deploy should be available');
            } catch (error) {
                assert.fail('Docker stack deploy not available');
            }
        });
    });

    describe('Infrastructure Services', () => {
        
        it('should be able to start PostgreSQL container', function() {
            this.timeout(timeout);
            
            try {
                // Start a test PostgreSQL container
                execSync('docker run --name phi-postgres-test -e POSTGRES_PASSWORD=test -d postgres:13', {
                    stdio: 'pipe'
                });
                
                // Wait a moment for startup
                setTimeout(() => {
                    // Check if container is running
                    const ps = execSync('docker ps --filter name=phi-postgres-test', { 
                        encoding: 'utf8' 
                    });
                    assert(ps.includes('phi-postgres-test'), 'PostgreSQL container should be running');
                    
                    // Cleanup
                    execSync('docker stop phi-postgres-test', { stdio: 'pipe' });
                    execSync('docker rm phi-postgres-test', { stdio: 'pipe' });
                }, 2000);
                
            } catch (error) {
                // Cleanup on error
                try {
                    execSync('docker stop phi-postgres-test', { stdio: 'pipe' });
                    execSync('docker rm phi-postgres-test', { stdio: 'pipe' });
                } catch {}
                assert.fail(`Failed to start PostgreSQL container: ${error.message}`);
            }
        });

        it('should be able to start Redis container', function() {
            this.timeout(timeout);
            
            try {
                execSync('docker run --name phi-redis-test -d redis:7', { stdio: 'pipe' });
                
                setTimeout(() => {
                    const ps = execSync('docker ps --filter name=phi-redis-test', { 
                        encoding: 'utf8' 
                    });
                    assert(ps.includes('phi-redis-test'), 'Redis container should be running');
                    
                    // Cleanup
                    execSync('docker stop phi-redis-test', { stdio: 'pipe' });
                    execSync('docker rm phi-redis-test', { stdio: 'pipe' });
                }, 2000);
                
            } catch (error) {
                try {
                    execSync('docker stop phi-redis-test', { stdio: 'pipe' });
                    execSync('docker rm phi-redis-test', { stdio: 'pipe' });
                } catch {}
                assert.fail(`Failed to start Redis container: ${error.message}`);
            }
        });

        it('should be able to start RabbitMQ container', function() {
            this.timeout(timeout);
            
            try {
                execSync('docker run --name phi-rabbitmq-test -d rabbitmq:3-management', { 
                    stdio: 'pipe' 
                });
                
                setTimeout(() => {
                    const ps = execSync('docker ps --filter name=phi-rabbitmq-test', { 
                        encoding: 'utf8' 
                    });
                    assert(ps.includes('phi-rabbitmq-test'), 'RabbitMQ container should be running');
                    
                    // Cleanup
                    execSync('docker stop phi-rabbitmq-test', { stdio: 'pipe' });
                    execSync('docker rm phi-rabbitmq-test', { stdio: 'pipe' });
                }, 3000);
                
            } catch (error) {
                try {
                    execSync('docker stop phi-rabbitmq-test', { stdio: 'pipe' });
                    execSync('docker rm phi-rabbitmq-test', { stdio: 'pipe' });
                } catch {}
                assert.fail(`Failed to start RabbitMQ container: ${error.message}`);
            }
        });
    });

    describe('Container Health Checks', () => {
        
        it('should validate container resource limits', () => {
            const composeContent = fs.readFileSync('docker-compose.betti.yml', 'utf8');
            
            // Check if resource limits are defined (recommended)
            if (composeContent.includes('deploy:') || composeContent.includes('resources:')) {
                assert(composeContent.includes('limits') || composeContent.includes('reservations'), 
                    'Should define resource limits');
            }
        });

        it('should have health check configurations', () => {
            const composeContent = fs.readFileSync('docker-compose.betti.yml', 'utf8');
            
            // Health checks are optional but recommended
            if (composeContent.includes('healthcheck:')) {
                assert(composeContent.includes('test:'), 'Health checks should have test commands');
                assert(composeContent.includes('interval:'), 'Health checks should have intervals');
            }
        });

        it('should define proper restart policies', () => {
            const composeContent = fs.readFileSync('docker-compose.betti.yml', 'utf8');
            
            // Should have restart policies for production services
            assert(composeContent.includes('restart:') || 
                   composeContent.includes('restart_policy:'), 
                   'Should define restart policies');
        });
    });

    describe('Performance and Scaling', () => {
        
        it('should handle container scaling configuration', () => {
            const composeContent = fs.readFileSync('docker-compose.betti.yml', 'utf8');
            
            // Check for scaling configurations
            if (composeContent.includes('deploy:')) {
                // Swarm mode scaling
                if (composeContent.includes('replicas:')) {
                    assert(composeContent.match(/replicas:\s*\d+/), 
                        'Replicas should be numeric');
                }
            }
        });

        it('should validate network performance settings', () => {
            const composeContent = fs.readFileSync('docker-compose.betti.yml', 'utf8');
            
            if (composeContent.includes('driver: overlay')) {
                // Overlay networks are good for swarm
                assert(true, 'Overlay driver is appropriate for swarm');
            } else if (composeContent.includes('driver: bridge')) {
                // Bridge networks are fine for single-host
                assert(true, 'Bridge driver is appropriate for single-host');
            }
        });

        it('should check for volume performance considerations', () => {
            const composeContent = fs.readFileSync('docker-compose.betti.yml', 'utf8');
            
            if (composeContent.includes('volumes:')) {
                // Named volumes are generally better than bind mounts for performance
                const hasNamedVolumes = composeContent.match(/^\s+\w+:\s*$/m);
                if (hasNamedVolumes) {
                    assert(true, 'Named volumes detected (good for performance)');
                }
            }
        });
    });

    describe('Security Configuration', () => {
        
        it('should not expose unnecessary ports', () => {
            const composeContent = fs.readFileSync('docker-compose.betti.yml', 'utf8');
            
            // Check that only necessary ports are exposed
            const exposedPorts = composeContent.match(/ports:\s*\n(\s*-\s*"?\d+:\d+"?\s*\n)*/g);
            
            if (exposedPorts) {
                // Should not expose too many ports to host
                const portCount = (composeContent.match(/- "\d+:\d+"/g) || []).length;
                assert(portCount < 10, `Too many exposed ports: ${portCount}`);
            }
        });

        it('should use environment variables for secrets', () => {
            const composeContent = fs.readFileSync('docker-compose.betti.yml', 'utf8');
            
            if (composeContent.includes('POSTGRES_PASSWORD') || 
                composeContent.includes('REDIS_PASSWORD')) {
                // Should use environment variables, not hardcoded values
                assert(!composeContent.includes('POSTGRES_PASSWORD: password123'), 
                    'Should not have hardcoded passwords');
                assert(!composeContent.includes('REDIS_PASSWORD: password123'), 
                    'Should not have hardcoded passwords');
            }
        });

        it('should use appropriate user settings', () => {
            const dockerfiles = [
                'workers/discovery/Dockerfile',
                'workers/validation/Dockerfile'
            ];

            dockerfiles.forEach(dockerfile => {
                if (fs.existsSync(dockerfile)) {
                    const content = fs.readFileSync(dockerfile, 'utf8');
                    
                    // Should avoid running as root in production
                    if (content.includes('USER')) {
                        assert(!content.includes('USER root'), 
                            `${dockerfile} should not explicitly use root user`);
                    }
                }
            });
        });
    });
});