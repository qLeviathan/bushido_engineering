/**
 * Unit Tests for Mathematical Functions
 * φ-Discovery Core Mathematics Validation
 */

const assert = require('assert');

describe('φ-Discovery Mathematical Functions', () => {
    
    describe('Golden Ratio (φ) Functions', () => {
        const PHI = 1.618033988749895;
        const PRECISION = 1e-10;

        it('should validate φ² = φ + 1', () => {
            const phi_squared = PHI * PHI;
            const phi_plus_one = PHI + 1;
            const difference = Math.abs(phi_squared - phi_plus_one);
            
            assert(difference < PRECISION, `φ² ≠ φ + 1, difference: ${difference}`);
        });

        it('should validate 1/φ = φ - 1', () => {
            const one_over_phi = 1 / PHI;
            const phi_minus_one = PHI - 1;
            const difference = Math.abs(one_over_phi - phi_minus_one);
            
            assert(difference < PRECISION, `1/φ ≠ φ - 1, difference: ${difference}`);
        });

        it('should calculate φ from quadratic formula', () => {
            // φ = (1 + √5) / 2
            const calculated_phi = (1 + Math.sqrt(5)) / 2;
            const difference = Math.abs(calculated_phi - PHI);
            
            assert(difference < PRECISION, `Calculated φ differs: ${difference}`);
        });

        it('should validate φ-coherence scoring', () => {
            const checkPhiCoherence = (equation) => {
                let score = 0;
                if (equation.includes('φ') || equation.includes('phi')) score += 0.4;
                if (equation.includes('1.618') || equation.includes('0.618')) score += 0.3;
                if (/F_?\d+/.test(equation)) score += 0.2;
                if (equation.includes('φ²') || equation.includes('φ^2')) score += 0.1;
                return score;
            };

            assert.equal(checkPhiCoherence('φ² = φ + 1'), 0.5); // φ symbol + φ²
            assert.equal(checkPhiCoherence('F_n+1 / F_n → φ'), 0.6); // φ symbol + Fibonacci
            assert.equal(checkPhiCoherence('E = mc²'), 0); // No φ patterns
        });
    });

    describe('Fibonacci Sequence Functions', () => {
        
        it('should generate correct Fibonacci sequence', () => {
            const fibonacci = (n) => {
                if (n <= 1) return n;
                let a = 0, b = 1;
                for (let i = 2; i <= n; i++) {
                    [a, b] = [b, a + b];
                }
                return b;
            };

            const expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
            
            for (let i = 0; i < expected.length; i++) {
                assert.equal(fibonacci(i), expected[i], `F(${i}) should be ${expected[i]}`);
            }
        });

        it('should converge to φ for large ratios', () => {
            const fibonacci = (n) => n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);
            
            const f20 = fibonacci(20);
            const f21 = fibonacci(21);
            const ratio = f21 / f20;
            
            const PHI = 1.618033988749895;
            const difference = Math.abs(ratio - PHI);
            
            assert(difference < 0.001, `F(21)/F(20) should approximate φ, difference: ${difference}`);
        });

        it('should validate φ-timing intervals', () => {
            const getPhiTiming = (n) => {
                const fibonacci = (num) => num <= 1 ? num : fibonacci(num-1) + fibonacci(num-2);
                return fibonacci(n) * 1000; // Convert to milliseconds
            };

            // Test that φ-timing follows Fibonacci sequence
            assert.equal(getPhiTiming(1), 1000);
            assert.equal(getPhiTiming(2), 1000);
            assert.equal(getPhiTiming(3), 2000);
            assert.equal(getPhiTiming(4), 3000);
            assert.equal(getPhiTiming(5), 5000);
        });
    });

    describe('Betti Number Calculations', () => {
        
        const calculateBetti = (equation) => {
            // B₀: Connected components (separated by =)
            const b0 = (equation.match(/=/g) || []).length + 1;
            
            // B₁: 1-cycles (closed loops, approximated by paired parentheses)
            const b1 = Math.floor((equation.match(/[()]/g) || []).length / 2);
            
            // B₂: 2-cycles (voids, approximated by integrals and summations)
            const b2 = (equation.match(/[∫∑]/g) || []).length;
            
            return [b0, b1, b2];
        };

        it('should calculate Betti numbers for simple equation', () => {
            const betti = calculateBetti('φ² = φ + 1');
            assert.deepEqual(betti, [1, 0, 0], 'Simple equation should have B₀=1, B₁=0, B₂=0');
        });

        it('should calculate Betti numbers for complex equation', () => {
            const betti = calculateBetti('∫ f(x) dx = (a + b) × (c + d)');
            assert.deepEqual(betti, [1, 2, 1], 'Complex equation should have B₀=1, B₁=2, B₂=1');
        });

        it('should calculate Euler characteristic', () => {
            const calculateChi = (equation) => {
                const [b0, b1, b2] = calculateBetti(equation);
                return b0 - b1 + b2;
            };

            assert.equal(calculateChi('φ² = φ + 1'), 1, 'Golden ratio equation should have χ=1');
            assert.equal(calculateChi('E = mc²'), 1, 'Einstein equation should have χ=1');
            assert.equal(calculateChi('∫ f(x) dx = (a + b)'), 0, 'Integral equation should have χ=0');
        });

        it('should validate topological health (χ=1)', () => {
            const isTopologicallyHealthy = (equation) => {
                const [b0, b1, b2] = calculateBetti(equation);
                const chi = b0 - b1 + b2;
                return chi === 1;
            };

            assert(isTopologicallyHealthy('φ² = φ + 1'), 'Golden ratio should be topologically healthy');
            assert(isTopologicallyHealthy('F = ma'), 'Newton\'s law should be topologically healthy');
            assert(!isTopologicallyHealthy('∫ f(x) dx = (a + b)'), 'Integral should not be topologically healthy');
        });
    });

    describe('Equation Validation', () => {
        
        const validateEquation = (equation) => {
            const [b0, b1, b2] = calculateBetti(equation);
            const chi = b0 - b1 + b2;
            
            // φ-coherence check
            const hasGoldenRatio = equation.includes('φ') || equation.includes('1.618');
            const hasFibonacci = /F_?\d+/.test(equation);
            
            let phiCoherence = 0;
            if (hasGoldenRatio) phiCoherence += 0.5;
            if (hasFibonacci) phiCoherence += 0.3;
            if (equation.includes('φ²')) phiCoherence += 0.2;
            
            // Base confidence from topological health
            let confidence = chi === 1 ? 0.7 : 0.5;
            
            // Boost confidence with φ-coherence
            confidence += phiCoherence * 0.3;
            confidence = Math.min(confidence, 1.0);
            
            return {
                valid: confidence > 0.618, // Golden ratio threshold
                confidence,
                betti: [b0, b1, b2],
                chi,
                phiCoherence
            };
        };

        const calculateBetti = (equation) => {
            const b0 = (equation.match(/=/g) || []).length + 1;
            const b1 = Math.floor((equation.match(/[()]/g) || []).length / 2);
            const b2 = (equation.match(/[∫∑]/g) || []).length;
            return [b0, b1, b2];
        };

        it('should validate golden ratio equation as highly confident', () => {
            const result = validateEquation('φ² = φ + 1');
            
            assert(result.valid, 'Golden ratio equation should be valid');
            assert(result.confidence > 0.9, `Confidence should be high, got ${result.confidence}`);
            assert.equal(result.chi, 1, 'Should have healthy topology');
            assert(result.phiCoherence > 0, 'Should have φ-coherence');
        });

        it('should validate known physics equations', () => {
            const equations = [
                'E = mc²',
                'F = ma',
                'PV = nRT'
            ];

            equations.forEach(eq => {
                const result = validateEquation(eq);
                assert(result.valid, `${eq} should be valid`);
                assert.equal(result.chi, 1, `${eq} should have healthy topology`);
            });
        });

        it('should reject equations with poor topology', () => {
            const badEquations = [
                '∫ f(x) dx = (a + b) × (c + d)', // χ = 0
                '∑ ∫ f(x,y) dxdy = (a + b) × (c + d) × (e + f)' // χ = -1
            ];

            badEquations.forEach(eq => {
                const result = validateEquation(eq);
                assert(!result.valid || result.confidence < 0.618, 
                    `${eq} should be rejected or have low confidence`);
            });
        });

        it('should handle edge cases gracefully', () => {
            const edgeCases = [
                '', // Empty string
                'x', // No equals sign
                '===', // Multiple equals
                '((()))', // Unmatched parentheses
                'φφφφφ' // Excessive φ symbols
            ];

            edgeCases.forEach(eq => {
                assert.doesNotThrow(() => {
                    validateEquation(eq);
                }, `Should handle edge case: "${eq}"`);
            });
        });
    });

    describe('Phase Lock Calculations', () => {
        
        it('should calculate phase coherence between workers', () => {
            const calculatePhaseCoherence = (phases) => {
                if (phases.length < 2) return 1.0;
                
                const avgPhase = phases.reduce((sum, p) => sum + p, 0) / phases.length;
                const variance = phases.reduce((sum, p) => sum + Math.pow(p - avgPhase, 2), 0) / phases.length;
                
                // Higher coherence = lower variance
                return Math.max(0, 1 - variance);
            };

            // Perfect synchronization
            assert.equal(calculatePhaseCoherence([0.5, 0.5, 0.5]), 1.0);
            
            // Good synchronization
            const goodSync = calculatePhaseCoherence([0.5, 0.52, 0.48]);
            assert(goodSync > 0.9, `Good sync should be > 0.9, got ${goodSync}`);
            
            // Poor synchronization
            const poorSync = calculatePhaseCoherence([0.1, 0.9, 0.3]);
            assert(poorSync < 0.5, `Poor sync should be < 0.5, got ${poorSync}`);
        });

        it('should validate φ-resonance frequency', () => {
            const PHI = 1.618033988749895;
            
            const calculateResonance = (frequency) => {
                const phiHarmonics = [PHI, PHI * 2, PHI * 3, PHI / 2, PHI / 3];
                
                return phiHarmonics.some(harmonic => 
                    Math.abs(frequency - harmonic) < 0.1
                );
            };

            assert(calculateResonance(1.618), 'Should resonate at φ frequency');
            assert(calculateResonance(3.236), 'Should resonate at 2φ frequency');
            assert(!calculateResonance(2.0), 'Should not resonate at non-φ frequency');
        });
    });

    describe('Mathematical Constants Validation', () => {
        
        it('should validate mathematical constants are correct', () => {
            const constants = {
                PHI: 1.618033988749895,
                PI: Math.PI,
                E: Math.E,
                SQRT2: Math.sqrt(2),
                SQRT5: Math.sqrt(5)
            };

            // Test φ calculation from √5
            const calculatedPhi = (1 + constants.SQRT5) / 2;
            assert(Math.abs(calculatedPhi - constants.PHI) < 1e-10, 'φ calculation error');

            // Test that we're using high precision
            assert(constants.PHI.toString().length > 10, 'φ should be high precision');
        });

        it('should validate convergence properties', () => {
            // Test that Fibonacci ratios converge to φ
            const fibonacci = (n) => n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);
            
            const ratios = [];
            for (let i = 10; i <= 15; i++) {
                ratios.push(fibonacci(i+1) / fibonacci(i));
            }

            // Check convergence - later ratios should be closer to φ
            const PHI = 1.618033988749895;
            const firstError = Math.abs(ratios[0] - PHI);
            const lastError = Math.abs(ratios[ratios.length - 1] - PHI);
            
            assert(lastError < firstError, 'Fibonacci ratios should converge to φ');
        });
    });
});

// Export for use in other test files
module.exports = {
    calculateBetti: (equation) => {
        const b0 = (equation.match(/=/g) || []).length + 1;
        const b1 = Math.floor((equation.match(/[()]/g) || []).length / 2);
        const b2 = (equation.match(/[∫∑]/g) || []).length;
        return [b0, b1, b2];
    },
    
    validateEquation: (equation) => {
        const [b0, b1, b2] = module.exports.calculateBetti(equation);
        const chi = b0 - b1 + b2;
        
        const hasGoldenRatio = equation.includes('φ') || equation.includes('1.618');
        let confidence = chi === 1 ? 0.7 : 0.5;
        if (hasGoldenRatio) confidence += 0.3;
        
        return {
            valid: confidence > 0.618,
            confidence: Math.min(confidence, 1.0),
            betti: [b0, b1, b2],
            chi,
            phiCoherence: hasGoldenRatio ? 0.8 : 0.1
        };
    }
};