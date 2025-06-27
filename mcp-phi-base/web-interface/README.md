# φ-Discovery Web Interface

A beautiful web interface for the φ-Discovery mathematical discovery system, featuring Claude integration for AI-assisted mathematical exploration.

## Features

- **Claude Integration**: Use Claude API for mathematical discovery and exploration
- **Real-time Validation**: Validate equations and see Betti numbers, χ values
- **Live Metrics**: Monitor phase lock, validation rate, and φ-coherence
- **Discovery Feed**: Watch discoveries flow through the system in real-time
- **Beautiful UI**: R Studio-inspired interface with golden ratio styling

## Quick Start

### 1. Install Dependencies
```bash
cd web-interface
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open in Browser
Navigate to http://localhost:3000

### 4. Login
- Enter your Claude API key (get one from https://console.anthropic.com/)
- Use password: `phi`

## Usage

### Validating Equations
Type mathematical equations directly in the chat:
- `φ² = φ + 1`
- `E = mc²`
- `∇²ψ + k²ψ = 0`

### Asking Claude
Ask mathematical questions:
- "What is the relationship between φ and Fibonacci?"
- "Explain Betti numbers in topology"
- "Generate equations with golden ratio properties"

### System Control
- **Start System**: Initializes the discovery backend
- **Stop System**: Stops all services
- **Validate**: Manually validate equations
- **Clear**: Clear the workspace

## Architecture

```
Web Interface (Browser)
    ↓
Express Server (port 3000)
    ↓
WebSocket Connection
    ↓
Backend Services (if running)
    ↓
Claude API (for AI assistance)
```

## Standalone Mode

The interface works in two modes:

1. **Full Mode**: With Docker backend running
   - Real-time discovery processing
   - Distributed validation
   - Persistent storage

2. **Standalone Mode**: Without backend
   - Claude integration still works
   - Local equation validation
   - No persistence

## Customization

### Change Port
Edit `server.js`:
```javascript
const PORT = process.env.WEB_PORT || 3000;
```

### Modify Styling
Edit the CSS variables in `index.html`:
```css
:root {
    --accent-primary: #FFD700;  /* Golden color */
    --bg-primary: #0a192f;      /* Background */
}
```

## Security

- API keys are stored only in browser memory
- Never committed to version control
- All communication over secure WebSocket

## Troubleshooting

### "Backend Offline"
This is normal if Docker services aren't running. The interface works standalone with Claude.

### Claude API Errors
- Check your API key is valid
- Ensure you have API credits
- Check rate limits

### WebSocket Connection Failed
- Ensure no firewall blocking port 3000
- Check if another service is using the port