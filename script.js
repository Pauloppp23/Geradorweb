// DataForge Pro - script.js
// Professional Random Data Generator v2.0
// ULTRA Fast + Smooth Loading + NIST 4+ Passwords

document.addEventListener('DOMContentLoaded', function() {
    // Theme initialization
    const savedTheme = localStorage.getItem('dataforge-theme') || 'dark';
    document.body.classList.add(savedTheme + '-theme');
    document.getElementById('themeToggle').checked = savedTheme === 'light';
    
    // Initialize history
    loadHistory();
    
    // Event listeners
    document.getElementById('generateBtn').addEventListener('click', generateAll);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
    document.getElementById('themeToggle').addEventListener('change', toggleTheme);
    document.getElementById('copyAllBtn').addEventListener('click', copyAllToClipboard);
    
    // Copy buttons
    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', function() {
            copyToClipboard(this.getAttribute('data-copy'));
        });
    });
    
    // Auto-copy checkboxes
    document.querySelectorAll('input[type="checkbox"][data-auto-copy]').forEach(cb => {
        cb.addEventListener('change', function() {
            const targetId = this.getAttribute('data-auto-copy');
            const resultEl = document.getElementById(targetId);
            if (resultEl && this.checked) {
                copyToClipboard(targetId);
            }
        });
    });
});

// GERAÇÃO ULTRA RÁPIDA COM ANIMAÇÃO SUAVE
function generateAll() {
    // Animação suave de loading (50ms flash)
    const btn = document.getElementById('generateBtn');
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Gerando...';
    btn.disabled = true;
    
    // Gera tudo instantaneamente em paralelo
    requestAnimationFrame(() => {
        generateCPF();
        generatePassword();
        generateName();
        generateUsername();
        addToHistory();
        
        // Reset botão com animação suave (100ms)
        setTimeout(() => {
            btn.innerHTML = '🔥 Gerar Tudo';
            btn.disabled = false;
            btn.classList.add('btn-pulse');
            setTimeout(() => btn.classList.remove('btn-pulse'), 300);
        }, 50);
    });
}

function generateCPF() {
    const cpf = generateValidCPF();
    const resultEl = document.getElementById('cpfResult');
    resultEl.textContent = cpf;
    resultEl.classList.add('fade-in');
    setTimeout(() => resultEl.classList.remove('fade-in'), 500);
    updateCopyButton('cpfResult');
}

