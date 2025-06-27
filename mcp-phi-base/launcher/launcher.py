#!/usr/bin/env python3
"""
φ-Discovery System Launcher
A beautiful GUI launcher for the mathematical discovery system
"""

import tkinter as tk
from tkinter import ttk, messagebox
import subprocess
import threading
import os
import sys
import json
import webbrowser
from pathlib import Path

class PhiDiscoveryLauncher:
    def __init__(self, root):
        self.root = root
        self.root.title("φ-Discovery System")
        self.root.geometry("600x500")
        self.root.resizable(False, False)
        
        # Set dark theme colors
        self.bg_color = "#0a192f"
        self.fg_color = "#e6f1ff"
        self.accent_color = "#FFD700"
        self.button_bg = "#172a45"
        self.success_color = "#64ffda"
        self.error_color = "#ff6b6b"
        
        self.root.configure(bg=self.bg_color)
        
        # System state
        self.is_running = False
        self.check_system_status()
        
        # Create UI
        self.create_widgets()
        
        # Start status monitoring
        self.monitor_status()
        
    def create_widgets(self):
        # Title
        title_frame = tk.Frame(self.root, bg=self.bg_color)
        title_frame.pack(pady=20)
        
        title_label = tk.Label(
            title_frame,
            text="φ-Discovery System",
            font=("Arial", 24, "bold"),
            bg=self.bg_color,
            fg=self.accent_color
        )
        title_label.pack()
        
        subtitle_label = tk.Label(
            title_frame,
            text="Mathematical Discovery with AI",
            font=("Arial", 12),
            bg=self.bg_color,
            fg=self.fg_color
        )
        subtitle_label.pack()
        
        # Status indicator
        self.status_frame = tk.Frame(self.root, bg=self.bg_color)
        self.status_frame.pack(pady=10)
        
        self.status_dot = tk.Canvas(
            self.status_frame,
            width=20,
            height=20,
            bg=self.bg_color,
            highlightthickness=0
        )
        self.status_dot.pack(side=tk.LEFT, padx=5)
        
        self.status_label = tk.Label(
            self.status_frame,
            text="System Stopped",
            font=("Arial", 12),
            bg=self.bg_color,
            fg=self.fg_color
        )
        self.status_label.pack(side=tk.LEFT)
        
        # Main control buttons
        button_frame = tk.Frame(self.root, bg=self.bg_color)
        button_frame.pack(pady=30)
        
        self.start_button = self.create_button(
            button_frame,
            text="Start System",
            command=self.start_system,
            width=20
        )
        self.start_button.pack(pady=5)
        
        self.stop_button = self.create_button(
            button_frame,
            text="Stop System",
            command=self.stop_system,
            width=20,
            state="disabled"
        )
        self.stop_button.pack(pady=5)
        
        # Quick actions
        actions_frame = tk.Frame(self.root, bg=self.bg_color)
        actions_frame.pack(pady=20)
        
        actions_label = tk.Label(
            actions_frame,
            text="Quick Actions",
            font=("Arial", 14, "bold"),
            bg=self.bg_color,
            fg=self.fg_color
        )
        actions_label.pack(pady=10)
        
        actions_buttons = tk.Frame(actions_frame, bg=self.bg_color)
        actions_buttons.pack()
        
        self.create_button(
            actions_buttons,
            text="Open Web Interface",
            command=self.open_web_interface,
            width=15
        ).grid(row=0, column=0, padx=5, pady=5)
        
        self.create_button(
            actions_buttons,
            text="View Logs",
            command=self.view_logs,
            width=15
        ).grid(row=0, column=1, padx=5, pady=5)
        
        self.create_button(
            actions_buttons,
            text="Documentation",
            command=self.open_docs,
            width=15
        ).grid(row=1, column=0, padx=5, pady=5)
        
        self.create_button(
            actions_buttons,
            text="Settings",
            command=self.open_settings,
            width=15
        ).grid(row=1, column=1, padx=5, pady=5)
        
        # Log output
        log_frame = tk.Frame(self.root, bg=self.bg_color)
        log_frame.pack(pady=10, padx=20, fill=tk.BOTH, expand=True)
        
        log_label = tk.Label(
            log_frame,
            text="System Output",
            font=("Arial", 10),
            bg=self.bg_color,
            fg=self.fg_color
        )
        log_label.pack(anchor=tk.W)
        
        # Create text widget with scrollbar
        log_container = tk.Frame(log_frame, bg=self.bg_color)
        log_container.pack(fill=tk.BOTH, expand=True)
        
        scrollbar = tk.Scrollbar(log_container)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.log_text = tk.Text(
            log_container,
            height=8,
            bg="#112240",
            fg=self.fg_color,
            font=("Consolas", 9),
            wrap=tk.WORD,
            yscrollcommand=scrollbar.set
        )
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.log_text.yview)
        
        # Footer
        footer = tk.Label(
            self.root,
            text="✨ Mathematics discovers itself through φ-recursive topology",
            font=("Arial", 9, "italic"),
            bg=self.bg_color,
            fg=self.fg_color
        )
        footer.pack(side=tk.BOTTOM, pady=10)
        
    def create_button(self, parent, text, command, width=10, state="normal"):
        """Create a styled button"""
        button = tk.Button(
            parent,
            text=text,
            command=command,
            width=width,
            bg=self.button_bg,
            fg=self.fg_color,
            font=("Arial", 10),
            relief=tk.FLAT,
            cursor="hand2",
            state=state,
            activebackground=self.accent_color,
            activeforeground=self.bg_color
        )
        
        # Hover effects
        def on_enter(e):
            if button["state"] == "normal":
                button["bg"] = self.accent_color
                button["fg"] = self.bg_color
                
        def on_leave(e):
            button["bg"] = self.button_bg
            button["fg"] = self.fg_color
            
        button.bind("<Enter>", on_enter)
        button.bind("<Leave>", on_leave)
        
        return button
        
    def log(self, message, level="info"):
        """Add message to log output"""
        self.log_text.insert(tk.END, f"{message}\n")
        self.log_text.see(tk.END)
        
        # Color based on level
        if level == "success":
            self.log_text.tag_add("success", f"end-2l", "end-1l")
            self.log_text.tag_config("success", foreground=self.success_color)
        elif level == "error":
            self.log_text.tag_add("error", f"end-2l", "end-1l")
            self.log_text.tag_config("error", foreground=self.error_color)
            
    def update_status(self, running):
        """Update status indicator"""
        self.is_running = running
        
        if running:
            color = self.success_color
            text = "System Running"
            self.start_button.config(state="disabled")
            self.stop_button.config(state="normal")
        else:
            color = self.error_color
            text = "System Stopped"
            self.start_button.config(state="normal")
            self.stop_button.config(state="disabled")
            
        # Update status dot
        self.status_dot.delete("all")
        self.status_dot.create_oval(5, 5, 15, 15, fill=color, outline="")
        self.status_label.config(text=text)
        
    def check_system_status(self):
        """Check if system is currently running"""
        try:
            result = subprocess.run(
                ["docker", "stack", "ls"],
                capture_output=True,
                text=True,
                check=True
            )
            self.is_running = "phi_discovery" in result.stdout
        except:
            self.is_running = False
            
    def monitor_status(self):
        """Periodically check system status"""
        self.check_system_status()
        self.update_status(self.is_running)
        self.root.after(5000, self.monitor_status)  # Check every 5 seconds
        
    def start_system(self):
        """Start the φ-Discovery system"""
        self.log("Starting φ-Discovery System...")
        
        def run_start():
            try:
                # Deploy Docker stack
                subprocess.run(
                    ["docker", "stack", "deploy", "-c", "docker-compose.betti.yml", "phi_discovery"],
                    check=True
                )
                self.log("Docker services deployed", "success")
                
                # Start web interface
                os.chdir("web-interface")
                subprocess.Popen(["npm", "start"])
                os.chdir("..")
                self.log("Web interface started", "success")
                
                self.log("System started successfully!", "success")
                self.root.after(0, lambda: self.update_status(True))
                
                # Open web interface after delay
                self.root.after(3000, self.open_web_interface)
                
            except Exception as e:
                self.log(f"Error starting system: {str(e)}", "error")
                self.root.after(0, lambda: self.update_status(False))
                
        thread = threading.Thread(target=run_start)
        thread.daemon = True
        thread.start()
        
    def stop_system(self):
        """Stop the φ-Discovery system"""
        self.log("Stopping φ-Discovery System...")
        
        def run_stop():
            try:
                # Remove Docker stack
                subprocess.run(
                    ["docker", "stack", "rm", "phi_discovery"],
                    check=True
                )
                self.log("Docker services stopped", "success")
                
                # Stop Node.js servers
                if sys.platform == "win32":
                    subprocess.run(["taskkill", "/F", "/IM", "node.exe"], check=False)
                else:
                    subprocess.run(["pkill", "-f", "node.*server.js"], check=False)
                    
                self.log("System stopped successfully!", "success")
                self.root.after(0, lambda: self.update_status(False))
                
            except Exception as e:
                self.log(f"Error stopping system: {str(e)}", "error")
                
        thread = threading.Thread(target=run_stop)
        thread.daemon = True
        thread.start()
        
    def open_web_interface(self):
        """Open the web interface in browser"""
        webbrowser.open("http://localhost:3000")
        self.log("Opening web interface...")
        
    def view_logs(self):
        """View Docker service logs"""
        self.log("Fetching service logs...")
        
        def fetch_logs():
            try:
                result = subprocess.run(
                    ["docker", "service", "logs", "--tail", "50", "phi_discovery_transform_logger"],
                    capture_output=True,
                    text=True
                )
                if result.stdout:
                    self.log("\n--- Service Logs ---")
                    for line in result.stdout.split("\n")[-20:]:
                        if line.strip():
                            self.log(line)
                else:
                    self.log("No logs available", "error")
            except Exception as e:
                self.log(f"Error fetching logs: {str(e)}", "error")
                
        thread = threading.Thread(target=fetch_logs)
        thread.daemon = True
        thread.start()
        
    def open_docs(self):
        """Open documentation"""
        readme_path = Path("README.md")
        if readme_path.exists():
            if sys.platform == "win32":
                os.startfile(readme_path)
            else:
                subprocess.run(["open" if sys.platform == "darwin" else "xdg-open", readme_path])
        else:
            messagebox.showinfo("Documentation", "README.md not found")
            
    def open_settings(self):
        """Open settings window"""
        settings_window = tk.Toplevel(self.root)
        settings_window.title("Settings")
        settings_window.geometry("400x300")
        settings_window.configure(bg=self.bg_color)
        
        # Settings content
        tk.Label(
            settings_window,
            text="Environment Settings",
            font=("Arial", 14, "bold"),
            bg=self.bg_color,
            fg=self.accent_color
        ).pack(pady=10)
        
        # Load .env file
        env_frame = tk.Frame(settings_window, bg=self.bg_color)
        env_frame.pack(padx=20, pady=10)
        
        if Path(".env").exists():
            with open(".env", "r") as f:
                env_content = f.read()
                
            env_text = tk.Text(
                env_frame,
                height=10,
                bg="#112240",
                fg=self.fg_color,
                font=("Consolas", 9)
            )
            env_text.pack()
            env_text.insert("1.0", env_content)
        else:
            tk.Label(
                env_frame,
                text="No .env file found",
                bg=self.bg_color,
                fg=self.error_color
            ).pack()
            
def main():
    root = tk.Tk()
    app = PhiDiscoveryLauncher(root)
    root.mainloop()

if __name__ == "__main__":
    main()