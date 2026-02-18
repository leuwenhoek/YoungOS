let highestZ = 100;
const MASTER_PIN = "1234";

// DRAGGING ENGINE
function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = elmnt.querySelector('.window-header');
    header.onmousedown = (e) => {
        e.preventDefault();
        focusWindow(elmnt);
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

// WINDOWS
function openApp(id) {
    const win = document.getElementById('window-' + id);
    win.style.display = 'block';
    focusWindow(win);
    if(id === 'files') refreshFiles();
}
function closeApp(id) { document.getElementById('window-' + id).style.display = 'none'; }
function focusWindow(win) { highestZ++; win.style.zIndex = highestZ; }

// AUTH
function checkPin() {
    const input = document.getElementById('pin-input');
    const screen = document.getElementById('lock-screen');
    const box = document.querySelector('.lock-box');
    if (input.value === MASTER_PIN) {
        screen.classList.add('unlocked');
        sessionStorage.setItem('os_unlocked', 'true');
        setTimeout(() => screen.style.display = 'none', 600);
    } else {
        box.style.animation = "shake 0.3s ease";
        input.value = '';
        document.getElementById('lock-error').style.display = 'block';
        setTimeout(() => box.style.animation = "", 300);
    }
}

// TERMINAL
const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('term-output');

termInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        const cmd = termInput.value;
        
        // Add user command to display
        termOutput.innerHTML += `<div class="user-line">> ${cmd}</div>`;
        
        fetch('/api/terminal', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({command: cmd})
        })
        .then(res => res.json())
        .then(data => {
            // Special handler for 'clear'
            if (data.output === "CLEAR_SIGNAL") {
                termOutput.innerHTML = "YoungOS Terminal Reset.";
            } else {
                termOutput.innerHTML += `<div class="sys-line">${data.output.replace(/\n/g, '<br>')}</div>`;
            }
            
            termInput.value = '';
            // Auto-scroll to bottom
            termOutput.parentElement.scrollTop = termOutput.parentElement.scrollHeight;
        });
    }
});

// FILES
function refreshFiles() {
    fetch('/api/files').then(res => res.json()).then(data => {
        const list = document.getElementById('file-list');
        list.innerHTML = data.files.map(f => `
            <div class="file-item" style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid var(--border); cursor:pointer;" onclick="editFile('${f}')">
                <span>📄 ${f}</span>
                <button style="background:none; border:1px solid var(--error); color:var(--error); cursor:pointer;" onclick="deleteFile(event, '${f}')">DEL</button>
            </div>`).join('');
    });
}
function saveFile() {
    const filename = document.getElementById('save-name').value;
    const content = document.getElementById('save-content').value;
    fetch('/api/save', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({filename, content})}).then(() => refreshFiles());
}
function editFile(name) {
    fetch(`/api/read/${name}`).then(res => res.json()).then(data => {
        openApp('creator');
        document.getElementById('save-name').value = name;
        document.getElementById('save-content').value = data.content;
    });
}
function deleteFile(e, name) {
    e.stopPropagation();
    fetch(`/api/delete/${name}`, {method: 'DELETE'}).then(() => refreshFiles());
}
function createNewFile() { openApp('creator'); document.getElementById('save-name').value = ''; document.getElementById('save-content').value = ''; }

// BROWSER
function navigateWeb() { document.getElementById('browser-iframe').src = document.getElementById('browser-url').value; }

// INIT
window.onload = () => {
    if (sessionStorage.getItem('os_unlocked') === 'true') document.getElementById('lock-screen').style.display = 'none';
    setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString(); }, 1000);
};
document.getElementById('pin-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') checkPin(); });