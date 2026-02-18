import datetime
from flask import Flask, render_template, jsonify, request
import os
import subprocess

app = Flask(__name__)

# Virtual Drive Setup
STORAGE = os.path.abspath("./os_storage")
if not os.path.exists(STORAGE):
    os.makedirs(STORAGE)

@app.route('/')
def boot():
    return render_template('index.html')

@app.route('/api/files', methods=['GET'])
def list_files():
    files = os.listdir(STORAGE)
    return jsonify({"status": "success", "files": files})

@app.route('/api/read/<filename>', methods=['GET'])
def read_file(filename):
    try:
        path = os.path.join(STORAGE, filename)
        with open(path, "r") as f:
            content = f.read()
        return jsonify({"status": "success", "content": content})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/api/save', methods=['POST'])
def save_file():
    data = request.json
    filename = data.get('filename')
    content = data.get('content', '')
    if not filename: return jsonify({"status": "error", "message": "Filename missing."})
    path = os.path.join(STORAGE, filename)
    with open(path, "w") as f:
        f.write(content)
    return jsonify({"status": "success", "message": f"{filename} deployed."})

@app.route('/api/delete/<filename>', methods=['DELETE'])
def delete_file(filename):
    try:
        path = os.path.join(STORAGE, filename)
        if os.path.exists(path):
            os.remove(path)
            return jsonify({"status": "success"})
        return jsonify({"status": "error", "message": "Not found."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


@app.route('/api/terminal', methods=['POST'])
def terminal():
    user_input = request.json.get('command', '').lower().strip()
    
    if user_input == "help":
        output = """AVAILABLE COMMANDS:
  > help      - Display this directory
  > neofetch  - System statistics & branding
  > ping      - Test kernel latency
  > date      - Check system timeline
  > matrix    - Enter the simulation
  > clear     - Reset terminal buffer
  > whoami    - Display user clearance"""

    elif user_input == "neofetch":
        output = """
   __ __                     ____  _____
  / // /__  __ _____  ___ _ / __ \/ ___/
 / _  / _ \/ // / _ \/ _ `// /_/ /\__ \ 
/_//_/\___/\_,_/_//_/\_, / \____/____/  
                    /___/               
----------------------------------------
OS: YoungOS v2.1.0 2026 Edition
KERNEL: Indie-Core 1.0.4-stable
SHELL: Custom Virtual Bash
UPTIME: 1 hour, 42 mins
PACKAGES: 42 (pip), 12 (npm)
IDE: Forge Editor
----------------------------------------"""

    elif user_input == "ping":
        output = "64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.004 ms\nKernel Status: Healthy."

    elif user_input == "date":
        now = datetime.datetime.now()
        output = now.strftime("%A, %B %d, %Y - %H:%M:%S")

    elif user_input == "whoami":
        output = "ARCHITECT_01\nClearance: Level Red\nHome: /root/youngos"

    elif user_input == "matrix":
        output = "Searching for the rabbit... [ERROR] Simulation locked. Please try again later."

    elif user_input == "clear":
        output = "CLEAR_SIGNAL"

    else:
        output = f"Unknown Command: '{user_input}'. Type 'help' for the list of custom commands."

    return jsonify({"status": "success", "output": output})

if __name__ == '__main__':
    app.run(debug=True, port=5000)