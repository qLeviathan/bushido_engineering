#!/usr/bin/env python3
"""
φ-Discovery One-Click Launcher
Simplified setup and launch for non-technical users
"""

import os
import sys
import subprocess
import platform
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import threading
import json
import shutil
from pathlib import Path

class PhiDiscoveryLauncher:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("φ-Discovery System Launcher")
        self.root.geometry("600x500")
        
        # Set icon if available
        if platform.system() == "Windows":
            self.root.iconbitmap(default='assets/icon.ico')
        
        # Variables
        self.is_running = False
        self.docker_installed = False
        self.setup_complete = False
        
        # Create GUI
        self.create_widgets()
        
        # Check system requirements
        self.check_requirements()
        
    def create_widgets(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Title
        title_label = ttk.Label(main_frame, text="φ-Discovery System", 
                               font=('Arial', 24, 'bold'))
        title_label.grid(row=0, column=0, columnspan=2, pady=10)
        
        subtitle_label = ttk.Label(main_frame, 
                                  text="Mathematical Discovery through Topological Validation",
                                  font=('Arial', 12))
        subtitle_label.grid(row=1, column=0, columnspan=2, pady=5)
        
        # Status frame
        status_frame = ttk.LabelFrame(main_frame, text="System Status", padding="10")
        status_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=20)
        
        self.status_label = ttk.Label(status_frame, text="Checking requirements...")
        self.status_label.grid(row=0, column=0, sticky=tk.W)
        
        self.progress = ttk.Progressbar(status_frame, mode='indeterminate')
        self.progress.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=5)
        
        # Requirements checklist
        req_frame = ttk.LabelFrame(main_frame, text="Requirements", padding="10")
        req_frame.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=10)
        
        self.docker_check = ttk.Label(req_frame, text="⏳ Docker Desktop")
        self.docker_check.grid(row=0, column=0, sticky=tk.W)
        
        self.env_check = ttk.Label(req_frame, text="⏳ Environment Configuration")
        self.env_check.grid(row=1, column=0, sticky=tk.W)
        
        self.network_check = ttk.Label(req_frame, text="⏳ Network Ports")
        self.network_check.grid(row=2, column=0, sticky=tk.W)
        
        # Action buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=4, column=0, columnspan=2, pady=20)
        
        self.setup_btn = ttk.Button(button_frame, text="Run Setup", 
                                   command=self.run_setup, state='disabled')
        self.setup_btn.grid(row=0, column=0, padx=5)
        
        self.launch_btn = ttk.Button(button_frame, text="Launch φ-Discovery", 
                                    command=self.launch_app, state='disabled')
        self.launch_btn.grid(row=0, column=1, padx=5)
        
        self.stop_btn = ttk.Button(button_frame, text="Stop System", 
                                  command=self.stop_system, state='disabled')
        self.stop_btn.grid(row=0, column=2, padx=5)
        
        # Log area
        log_frame = ttk.LabelFrame(main_frame, text="Setup Log", padding="10")
        log_frame.grid(row=5, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=10)
        
        self.log_text = scrolledtext.ScrolledText(log_frame, height=10, width=60)
        self.log_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(5, weight=1)
        log_frame.columnconfigure(0, weight=1)
        log_frame.rowconfigure(0, weight=1)
        
    def log(self, message):
        """Add message to log"""
        self.log_text.insert(tk.END, f"{message}\n")
        self.log_text.see(tk.END)
        self.root.update()
        
    def check_requirements(self):
        """Check system requirements"""
        self.progress.start()
        
        def check():
            # Check Docker
            self.log("Checking Docker installation...")
            if self.check_docker():
                self.docker_check.config(text="✅ Docker Desktop")
                self.docker_installed = True
                self.log("Docker found!")
            else:
                self.docker_check.config(text="❌ Docker Desktop (Not found)")
                self.log("Docker not found. Please install Docker Desktop.")
                
            # Check environment
            self.log("Checking environment configuration...")
            if self.check_environment():
                self.env_check.config(text="✅ Environment Configuration")
                self.log("Environment configured!")
            else:
                self.env_check.config(text="⚠️ Environment Configuration (Needs setup)")
                self.log("Environment needs configuration.")
                
            # Check ports
            self.log("Checking network ports...")
            if self.check_ports():
                self.network_check.config(text="✅ Network Ports")
                self.log("Ports available!")
            else:
                self.network_check.config(text="⚠️ Network Ports (May be in use)")
                self.log("Some ports may be in use.")
                
            # Update status
            self.progress.stop()
            if self.docker_installed:
                self.status_label.config(text="Ready to set up φ-Discovery")
                self.setup_btn.config(state='normal')
            else:
                self.status_label.config(text="Please install Docker Desktop first")
                messagebox.showwarning("Docker Required", 
                                     "Docker Desktop is required to run φ-Discovery.\n\n"
                                     "Please install it from:\n"
                                     "https://www.docker.com/products/docker-desktop")
                
        threading.Thread(target=check, daemon=True).start()
        
    def check_docker(self):
        """Check if Docker is installed and running"""
        try:
            result = subprocess.run(['docker', '--version'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                # Check if Docker daemon is running
                result = subprocess.run(['docker', 'ps'], 
                                      capture_output=True, text=True)
                return result.returncode == 0
        except:
            pass
        return False
        
    def check_environment(self):
        """Check if environment is configured"""
        env_file = Path('.env')
        return env_file.exists()
        
    def check_ports(self):
        """Check if required ports are available"""
        # Simple check - in production would actually test port binding
        import socket
        ports = [5432, 6379, 5672, 15672]  # PostgreSQL, Redis, RabbitMQ
        
        for port in ports:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            if result == 0:
                return False
        return True
        
    def run_setup(self):
        """Run the setup process"""
        self.setup_btn.config(state='disabled')
        self.progress.start()
        self.status_label.config(text="Running setup...")
        
        def setup():
            try:
                # Create .env if it doesn't exist
                if not Path('.env').exists():
                    self.log("Creating environment configuration...")
                    shutil.copy('.env.example', '.env')
                    self.log("Environment file created. Using default passwords.")
                    
                # Pull Docker images
                self.log("\nPulling Docker images...")
                images = [
                    'postgres:15-alpine',
                    'redis:7-alpine',
                    'rabbitmq:3-management-alpine'
                ]
                
                for image in images:
                    self.log(f"Pulling {image}...")
                    subprocess.run(['docker', 'pull', image], 
                                 capture_output=True, check=True)
                    
                # Start infrastructure
                self.log("\nStarting infrastructure services...")
                subprocess.run([
                    'docker-compose', '-f', 'docker/docker-compose.infrastructure.yml',
                    'up', '-d'
                ], capture_output=True, check=True)
                
                self.log("\nSetup complete! φ-Discovery is ready to launch.")
                self.setup_complete = True
                self.status_label.config(text="Setup complete! Ready to launch.")
                self.launch_btn.config(state='normal')
                
            except Exception as e:
                self.log(f"\nError during setup: {str(e)}")
                self.status_label.config(text="Setup failed. Check the log.")
                messagebox.showerror("Setup Error", 
                                   f"Setup failed: {str(e)}\n\n"
                                   "Please check the log for details.")
            finally:
                self.progress.stop()
                self.setup_btn.config(state='normal')
                
        threading.Thread(target=setup, daemon=True).start()
        
    def launch_app(self):
        """Launch the Electron app"""
        self.launch_btn.config(state='disabled')
        self.stop_btn.config(state='normal')
        
        try:
            # Check which launcher to use
            if Path('electron-app/node_modules').exists():
                # Development mode
                os.chdir('electron-app')
                if platform.system() == "Windows":
                    subprocess.Popen(['npm.cmd', 'start'])
                else:
                    subprocess.Popen(['npm', 'start'])
                os.chdir('..')
            else:
                # Production mode - look for built app
                if platform.system() == "Windows":
                    app_path = Path('electron-app/dist/φ-Discovery.exe')
                elif platform.system() == "Darwin":
                    app_path = Path('electron-app/dist/φ-Discovery.app')
                else:
                    app_path = Path('electron-app/dist/φ-Discovery.AppImage')
                    
                if app_path.exists():
                    subprocess.Popen([str(app_path)])
                else:
                    messagebox.showwarning("App Not Built", 
                                         "The desktop app hasn't been built yet.\n\n"
                                         "Run 'npm run build' in the electron-app directory.")
                    
            self.status_label.config(text="φ-Discovery is running")
            self.is_running = True
            
        except Exception as e:
            messagebox.showerror("Launch Error", f"Failed to launch app: {str(e)}")
            self.launch_btn.config(state='normal')
            self.stop_btn.config(state='disabled')
            
    def stop_system(self):
        """Stop the system"""
        self.stop_btn.config(state='disabled')
        self.status_label.config(text="Stopping system...")
        
        def stop():
            try:
                # Stop Docker services
                subprocess.run([
                    'docker-compose', '-f', 'docker/docker-compose.infrastructure.yml',
                    'down'
                ], capture_output=True, check=True)
                
                self.log("System stopped.")
                self.status_label.config(text="System stopped")
                self.launch_btn.config(state='normal')
                
            except Exception as e:
                self.log(f"Error stopping system: {str(e)}")
                
        threading.Thread(target=stop, daemon=True).start()
        
    def run(self):
        """Run the launcher"""
        self.root.mainloop()

if __name__ == "__main__":
    # Change to project root directory
    script_dir = Path(__file__).parent.parent
    os.chdir(script_dir)
    
    # Run launcher
    launcher = PhiDiscoveryLauncher()
    launcher.run()