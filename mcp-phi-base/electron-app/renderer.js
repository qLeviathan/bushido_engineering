const { ipcRenderer } = require('electron');

// DOM elements
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const validateBtn = document.getElementById('validate-btn');
const equationInput = document.getElementById('equation-input');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const discoveryList = document.getElementById('discovery-list');
const logModal = document.getElementById('log-modal');
const logContent = document.getElementById('log-content');

// State
let systemStatus = 'stopped';
let discoveries = [];
let logs = [];

// Event listeners
startBtn.addEventListener('click', startSystem);
stopBtn.addEventListener('click', stopSystem);
validateBtn.addEventListener('click', validateEquation);

// Quick equation buttons
document.querySelectorAll('.equation-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    equationInput.value = btn.dataset.equation;
  });
});

// Modal controls
document.getElementById('logs-link').addEventListener('click', (e) => {
  e.preventDefault();
  showLogs();
});

document.getElementById('close-modal').addEventListener('click', () => {
  logModal.style.display = 'none';
});

// System control functions
async function startSystem() {
  startBtn.disabled = true;
  updateStatus('starting', 'Starting system...');
  
  const result = await ipcRenderer.invoke('start-system');
  
  if (result.success) {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    updateStatus('running', 'System running');
    startPolling();
  } else {
    startBtn.disabled = false;
    updateStatus('error', `Error: ${result.message}`);
  }
}

async function stopSystem() {
  stopBtn.disabled = true;
  updateStatus('stopping', 'Stopping system...');
  
  const result = await ipcRenderer.invoke('stop-system');
  
  if (result.success) {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    updateStatus('stopped', 'System stopped');
    stopPolling();
  } else {
    stopBtn.disabled = false;
    updateStatus('error', `Error: ${result.message}`);
  }
}

async function validateEquation() {
  const equation = equationInput.value.trim();
  if (!equation) return;
  
  validateBtn.disabled = true;
  
  try {
    const result = await ipcRenderer.invoke('validate-equation', equation);
    addDiscovery({
      equation,
      timestamp: new Date().toISOString(),
      valid: result.valid,
      confidence: result.confidence || 0,
      betti: result.betti || [1, 0, 0]
    });
  } catch (error) {
    console.error('Validation error:', error);
  } finally {
    validateBtn.disabled = false;
  }
}

// UI update functions
function updateStatus(status, message) {
  systemStatus = status;
  statusText.textContent = message;
  
  statusIndicator.className = 'status-indicator';
  if (status === 'running') {
    statusIndicator.classList.add('running');
  } else if (status === 'starting' || status === 'stopping') {
    statusIndicator.classList.add('starting');
  }
  
  // Update button states
  if (status === 'running') {
    validateBtn.disabled = false;
  } else {
    validateBtn.disabled = true;
  }
}

function addDiscovery(discovery) {
  discoveries.unshift(discovery);
  
  // Remove empty state
  const emptyState = discoveryList.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }
  
  // Create discovery element
  const discoveryEl = document.createElement('div');
  discoveryEl.className = 'discovery-item';
  discoveryEl.innerHTML = `
    <div class="discovery-equation">${discovery.equation}</div>
    <div class="discovery-meta">
      <span>Valid: ${discovery.valid ? '✓' : '✗'}</span>
      <span>Confidence: ${(discovery.confidence * 100).toFixed(1)}%</span>
      <span>Betti: [${discovery.betti.join(', ')}]</span>
      <span>χ: ${discovery.betti[0] - discovery.betti[1] + discovery.betti[2]}</span>
    </div>
  `;
  
  discoveryList.insertBefore(discoveryEl, discoveryList.firstChild);
  
  // Update stats
  updateStats();
  
  // Limit display to 50 items
  while (discoveryList.children.length > 50) {
    discoveryList.removeChild(discoveryList.lastChild);
  }
}

function updateStats() {
  // Update discovery count
  document.getElementById('discovery-count').textContent = discoveries.length;
  
  // Update validation count
  const validCount = discoveries.filter(d => d.valid).length;
  document.getElementById('validation-count').textContent = validCount;
  
  // These would be updated from real system data
  // For now, using placeholder calculations
  const phaseLock = Math.random() * 0.5 + 0.5;
  document.getElementById('phase-lock').textContent = phaseLock.toFixed(3);
}

function addLog(message) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  logs.push(`[${timestamp}] ${message}`);
  
  // Keep last 1000 logs
  if (logs.length > 1000) {
    logs.shift();
  }
}

function showLogs() {
  logContent.textContent = logs.join('\n') || 'No logs available';
  logModal.style.display = 'block';
}

// IPC event listeners
ipcRenderer.on('system-status', (event, data) => {
  updateStatus(data.status, data.message);
  addLog(`System: ${data.message}`);
});

ipcRenderer.on('health-update', (event, data) => {
  // Update health indicators
  if (data.status === 'running') {
    updateStats();
  }
});

ipcRenderer.on('discovery-update', (event, discovery) => {
  addDiscovery(discovery);
});

// Polling for updates
let pollInterval;

function startPolling() {
  pollInterval = setInterval(async () => {
    try {
      const status = await ipcRenderer.invoke('get-status');
      if (status.status === 'running') {
        // Update service indicators
        updateTopology(status.services);
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 5000);
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

// Topology visualization
function updateTopology(services) {
  const svg = document.getElementById('topology-svg');
  // Simple topology visualization
  // In a real implementation, this would use D3.js or similar
  
  let runningCount = 0;
  if (services) {
    runningCount = services.filter(s => s.replicas.includes('1/1')).length;
  }
  
  // Update Betti numbers based on running services
  document.getElementById('b0').textContent = runningCount;
}

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  // Check initial status
  try {
    const status = await ipcRenderer.invoke('get-status');
    if (status.status === 'running') {
      updateStatus('running', 'System running');
      startBtn.disabled = true;
      stopBtn.disabled = false;
      startPolling();
    }
  } catch (error) {
    console.error('Initial status check failed:', error);
  }
});