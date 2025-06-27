const { app, BrowserWindow, ipcMain, Menu, Tray, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const Store = require('electron-store');

// Store for user preferences
const store = new Store();

// Global references
let mainWindow;
let tray;
let dockerProcess;
let isQuitting = false;

// φ constants
const PHI = 1.618033988749895;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0A0A0A'
  });

  mainWindow.loadFile('index.html');

  // Prevent window from closing, minimize to tray instead
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets/tray-icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show φ-Discovery',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Start Discovery',
      click: () => {
        startDiscoverySystem();
      }
    },
    {
      label: 'Stop Discovery',
      click: () => {
        stopDiscoverySystem();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('φ-Discovery System');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// IPC handlers for frontend communication
ipcMain.handle('start-system', async () => {
  return await startDiscoverySystem();
});

ipcMain.handle('stop-system', async () => {
  return await stopDiscoverySystem();
});

ipcMain.handle('get-status', async () => {
  return await getSystemStatus();
});

ipcMain.handle('validate-equation', async (event, equation) => {
  // Send equation to discovery system
  return await sendEquationToDiscovery(equation);
});

ipcMain.handle('get-discoveries', async () => {
  // Fetch recent discoveries from PostgreSQL
  return await fetchRecentDiscoveries();
});

// System management functions
async function startDiscoverySystem() {
  try {
    mainWindow.webContents.send('system-status', { status: 'starting', message: 'Initializing φ-Discovery System...' });
    
    // Check if Docker is installed
    const dockerCheck = spawn('docker', ['--version']);
    
    await new Promise((resolve, reject) => {
      dockerCheck.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Docker not found'));
        } else {
          resolve();
        }
      });
    });
    
    // Start infrastructure
    mainWindow.webContents.send('system-status', { status: 'progress', message: 'Starting infrastructure services...' });
    
    const infraProcess = spawn('docker-compose', [
      '-f', path.join(__dirname, '../docker/docker-compose.infrastructure.yml'),
      'up', '-d'
    ], { cwd: path.join(__dirname, '..') });
    
    await new Promise((resolve) => {
      infraProcess.on('close', resolve);
    });
    
    // Initialize swarm if needed
    mainWindow.webContents.send('system-status', { status: 'progress', message: 'Initializing swarm topology...' });
    
    // Deploy services
    mainWindow.webContents.send('system-status', { status: 'progress', message: 'Deploying discovery nodes...' });
    
    const deployProcess = spawn('docker', [
      'stack', 'deploy',
      '-c', path.join(__dirname, '../docker/docker-compose.betti.yml'),
      'phi_discovery'
    ], { cwd: path.join(__dirname, '..') });
    
    await new Promise((resolve) => {
      deployProcess.on('close', resolve);
    });
    
    mainWindow.webContents.send('system-status', { status: 'running', message: 'φ-Discovery System is running' });
    
    // Start monitoring
    startSystemMonitoring();
    
    return { success: true, message: 'System started successfully' };
    
  } catch (error) {
    mainWindow.webContents.send('system-status', { status: 'error', message: error.message });
    return { success: false, message: error.message };
  }
}

async function stopDiscoverySystem() {
  try {
    mainWindow.webContents.send('system-status', { status: 'stopping', message: 'Stopping φ-Discovery System...' });
    
    // Stop swarm services
    const stopProcess = spawn('docker', [
      'stack', 'rm', 'phi_discovery'
    ]);
    
    await new Promise((resolve) => {
      stopProcess.on('close', resolve);
    });
    
    // Stop infrastructure
    const infraStopProcess = spawn('docker-compose', [
      '-f', path.join(__dirname, '../docker/docker-compose.infrastructure.yml'),
      'down'
    ], { cwd: path.join(__dirname, '..') });
    
    await new Promise((resolve) => {
      infraStopProcess.on('close', resolve);
    });
    
    mainWindow.webContents.send('system-status', { status: 'stopped', message: 'System stopped' });
    
    return { success: true, message: 'System stopped successfully' };
    
  } catch (error) {
    mainWindow.webContents.send('system-status', { status: 'error', message: error.message });
    return { success: false, message: error.message };
  }
}

async function getSystemStatus() {
  try {
    const checkProcess = spawn('docker', ['service', 'ls']);
    
    const output = await new Promise((resolve) => {
      let data = '';
      checkProcess.stdout.on('data', (chunk) => {
        data += chunk.toString();
      });
      checkProcess.on('close', () => resolve(data));
    });
    
    const services = output.includes('phi_discovery') ? 'running' : 'stopped';
    
    return {
      status: services,
      services: parseDockerServices(output)
    };
    
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

function startSystemMonitoring() {
  // Monitor system health every 5 seconds
  setInterval(async () => {
    const status = await getSystemStatus();
    mainWindow.webContents.send('health-update', status);
  }, 5000);
}

// Application lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();
  
  // Check for first run
  if (!store.get('hasRunBefore')) {
    showWelcomeDialog();
    store.set('hasRunBefore', true);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

// Helper functions
function showWelcomeDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Welcome to φ-Discovery',
    message: 'Welcome to the φ-Discovery System!',
    detail: 'This application helps you discover mathematical truths through topological validation and φ-recursive patterns.\n\nClick "Start System" to begin your journey.',
    buttons: ['Get Started']
  });
}

function parseDockerServices(output) {
  // Parse docker service ls output
  const lines = output.split('\n').slice(1); // Skip header
  const services = [];
  
  lines.forEach(line => {
    if (line.includes('phi_discovery')) {
      const parts = line.split(/\s+/);
      services.push({
        name: parts[1],
        replicas: parts[3],
        image: parts[4]
      });
    }
  });
  
  return services;
}