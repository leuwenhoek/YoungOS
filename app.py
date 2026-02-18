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
    if not filename: return jsonify({"status": "error", "message": "Filename required"})
    
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
        return jsonify({"status": "error", "message": "Not found"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/api/terminal', methods=['POST'])
def terminal():
    command = request.json.get('command')
    try:
        output = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT, timeout=5)
        return jsonify({"status": "success", "output": output.decode('utf-8')})
    except Exception as e:
        error = getattr(e, 'output', str(e))
        if isinstance(error, bytes): error = error.decode('utf-8')
        return jsonify({"status": "error", "output": error})

if __name__ == '__main__':
    app.run(debug=True, port=5000)