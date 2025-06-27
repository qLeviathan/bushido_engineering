# Physics Equation Validator

## Overview

This repository contains two distinct web interfaces for equation validation:

1. **MCP-Integrated Interface** (`index.html`) - Requires Claude with MCP servers
2. **Standalone Physics Validator** (`physics-validator.html`) - Works independently

## Standalone Physics Validator

The standalone physics validator is a comprehensive web application that validates physics equations across multiple domains without requiring any external dependencies or Claude integration.

### Features

#### 🎯 Physics Categories
- **Mechanics**: Newton's laws, kinematics, dynamics
- **Electromagnetism**: Maxwell's equations, circuits, fields
- **Quantum Mechanics**: Schrödinger equation, uncertainty principle
- **Thermodynamics**: Laws of thermodynamics, statistical mechanics
- **Relativity**: Special and general relativity equations
- **Optics**: Wave optics, geometric optics
- **Waves**: Wave equations, oscillations
- **Nuclear Physics**: Radioactive decay, binding energy

#### 🔍 Validation Capabilities
- **Dimensional Analysis**: Checks unit consistency
- **Topological Analysis**: Calculates Betti numbers and Euler characteristic
- **φ-Coherence**: Measures equation structure using golden ratio
- **Symmetry Detection**: Identifies conservation laws and symmetries
- **Conservation Laws**: Detects energy, momentum, charge conservation

#### 💡 User Interface
- Category selection buttons with visual icons
- Pre-loaded example equations for each category
- Real-time validation results
- Validation history tracking
- Detailed analysis explanations

### How to Use

1. **Open the Validator**
   ```bash
   # Navigate to web-interface directory
   cd web-interface
   
   # Open in browser
   open physics-validator.html
   # or
   start physics-validator.html  # Windows
   ```

2. **Select a Physics Category**
   - Click on any category button (Mechanics, Quantum, etc.)
   - The interface updates with relevant examples

3. **Enter or Select an Equation**
   - Type your equation in the input field
   - Or click an example equation to load it

4. **Validate**
   - Click "Validate Equation" button
   - View comprehensive results including:
     - Validity status
     - Confidence score
     - Dimensional analysis
     - Topological properties
     - Detected symmetries

### Example Equations by Category

#### Mechanics
- `F = ma` - Newton's Second Law
- `E = ½mv²` - Kinetic Energy
- `p = mv` - Momentum

#### Quantum Mechanics
- `E = ħω` - Planck-Einstein Relation
- `iħ∂ψ/∂t = Ĥψ` - Schrödinger Equation
- `ΔxΔp ≥ ħ/2` - Heisenberg Uncertainty

#### Electromagnetism
- `∇ × B = μ₀J + μ₀ε₀∂E/∂t` - Ampère-Maxwell Law
- `F = qE + qv × B` - Lorentz Force

## MCP-Integrated Interface vs Standalone Validator

### MCP-Integrated Interface (`index.html`)

**Purpose**: Integrates with Claude through Model Context Protocol for AI-enhanced validation

**Requirements**:
- Claude desktop app with MCP support
- Docker Swarm running validation services
- MCP server configuration
- Active WebSocket connection

**Features**:
- Real-time communication with Claude
- AI-powered equation understanding
- Distributed validation through Docker services
- Live metrics and discovery feed

**Use Cases**:
- When you need Claude's AI interpretation
- Complex equation discussions
- Integration with other MCP tools
- Research requiring AI assistance

### Standalone Validator (`physics-validator.html`)

**Purpose**: Independent physics equation validator with comprehensive analysis

**Requirements**:
- Just a web browser!
- No external dependencies
- No server required
- Works offline

**Features**:
- Eight physics category specializations
- Pre-loaded equation examples
- Dimensional consistency checking
- Topological analysis (Betti numbers)
- Symmetry and conservation law detection
- Validation history

**Use Cases**:
- Quick equation validation
- Educational purposes
- Offline equation checking
- When MCP setup is not available
- Testing specific physics domains

## Technical Implementation

### Validation Algorithm

The standalone validator uses several mathematical techniques:

1. **Betti Numbers**: Topological invariants calculated from equation structure
2. **φ-Coherence**: Measures equation balance using golden ratio
3. **Dimensional Analysis**: Ensures unit consistency
4. **Pattern Recognition**: Identifies known physics patterns

### File Structure

```
web-interface/
├── index.html                 # MCP-integrated interface
├── physics-validator.html     # Standalone validator
├── server.js                 # WebSocket server for MCP
└── PHYSICS_VALIDATOR_README.md  # This file
```

## Quick Start Guide

### For Standalone Validator (Recommended for Quick Use)

1. Open `physics-validator.html` in any modern browser
2. Select your physics domain
3. Enter or select an equation
4. Click validate

### For MCP Integration (Advanced)

1. Set up Docker Swarm services
2. Configure Claude MCP servers
3. Run WebSocket server
4. Launch Claude with MCP flags
5. Open `index.html`

## Validation Examples

### Valid Equations
- `E = mc²` (Relativity) ✓
- `F = ma` (Mechanics) ✓
- `PV = nRT` (Thermodynamics) ✓

### Invalid Equations
- `E = mc³` ✗ (Incorrect dimensions)
- `F = m + a` ✗ (Incompatible units)
- `p = ET` ✗ (Dimensional mismatch)

## Future Enhancements

- LaTeX rendering for equations
- Export validation reports
- Custom equation categories
- Advanced symbolic manipulation
- Integration with CAS systems

## Troubleshooting

### Standalone Validator Issues
- **Equation not validating**: Check syntax and symbols
- **History not saving**: Enable localStorage in browser
- **Examples not loading**: Refresh the page

### MCP Interface Issues
- **Not connecting**: Check Docker services
- **No Claude response**: Verify MCP configuration
- **WebSocket errors**: Ensure server is running

## Contributing

To add new physics categories or improve validation:

1. Edit `equationExamples` object for new examples
2. Enhance validation functions for better accuracy
3. Add new symmetry or conservation detections
4. Improve UI/UX with additional features

## License

This project is part of the φ-Discovery system for mathematical exploration.