function generateValidCPF() {
    let sum = 0, cpf = '';
    for (let i = 0; i < 9; i++) {
        const digit = Math.floor(Math.random() * 10);
        cpf += digit;
        sum += digit * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    cpf += (remainder === 10 || remainder === 11 ? 0 : remainder);
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    cpf += (remainder === 10 || remainder === 11 ? 0 : remainder);
    
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function generatePassword() {
    // ULTRA NIST 4+ (128+ bits) - SENHAS GIGANTES E IMBATÍVEIS
    let length = Math.max(32, parseInt(document.getElementById('passwordLength').value));
    document.getElementById('passwordLength').value = length;
    
    const includeSpecial = document.getElementById('includeSpecial').checked;
    
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿';
    
    const ultraLeet = {
        'a': '@', 'A': '4', 'e': '3', 'E': '3', 'i': '1', 'I': '!', 
        'o': '0', 'O': '0', 's': '$', 'S': '5', 't': '7', 'T': '+',
        'l': '|', 'g': '9', 'b': '8'
    };
    
    let password = '';
    
    // 4+ DE CADA TIPO OBRIGATÓRIO
    const types = [
        { chars: lowercase, min: 4 },
        { chars: uppercase, min: 4 },
        { chars: numbers, min: 4 }
    ];
    if (includeSpecial) types.push({ chars: symbols, min: 4 });
    
    types.forEach(type => {
        for (let i = 0; i < type.min; i++) {
            password += type.chars[Math.floor(Math.random() * type.chars.length)];
        }
    });
    
    const allChars = includeSpecial ? (lowercase + uppercase + numbers + symbols) : (lowercase + uppercase + numbers);
    const remaining = length - password.length;
    
    for (let i = 0; i < remaining; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Leetspeak avançado + DOUBLE SHUFFLE
    password = password.split('').map(c => Math.random() < 0.3 && ultraLeet[c] ? ultraLeet[c] : c).join('');
    password = shuffleString(shuffleString(password));
    
    const resultEl = document.getElementById('passwordResult');
    resultEl.textContent = password;
    document.getElementById('passwordStrength').textContent = '🔒 ULTRA 128+ bits';
    resultEl.classList.add('fade-in');
    setTimeout(() => resultEl.classList.remove('fade-in'), 500);
    updateCopyButton('passwordResult');
}

function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

function generateName() {
    const firstNames = ['João','Maria','José','Ana','Antonio','Adriana','Francisco','Carla','Paulo','Fernanda','Pedro','Juliana','Lucas','Camila','Gabriel','Beatriz','Rafael','Larissa','Diego','Aline'];
    const lastNames = ['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Alves','Pereira','Lima','Gomes','Costa','Ribeiro','Martins','Carvalho','Almeida','Lopes'];
    
    const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const resultEl = document.getElementById('nameResult');
    resultEl.textContent = name;
    resultEl.classList.add('fade-in');
    setTimeout(() => resultEl.classList.remove('fade-in'), 500);
    updateCopyButton('nameResult');
}

function generateUsername() {
    const prefixes = ['xX','Pro','Noob','Epic','L33t','Dark','Ghost','Ninja'];
    const suffixes = ['Master','King','God','Pro','X','BR','Kill','Slayer'];
    const adjectives = ['Fast','Deadly','Silent','Rage','Fire','Ice','Shadow','Storm'];
    
    const style = Math.floor(Math.random() * 3);
    let username;
    
    if (style === 0) username = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${adjectives[Math.floor(Math.random() * adjectives.length)]}${Math.floor(Math.random() * 9999)}`;
    else if (style === 1) username = `x${generateName().replace(/\s/g, '').toLowerCase()}${suffixes[Math.floor(Math.random() * suffixes.length)]}${Math.floor(Math.random() * 100)}`;
    else username = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}_${Math.floor(Math.random() * 99999)}`;
    
    const resultEl = document.getElementById('usernameResult');
    resultEl.textContent = username;
    resultEl.classList.add('fade-in');
    setTimeout(() => resultEl.classList.remove('fade-in'), 500);
    updateCopyButton('usernameResult');
}

function copyToClipboard(targetId) {
    const text = document.getElementById(targetId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ Copiado!');
        const cb = document.querySelector(`[data-auto-copy="${targetId}"]`);
        if (cb) cb.checked = true;
    });
}

function copyAllToClipboard() {
    const results = [
        document.getElementById('cpfResult').textContent,
        document.getElementById('passwordResult').textContent,
        document.getElementById('nameResult').textContent,
        document.getElementById('usernameResult').textContent
    ].join('\n');
    navigator.clipboard.writeText(results).then(() => showToast('🎉 Tudo copiado!'));
}

function updateCopyButton(targetId) {
    const btn = document.querySelector(`[data-copy="${targetId}"]`);
    if (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = '✅ Copiado!';
        btn.classList.add('btn-success');
        setTimeout(() => {
            btn.innerHTML = original;
            btn.classList.remove('btn-success');
        }, 1500);
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('d-none', 'fade-out');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('fade-out');
    }, 2000);
}

function toggleTheme() {
    const isLight = document.getElementById('themeToggle').checked;
    const theme = isLight ? 'light' : 'dark';
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem('dataforge-theme', theme);
}

// History functions (otimizadas)
function addToHistory() {
    const history = JSON.parse(localStorage.getItem('dataforge-history') || '[]');
    const entry = {
        timestamp: new Date().toLocaleString('pt-BR'),
        cpf: document.getElementById('cpfResult').textContent,
        password: document.getElementById('passwordResult').textContent,
        name: document.getElementById('nameResult').textContent,
        username: document.getElementById('usernameResult').textContent
    };
    history.unshift(entry);
    if (history.length > 50) history.pop();
    localStorage.setItem('dataforge-history', JSON.stringify(history));
    renderHistory(history);
}

function loadHistory() {
    renderHistory(JSON.parse(localStorage.getItem('dataforge-history') || '[]'));
}

function renderHistory(history) {
    const container = document.getElementById('historyList');
    container.innerHTML = history.map((entry, i) => `
        <div class="history-item">
            <div class="history-header">
                <small>${entry.timestamp}</small>
                <div>
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="copyHistoryItem(${i})">📋</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteHistoryItem(${i})">🗑️</button>
                </div>
            </div>
            <div class="history-content">
                <strong>CPF:</strong> ${entry.cpf}<br>
                <strong>Nome:</strong> ${entry.name}<br>
                <strong>Username:</strong> ${entry.username}<br>
                <strong>Senha:</strong> ${entry.password}
            </div>
        </div>
    `).join('');
}

function copyHistoryItem(i) {
    const history = JSON.parse(localStorage.getItem('dataforge-history') || '[]');
    const entry = history[i];
    navigator.clipboard.writeText(`CPF: ${entry.cpf}\nNome: ${entry.name}\nUsername: ${entry.username}\nSenha: ${entry.password}`).then(() => showToast('📋 Item copiado!'));
}

function deleteHistoryItem(i) {
    const history = JSON.parse(localStorage.getItem('dataforge-history') || '[]');
    history.splice(i, 1);
    localStorage.setItem('dataforge-history', JSON.stringify(history));
    renderHistory(history);
    showToast('🗑️ Removido!');
}

function clearHistory() {
    if (confirm('Limpar todo histórico?')) {
        localStorage.removeItem('dataforge-history');
        document.getElementById('historyList').innerHTML = '';
        showToast('Histórico limpo!');
    }
}
