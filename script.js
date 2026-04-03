// DataForge Pro - script.js v3.0 - BULLETPROOF FAST LOADING
// Removeu TODO loading - GERAÇÃO DIRETA E INSTANTÂNEA

document.addEventListener('DOMContentLoaded', function() {
    // Theme setup
    const theme = localStorage.getItem('dataforge-theme') || 'dark';
    document.body.classList.add(theme + '-theme');
    document.getElementById('themeToggle').checked = theme === 'light';
    
    loadHistory();
    
    // Event listeners
    document.getElementById('generateBtn').onclick = generateAll;
    document.getElementById('clearHistoryBtn').onclick = clearHistory;
    document.getElementById('themeToggle').onchange = toggleTheme;
    document.getElementById('copyAllBtn').onclick = copyAllToClipboard;
    
    // Copy buttons
    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.onclick = () => copyToClipboard(btn.getAttribute('data-copy'));
    });
});

function generateAll() {
    // SEM LOADING - GERA DIRETO E INSTANTÂNEO
    generateCPF();
    generatePassword();
    generateName();
    generateUsername();
    addToHistory();
    
    // Feedback visual simples no botão
    const btn = document.getElementById('generateBtn');
    btn.textContent = '✅ Gerado!';
    btn.classList.add('btn-success');
    setTimeout(() => {
        btn.textContent = '🔥 Gerar Tudo';
        btn.classList.remove('btn-success');
    }, 800);
}

function generateCPF() {
    let cpf = '';
    let sum = 0;
    
    // 9 dígitos
    for (let i = 0; i < 9; i++) {
        const n = Math.floor(Math.random() * 10);
        cpf += n;
        sum += n * (10 - i);
    }
    
    // 1º dígito verificador
    let r = (sum * 10) % 11;
    cpf += r < 2 ? 0 : 11 - r;
    
    // 2º dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
    r = (sum * 10) % 11;
    cpf += r < 2 ? 0 : 11 - r;
    
    document.getElementById('cpfResult').textContent = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function generatePassword() {
    // SENHAS ULTRA FORTES 32+ CHARS - NIST 4+
    const length = 32;
    const special = document.getElementById('includeSpecial').checked;
    
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let pwd = '';
    
    // 4+ de cada tipo
    [lower, upper, nums].forEach(set => {
        for (let i = 0; i < 4; i++) pwd += set[Math.floor(Math.random() * set.length)];
    });
    if (special) {
        for (let i = 0; i < 4; i++) pwd += syms[Math.floor(Math.random() * syms.length)];
    }
    
    // Resto aleatório
    const all = special ? lower+upper+nums+syms : lower+upper+nums;
    while (pwd.length < length) pwd += all[Math.floor(Math.random() * all.length)];
    
    // Shuffle duplo
    pwd = shuffle(pwd);
    pwd = shuffle(pwd);
    
    document.getElementById('passwordResult').textContent = pwd.slice(0, length);
    document.getElementById('passwordStrength').textContent = '🔒 128+ bits';
}

function shuffle(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

function generateName() {
    const first = ['João','Maria','José','Ana','Antonio','Francisco','Paulo','Pedro','Lucas','Gabriel','Rafael','Diego'].random();
    const last = ['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Alves','Pereira','Lima','Gomes','Costa'].random();
    document.getElementById('nameResult').textContent = `${first} ${last}`;
}

function generateUsername() {
    const adj = ['Fast','Deadly','Silent','Rage','Fire','Ice','Shadow','Storm'].random();
    const suf = ['Master','King','God','Pro','Kill','Slayer'].random();
    document.getElementById('usernameResult').textContent = `${adj}${suf}_${Math.floor(Math.random() * 99999)}`;
}

// Polyfill para .random()
Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
};

function copyToClipboard(id) {
    navigator.clipboard.writeText(document.getElementById(id).textContent);
    showToast('✅ Copiado!');
}

function copyAllToClipboard() {
    const text = [
        document.getElementById('cpfResult').textContent,
        document.getElementById('passwordResult').textContent,
        document.getElementById('nameResult').textContent,
        document.getElementById('usernameResult').textContent
    ].join('\n');
    navigator.clipboard.writeText(text);
    showToast('🎉 Tudo copiado!');
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('d-none');
    setTimeout(() => toast.classList.add('d-none'), 2000);
}

function toggleTheme() {
    const isLight = document.getElementById('themeToggle').checked;
    const theme = isLight ? 'light' : 'dark';
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.body.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem('dataforge-theme', theme);
}

// History
function addToHistory() {
    const h = JSON.parse(localStorage.getItem('dataforge-history') || '[]');
    h.unshift({
        t: new Date().toLocaleString('pt-BR'),
        c: document.getElementById('cpfResult').textContent,
        p: document.getElementById('passwordResult').textContent,
        n: document.getElementById('nameResult').textContent,
        u: document.getElementById('usernameResult').textContent
    });
    if (h.length > 20) h.length = 20;
    localStorage.setItem('dataforge-history', JSON.stringify(h));
    renderHistory(h);
}

function loadHistory() { renderHistory(JSON.parse(localStorage.getItem('dataforge-history') || '[]')); }

function renderHistory(h) {
    document.getElementById('historyList').innerHTML = h.map((e,i) => `
        <div class="history-item p-2 border rounded mb-2">
            <div class="d-flex justify-content-between align-items-start">
                <small class="text-muted">${e.t}</small>
                <div>
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="copyHistory(${i})">📋</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="delHistory(${i})">🗑</button>
                </div>
            </div>
            <small class="text-wrap">
                CPF: ${e.c} | ${e.n} | ${e.u} | Senha: ${e.p}
            </small>
        </div>
    `).join('');
}

function copyHistory(i) {
    const h = JSON.parse(localStorage.getItem('dataforge-history') || '[]');
    navigator.clipboard.writeText(Object.values(h[i]).slice(1).join('\n'));
    showToast('Item copiado!');
}

function delHistory(i) {
    const h = JSON.parse(localStorage.getItem('dataforge-history') || '[]');
    h.splice(i, 1);
    localStorage.setItem('dataforge-history', JSON.stringify(h));
    renderHistory(h);
}

function clearHistory() {
    if (confirm('Limpar histórico?')) {
        localStorage.removeItem('dataforge-history');
        document.getElementById('historyList').innerHTML = '';
        showToast('Limpo!');
    }
}
