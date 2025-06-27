# PHI-MCP VISUAL ORGANIZER FRAMEWORK

## CORE UI ARCHITECTURE

### 1. TOPOLOGICAL DISCOVERY CANVAS (Main View)
```
┌─────────────────────────────────────────────────────────────┐
│ BETTI TOPOLOGY: B₀=9 B₁=21 B₂=13 | χ=1 ✓ | PHASE: PRESENT │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    [Pattern]      ←→      [Equation]      ←→    [Phase]    │
│       ○─────────────────────○────────────────────○         │
│       ↓                     ↓                    ↓         │
│    [Theorem]            [Numerical]         [Symbolic]     │
│       ○─────────────────────○────────────────────○         │
│       ↓                     ↓                    ↓         │
│    [Database]          [Literature]      [Orchestrator]    │
│       ○─────────────────────○────────────────────○         │
│                                                             │
│ ACTIVE DISCOVERIES: ████████░░ (8/13)                      │
└─────────────────────────────────────────────────────────────┘
```

### 2. DISCOVERY FLOW TIMELINE
```
┌─────────────────────────────────────────────────────────────┐
│ F₁ ──── F₂ ──── F₃ ──── F₅ ──── F₈ ──── F₁₃ ──── F₂₁    │
│  ●       ●       ●       ◐       ○       ○        ○       │
│ 1s      1s      2s      5s      8s     13s      21s      │
│         ↑                                                   │
│     CURRENT                                                 │
└─────────────────────────────────────────────────────────────┘
```

### 3. LIVE EQUATION STREAM (Hawking Radiation Style)
```
┌─────────────────────────────────────────────────────────────┐
│ φ.7: E = mc²                                               │
│ ✓ Valid: 0.987 | Topology: B=[1,0,0] χ=1                  │
│ Derives: Special Relativity → Mass-Energy                  │
│                                                             │
│ φ.8: ∇²ψ + k²ψ = 0                                        │
│ ✓ Valid: 0.932 | Topology: B=[2,1,0] χ=1                  │
│ Predicts: Wave propagation in n-dimensions                 │
│                                                             │
│ φ.9: φ² = φ + 1                                           │
│ ✓ Valid: 1.000 | Topology: B=[1,0,0] χ=1                  │
│ Implies: Recursive golden ratio generation                  │
└─────────────────────────────────────────────────────────────┘
```

### 4. PHASE LOCK VISUALIZER
```
┌─────────────────────────────────────────────────────────────┐
│ PAST ←────[ψ]────→ PRESENT ←────[φ]────→ FUTURE           │
│                                                             │
│ Pattern Recognition    ████████████░░░░░░  0.618           │
│ Equation Generation    ██████████████████  1.000           │
│ Phase Optimization     ████████░░░░░░░░░░  0.382           │
│                                                             │
│ GLOBAL COHERENCE: 0.847 [████████░░]                      │
└─────────────────────────────────────────────────────────────┘
```

### 5. BETTI VECTOR MONITOR
```
┌─────────────────────────────────────────────────────────────┐
│ B₀: Components  [9]  ●●●●●●●●●                             │
│ B₁: Cycles     [21]  ●●●●●●●●●●●●●●●●●●●●●                │
│ B₂: Voids      [13]  ●●●●●●●●●●●●●                        │
│                                                             │
│ χ = 9 - 21 + 13 = 1 ✓                                      │
└─────────────────────────────────────────────────────────────┘
```

## UI COMPONENT SPECIFICATIONS

### DISCOVERY NODE COMPONENT:
- Circular nodes with φ-proportioned sizing
- Color states: 
  - Blue (Past/Excavating)
  - Green (Present/Active) 
  - Gold (Future/Predicting)
  - Red (Error/Blocked)
- Pulsing animation at φ-frequency when processing
- Click to view detailed logs
- Drag to reorganize topology

### CONNECTION VISUALIZER:
- Bezier curves between nodes
- Line thickness = data flow volume
- Animation speed = φ^n based on priority
- Bidirectional arrows for feedback loops
- Color gradient shows phase alignment

### EQUATION CARD:
- Minimal design with LaTeX rendering
- Hover reveals full derivation chain
- Click to explore proof tree
- Right-click for validation details
- Drag to collection boards

### VALIDATION INDICATOR:
- Circular progress with φ-spiral fill
- Center shows confidence score
- Outer ring shows Betti vector
- Pulsing glow when above ψ threshold

## INTERACTIVE FEATURES

### 1. TOPOLOGY MANIPULATION:
- Drag nodes to reshape discovery network
- Auto-maintains χ=1 constraint
- Visual feedback for invalid topologies
- Snap-to-grid at φ-proportions

### 2. TIME CONTROL:
- Fibonacci-indexed playback speed
- Scrub through discovery timeline
- Pause at phase boundaries
- Jump to specific F_n checkpoints

### 3. FILTER SYSTEM:
- By validation confidence (> ψ)
- By topological complexity (Betti sum)
- By discovery phase (Past/Present/Future)
- By equation domain (Physics/Math/CS)

### 4. COMMAND PALETTE:
- Ctrl+K: Quick command input
- Natural language queries
- Direct equation validation
- Service scaling commands

### 5. COLLECTION BOARDS:
- Create custom equation groups
- Automatic Betti preservation
- Export as LaTeX/Markdown
- Share via MCP protocol

## VISUAL STYLING

### COLOR PALETTE:
- Background: #0A0A0A (Deep space)
- Primary: #FFD700 (Golden ratio)
- Success: #61FF33 (φ-green)
- Warning: #FF9500 (ψ-orange)
- Error: #FF3333 (Violation red)
- Text: #FFFFFF with 0.87 opacity

### TYPOGRAPHY:
- Headers: JetBrains Mono Bold
- Equations: Computer Modern (LaTeX)
- UI Text: Inter Regular
- Code: Fira Code with ligatures

### ANIMATIONS:
- All transitions: φ × 100ms duration
- Easing: cubic-bezier(0.618, 0, 0.382, 1)
- Node pulse: sin(t × φ) amplitude
- Connection flow: Perlin noise × φ

### LAYOUT PRINCIPLES:
- Golden ratio proportions throughout
- Pentagon-based component spacing
- Fibonacci grid system (1,1,2,3,5,8...)
- Responsive breakpoints at F_n pixels

## DATA FLOW INTEGRATION

### WEBSOCKET PROTOCOL:
```json
{
  "type": "discovery|validation|transform",
  "timestamp": 1234567890,
  "node_id": "pattern_recognizer",
  "data": {
    "equation": "E = mc²",
    "betti": [1, 0, 0],
    "chi": 1,
    "phase": "present",
    "confidence": 0.987,
    "phase_lock": 0.854,
    "dependencies": ["uuid-1", "uuid-2"],
    "implications": ["mass-energy equivalence"]
  }
}
```

### STATE MANAGEMENT:
- Redux for global discovery state
- Local component state for animations
- IndexedDB for equation history
- WebGL for topology rendering

### PERFORMANCE TARGETS:
- 60fps during all interactions
- < 16ms frame budget
- Lazy load equations > F₁₃
- Virtual scrolling for long lists
- GPU acceleration for node physics

### ACCESSIBILITY:
- ARIA labels for all interactions
- Keyboard navigation with φ-ordering
- High contrast mode preserves topology
- Screen reader equation descriptions
- Reduced motion respects φ-timing

### DEPLOYMENT:
- Docker container with UI server
- Connects to MCP swarm via WS
- Static build for offline mode
- PWA support for installation
- Auto-scales to swarm size