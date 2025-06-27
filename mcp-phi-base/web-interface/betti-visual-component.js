/**
 * Betti Visual Component
 * Interactive visual explanations of Betti numbers for physics education
 */

class BettiVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.animations = new Map();
        this.currentEquation = null;
    }

    initialize() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = 300;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Add resize handler
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = this.container.clientWidth;
        this.render();
    }

    /**
     * Visualize Betti numbers for a given equation
     * @param {Object} equation - Equation data with betti numbers
     */
    visualizeEquation(equation) {
        this.currentEquation = equation;
        this.clearAnimations();
        this.render();
        this.animateBettiNumbers();
    }

    render() {
        if (!this.ctx || !this.currentEquation) return;

        const { width, height } = this.canvas;
        const betti = this.currentEquation.betti || [0, 0, 0];
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Calculate sections
        const sectionWidth = width / 3;
        const centerY = height / 2;

        // Draw B₀ (Connected Components)
        this.drawB0(sectionWidth / 2, centerY, betti[0]);
        
        // Draw B₁ (Cycles/Holes)
        this.drawB1(sectionWidth * 1.5, centerY, betti[1]);
        
        // Draw B₂ (Voids)
        this.drawB2(sectionWidth * 2.5, centerY, betti[2]);

        // Draw labels
        this.drawLabels(sectionWidth);
    }

    drawB0(x, y, value) {
        const ctx = this.ctx;
        const radius = 30;
        const spacing = 40;
        
        // Draw connected components
        for (let i = 0; i < value; i++) {
            const offsetX = (i - (value - 1) / 2) * spacing;
            
            // Glow effect
            const gradient = ctx.createRadialGradient(
                x + offsetX, y, 0,
                x + offsetX, y, radius * 1.5
            );
            gradient.addColorStop(0, 'rgba(100, 255, 218, 0.3)');
            gradient.addColorStop(1, 'rgba(100, 255, 218, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x + offsetX, y, radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Main circle
            ctx.fillStyle = 'rgba(100, 255, 218, 0.2)';
            ctx.beginPath();
            ctx.arc(x + offsetX, y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#64ffda';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Center dot
            ctx.fillStyle = '#64ffda';
            ctx.beginPath();
            ctx.arc(x + offsetX, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw connections for multiple components
        if (value > 1) {
            ctx.strokeStyle = 'rgba(100, 255, 218, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            
            for (let i = 0; i < value - 1; i++) {
                const x1 = x + (i - (value - 1) / 2) * spacing;
                const x2 = x + ((i + 1) - (value - 1) / 2) * spacing;
                
                ctx.beginPath();
                ctx.moveTo(x1 + radius, y);
                ctx.lineTo(x2 - radius, y);
                ctx.stroke();
            }
            
            ctx.setLineDash([]);
        }
    }

    drawB1(x, y, value) {
        const ctx = this.ctx;
        const baseRadius = 35;
        const holeRadius = 15;
        
        // Draw cycles/holes
        for (let i = 0; i < Math.min(value, 3); i++) {
            const angle = (i * Math.PI * 2) / Math.max(value, 3);
            const offsetX = Math.cos(angle) * 20;
            const offsetY = Math.sin(angle) * 20;
            
            // Outer ring
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, baseRadius, 0, Math.PI * 2);
            
            const gradient = ctx.createRadialGradient(
                x + offsetX, y + offsetY, holeRadius,
                x + offsetX, y + offsetY, baseRadius
            );
            gradient.addColorStop(0, 'rgba(10, 25, 47, 1)');
            gradient.addColorStop(0.5, 'rgba(100, 255, 218, 0.1)');
            gradient.addColorStop(1, 'rgba(100, 255, 218, 0.3)');
            
            ctx.fillStyle = gradient;
            ctx.fill();
            
            ctx.strokeStyle = '#64ffda';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Inner hole
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, holeRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#0a192f';
            ctx.fill();
            ctx.strokeStyle = 'rgba(100, 255, 218, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // Draw cycle indicators
        if (value > 0) {
            ctx.strokeStyle = 'rgba(100, 255, 218, 0.5)';
            ctx.lineWidth = 1;
            
            // Draw arrows showing circulation
            const arrowRadius = baseRadius + 10;
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI * 2) / 8;
                const x1 = x + Math.cos(angle) * arrowRadius;
                const y1 = y + Math.sin(angle) * arrowRadius;
                const x2 = x + Math.cos(angle + 0.2) * arrowRadius;
                const y2 = y + Math.sin(angle + 0.2) * arrowRadius;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }
    }

    drawB2(x, y, value) {
        const ctx = this.ctx;
        const radius = 40;
        
        if (value > 0) {
            // Draw 3D sphere with void
            // Outer sphere
            const gradient = ctx.createRadialGradient(
                x - 10, y - 10, 0,
                x, y, radius
            );
            gradient.addColorStop(0, 'rgba(100, 255, 218, 0.4)');
            gradient.addColorStop(0.7, 'rgba(100, 255, 218, 0.2)');
            gradient.addColorStop(1, 'rgba(100, 255, 218, 0.05)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw latitude lines
            ctx.strokeStyle = 'rgba(100, 255, 218, 0.3)';
            ctx.lineWidth = 1;
            
            for (let i = 1; i < 4; i++) {
                const lat = (i * Math.PI) / 4;
                const r = radius * Math.sin(lat);
                const yOffset = radius * Math.cos(lat);
                
                ctx.beginPath();
                ctx.ellipse(x, y - yOffset, r, r * 0.3, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Draw longitude lines
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 4;
                ctx.beginPath();
                ctx.ellipse(x, y, radius * Math.cos(angle), radius, angle, 0, Math.PI);
                ctx.stroke();
            }
            
            // Inner void
            const voidGradient = ctx.createRadialGradient(
                x, y, 0,
                x, y, radius * 0.3
            );
            voidGradient.addColorStop(0, 'rgba(10, 25, 47, 0.9)');
            voidGradient.addColorStop(1, 'rgba(10, 25, 47, 0)');
            
            ctx.fillStyle = voidGradient;
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw solid sphere (no voids)
            const gradient = ctx.createRadialGradient(
                x - 10, y - 10, 0,
                x, y, radius
            );
            gradient.addColorStop(0, 'rgba(100, 255, 218, 0.3)');
            gradient.addColorStop(1, 'rgba(100, 255, 218, 0.1)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(100, 255, 218, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    drawLabels(sectionWidth) {
        const ctx = this.ctx;
        const betti = this.currentEquation.betti || [0, 0, 0];
        
        ctx.fillStyle = '#e6f1ff';
        ctx.font = '16px "SF Mono", monospace';
        ctx.textAlign = 'center';
        
        // B₀ label
        ctx.fillText(`B₀ = ${betti[0]}`, sectionWidth / 2, 40);
        ctx.font = '12px "SF Mono", monospace';
        ctx.fillStyle = '#8892b0';
        ctx.fillText('Components', sectionWidth / 2, 55);
        
        // B₁ label
        ctx.fillStyle = '#e6f1ff';
        ctx.font = '16px "SF Mono", monospace';
        ctx.fillText(`B₁ = ${betti[1]}`, sectionWidth * 1.5, 40);
        ctx.font = '12px "SF Mono", monospace';
        ctx.fillStyle = '#8892b0';
        ctx.fillText('Cycles', sectionWidth * 1.5, 55);
        
        // B₂ label
        ctx.fillStyle = '#e6f1ff';
        ctx.font = '16px "SF Mono", monospace';
        ctx.fillText(`B₂ = ${betti[2]}`, sectionWidth * 2.5, 40);
        ctx.font = '12px "SF Mono", monospace';
        ctx.fillStyle = '#8892b0';
        ctx.fillText('Voids', sectionWidth * 2.5, 55);
        
        // Equation name
        ctx.fillStyle = '#FFD700';
        ctx.font = '18px "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.currentEquation.equation, this.canvas.width / 2, this.canvas.height - 30);
        
        // Euler characteristic
        const chi = betti[0] - betti[1] + betti[2];
        ctx.fillStyle = '#64ffda';
        ctx.font = '14px "SF Mono", monospace';
        ctx.fillText(`χ = ${chi}`, this.canvas.width / 2, this.canvas.height - 10);
    }

    animateBettiNumbers() {
        // Add subtle animations
        let time = 0;
        const animate = () => {
            time += 0.02;
            
            // Clear and redraw with animations
            this.render();
            
            // Add pulsing effect to non-zero Betti numbers
            const ctx = this.ctx;
            const betti = this.currentEquation.betti || [0, 0, 0];
            const sectionWidth = this.canvas.width / 3;
            const centerY = this.canvas.height / 2;
            
            // Pulse effect
            const pulse = Math.sin(time) * 0.1 + 0.9;
            
            // Store animation frame
            this.animations.set('main', requestAnimationFrame(animate));
        };
        
        animate();
    }

    clearAnimations() {
        this.animations.forEach(id => cancelAnimationFrame(id));
        this.animations.clear();
    }

    destroy() {
        this.clearAnimations();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BettiVisualizer;
}