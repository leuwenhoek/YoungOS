let highestZ = 100;

function openApp(id) {
    const win = document.getElementById('window-' + id);
    win.style.display = 'block';
    focusWindow(win);
    if(id === 'files') refreshFiles();
}

function closeApp(id) { document.getElementById('window-' + id).style.display = 'none'; }

function focusWindow(win) {
    highestZ++;
    win.style.zIndex = highestZ;
}

// DRAG LOGIC
function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = elmnt.querySelector('.window-header');
    header.onmousedown = (e) => {
        e.preventDefault();
        pos3 = e.clientX; pos4 = e.clientY;
        document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
        document.onmousemove = (e) => {
            pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
            pos3 = e.clientX; pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        };
    };
}

document.querySelectorAll('.window').forEach(dragElement);

// FILE OPERATIONS
function refreshFiles() {
    fetch('/api/files').then(res => res.json()).then(data => {
        const list = document.getElementById('file-list');
        list.innerHTML = data.files.map(f => `
            <div class="file-item" onclick="editFile('${f}')">
                <span>📄 ${f}</span>
                <button class="delete-btn" onclick="deleteFile(event, '${f}')">DEL</button>
            </div>
        `).join('');
    });
}

function createNewFile() {
    openApp('creator');
    document.getElementById('save-name').value = '';
    document.getElementById('save-content').value = '';
}

function editFile(name) {
    fetch(`/api/read/${name}`).then(res => res.json()).then(data => {
        openApp('creator');
        document.getElementById('save-name').value = name;
        document.getElementById('save-content').value = data.content;
    });
}

function saveFile() {
    const filename = document.getElementById('save-name').value;
    const content = document.getElementById('save-content').value;
    fetch('/api/save', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({filename, content})
    }).then(() => { refreshFiles(); alert("Deployed."); });
}

function deleteFile(e, name) {
    e.stopPropagation();
    if(confirm("Purge file?")) {
        fetch(`/api/delete/${name}`, {method: 'DELETE'}).then(() => refreshFiles());
    }
}

// TERMINAL
const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('term-output');
termInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        const cmd = termInput.value;
        termOutput.innerHTML += `<div>$ ${cmd}</div>`;
        fetch('/api/terminal', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({command: cmd})
        }).then(res => res.json()).then(data => {
            termOutput.innerHTML += `<div style="color:#888">${data.output.replace(/\n/g, '<br>')}</div>`;
            termInput.value = '';
            termOutput.parentElement.scrollTop = termOutput.parentElement.scrollHeight;
        });
    }
});

setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString(); }, 1000);