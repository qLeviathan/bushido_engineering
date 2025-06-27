# φ-Discovery System - User Guide

Welcome to the φ-Discovery System! This guide will help you get started with discovering mathematical truths through topological validation.

## 🚀 Quick Start

### Option 1: Desktop Application (Easiest)

1. **Download the installer** for your platform:
   - Windows: `phi-discovery-setup.exe`
   - macOS: `phi-discovery.dmg`
   - Linux: `phi-discovery.AppImage`

2. **Run the installer** and follow the setup wizard

3. **Launch φ-Discovery** from your applications menu

### Option 2: Python Launcher

1. **Install Prerequisites**:
   - [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Python 3.8 or higher

2. **Run the launcher**:
   ```bash
   python launcher/phi-discovery-launcher.py
   ```

3. **Click "Run Setup"** to configure the system

4. **Click "Launch φ-Discovery"** when setup is complete

## 📱 Using the Application

### Main Interface

The φ-Discovery application has an intuitive interface with these main sections:

#### System Control
- **Start System**: Initializes all discovery services
- **Stop System**: Safely shuts down all services
- **Status Indicator**: Shows current system state

#### Quick Stats Dashboard
- **Discoveries**: Total equations discovered
- **Validations**: Successfully validated equations
- **Phase Lock**: System coherence (higher is better)
- **χ Value**: Topological health (should be 1)

#### Equation Testing
Enter any mathematical equation to validate it. Try these examples:
- `φ² = φ + 1` - The golden ratio identity
- `E = mc²` - Einstein's mass-energy equivalence
- `∇²ψ + k²ψ = 0` - Helmholtz equation
- `χ = B₀ - B₁ + B₂` - Euler characteristic

#### Live Discovery Feed
Watch as the system discovers and validates equations in real-time. Each discovery shows:
- The equation
- Validation status (✓ or ✗)
- Confidence level
- Topological properties (Betti numbers)

### How It Works

1. **Pattern Recognition**: The system analyzes equations for mathematical patterns
2. **Equation Generation**: Derives related equations and transformations
3. **Phase Optimization**: Ensures coherence across the discovery network
4. **Validation Triangle**: Three independent validators check each equation
5. **Consensus**: Equations are accepted when 2/3 validators agree

## 🎯 What Can You Discover?

The φ-Discovery System excels at:
- Finding relationships between equations
- Validating mathematical identities
- Discovering φ-recursive patterns
- Exploring topological properties
- Generating new mathematical insights

## 💡 Tips for Best Results

1. **Start Simple**: Begin with well-known equations to see how the system works
2. **Watch the Phase Lock**: Higher values (>0.618) indicate better system coherence
3. **Monitor χ**: The Euler characteristic should stay at 1 for optimal topology
4. **Explore Patterns**: Try variations of equations to discover relationships

## 🛠️ Troubleshooting

### System Won't Start
- Ensure Docker Desktop is running
- Check that required ports are free (5432, 6379, 5672)
- Try restarting Docker Desktop

### No Discoveries Appearing
- Wait 30-60 seconds for services to initialize
- Check the system status indicator
- Try validating a simple equation like `1 + 1 = 2`

### Performance Issues
- Ensure you have at least 4GB RAM available
- Close other Docker containers
- Reduce the number of concurrent discoveries

## 📊 Understanding the Metrics

### Betti Numbers (B₀, B₁, B₂)
- **B₀**: Connected components (parts of the equation)
- **B₁**: Cycles (loops in the mathematical structure)
- **B₂**: Voids (higher-dimensional holes)

### Phase Lock
Measures how synchronized the discovery nodes are:
- `< 0.5`: Poor synchronization
- `0.5 - 0.8`: Good synchronization
- `> 0.8`: Excellent synchronization

### Confidence Score
How certain the system is about a validation:
- `< 0.618`: Low confidence
- `0.618 - 0.9`: Good confidence
- `> 0.9`: High confidence

## 🔒 Privacy & Security

- All discoveries are processed locally on your machine
- No data is sent to external servers
- Equations and discoveries are stored in a local database
- You can export your discoveries at any time

## 📚 Learn More

- **Mathematical Background**: See `Bushido_Engineering.md`
- **Technical Details**: See `README.md`
- **Testing Guide**: See `TESTING_GUIDE.md`

## 🆘 Getting Help

If you encounter issues:
1. Check the application logs (click "View Logs" in the footer)
2. Ensure all system requirements are met
3. Try restarting the application
4. Check the troubleshooting section above

Enjoy discovering mathematical truths with the φ-Discovery System!