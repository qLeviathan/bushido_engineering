# φ-Discovery GUI Launcher

A beautiful desktop application for managing the φ-Discovery System.

## Features

- **One-Click Start/Stop**: Launch the entire system with a single button
- **Real-time Status**: Monitor system health and status
- **Quick Actions**: Access web interface, view logs, open documentation
- **Dark Theme**: Beautiful dark UI with golden φ accents
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Usage

### Running the Launcher

```bash
python launcher.py
```

Or make it executable:
```bash
chmod +x launcher.py
./launcher.py
```

### Windows

Double-click `launcher.py` if Python is associated with .py files.

## Interface Overview

### Main Controls
- **Start System**: Deploys Docker services and starts web interface
- **Stop System**: Gracefully shuts down all services

### Status Indicator
- 🟢 Green dot = System running
- 🔴 Red dot = System stopped

### Quick Actions
- **Open Web Interface**: Launch browser to http://localhost:3000
- **View Logs**: Display recent service logs
- **Documentation**: Open README.md
- **Settings**: View/edit environment configuration

### System Output
Real-time log display showing:
- Service startup/shutdown messages
- Error messages
- Status updates

## Requirements

- Python 3.6 or higher
- tkinter (usually included with Python)
- Docker must be installed and running
- Node.js and npm for web interface

## Troubleshooting

### "No module named tkinter"
- **Linux**: `sudo apt-get install python3-tk`
- **macOS**: tkinter comes with Python from python.org
- **Windows**: Reinstall Python and check "tcl/tk" option

### Docker commands fail
- Ensure Docker Desktop is running
- Check user has permission to run Docker
- On Linux: `sudo usermod -aG docker $USER`

### System won't start
- Check if ports are already in use
- Verify all dependencies are installed
- Check Docker has enough resources allocated

## Customization

### Change Colors
Edit the color scheme in `launcher.py`:
```python
self.bg_color = "#0a192f"       # Background
self.accent_color = "#FFD700"   # Golden accent
self.success_color = "#64ffda"  # Success green
```

### Add Custom Actions
Add new buttons in the `create_widgets()` method.

## Development

The launcher is a standalone Python/tkinter application that:
1. Manages Docker services via subprocess
2. Monitors system status
3. Provides quick access to all features
4. Shows real-time logs and status

No external dependencies required beyond standard library!