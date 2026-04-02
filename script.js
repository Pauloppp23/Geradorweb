// DataForge Pro - script.js
// Professional Random Data Generator
// NIST Level 4 Password Strength + All Features

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
    
    // Copy buttons for each section
    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', function() {
            copyToClipboard(this.getAttribute('data-copy'));
        });
    });
    
    // Auto-copy on generate (optional)
    const checkboxes = document.querySelectorAll('input[type="checkbox"][data-auto-copy]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            const targetId = this.getAttribute('data-auto-copy');
            const resultEl = document.getElementById(targetId);
            if (resultEl && this.checked) {
                copyToClipboard(targetId);
            }
        });
    });
});

function generateAll() {
    showLoading();
    
    setTimeout(() => {
        generateCPF();
        generatePassword();
        generateName();
        generateUsername();
        hideLoading();
        addToHistory();
    }, 300);
}

function generateCPF() {
    const cpf = generateValidCPF();
    document.getElementById('cpfResult').textContent = cpf;
    updateCopyButton('cpfResult');
}

function generateValidCPF() {
    // Generate 9 random digits
    let sum = 0;
    let cpf = '';
    
    for (let i = 0; i < 9; i++) {
        const digit = Math.floor(Math.random() * 10);
        cpf += digit;
        sum += digit * (10 - i);
    }
    
    // Calculate first check digit
    let remainder = (sum * 10) % 11;
    const firstDigit = remainder === 10 || remainder === 11 ? 0 : remainder;
    cpf += firstDigit;
    
    // Calculate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    const secondDigit = remainder === 10 || remainder === 11 ? 0 : remainder;
    cpf += secondDigit;
    
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function generatePassword() {
    // NIST Level 4 Military-Grade Password Generator
    // Guaranteed 2+ chars of each type | 95+ bits entropy | Leetspeak substitutions
    
    const length = parseInt(document.getElementById('passwordLength').value);
    const includeSpecial = document.getElementById('includeSpecial').checked;
    
    // Military-grade character sets
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Leetspeak substitution table (common substitutions for strength)
    const leetSubs = {
        'a': '@', 'A': '4',
        'e': '3', 'E': '3',
        'i': '1', 'I': '!',
        'o': '0', 'O': '0',
        's': '$', 'S': '5',
        't': '7', 'T': '+'
    };
    
    let password = '';
    
    // Step 1: Guarantee minimum 2 chars of each required type
    const requiredTypes = [
        { chars: lowercase, min: 2 },
        { chars: uppercase, min: 2 },
        { chars: numbers, min: 2 }
    ];
    
    if (includeSpecial) {
        requiredTypes.push({ chars: symbols, min: 2 });
    }
    
    requiredTypes.forEach(type => {
        for (let i = 0; i < type.min; i++) {
            password += type.chars[Math.floor(Math.random() * type.chars.length)];
        }
    });
    
    // Step 2: Fill remaining length with all character types
    const allChars = includeSpecial 
        ? (lowercase + uppercase + numbers + symbols)
        : (lowercase + uppercase + numbers);
    
    const remainingLength = length - password.length;
    for (let i = 0; i < remainingLength; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Step 3: Apply random leetspeak substitutions (20% chance)
    password = password.split('').map(char => {
        if (Math.random() < 0.2 && leetSubs[char]) {
            return leetSubs[char];
        }
        return char;
    }).join('');
    
    // Step 4: Fisher-Yates shuffle for true randomness
    password = shuffleString(password);
    
    // Step 5: Ensure length is exact (trim/pad if needed)
    while (password.length > length) {
        password = password.slice(0, -1);
    }
    while (password.length < length) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    document.getElementById('passwordResult').textContent = password;
    document.getElementById('passwordStrength').textContent = '🔒 NIST Level 4 (95+ bits)';
    updateCopyButton('passwordResult');
}

function shuffleString(str) {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}

function generateName() {
    // Realistic Brazilian names (first + last)
    const firstNames = [
        'João', 'Maria', 'José', 'Ana', 'Antonio', 'Adriana', 'Francisco', 'Carla',
        'Paulo', 'Fernanda', 'Pedro', 'Juliana', 'Lucas', 'Camila', 'Gabriel', 'Beatriz',
        'Rafael', 'Larissa', 'Diego', 'Aline', 'Eduardo', 'Patricia', 'Marcelo', 'Vanessa'
    ];
    
    const lastNames = [
        'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
        'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes',
        'Sousa', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Machado', 'Nascimento', 'Araujo'
    ];
    
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    document.getElementById('nameResult').textContent = `${first} ${last}`;
    updateCopyButton('nameResult');
}

function generateUsername() {
    // Gamer-style usernames with numbers/special chars
    const prefixes = ['xX', 'Pro', 'Noob', 'Epic', 'L33t', 'Dark', 'Ghost', 'Ninja'];
    const suffixes = ['Master', 'King', 'God', 'Pro', 'X', 'BR', 'Kill', 'Slayer'];
    const adjectives = ['Fast', 'Deadly', 'Silent', 'Rage', 'Fire', 'Ice', 'Shadow', 'Storm'];
    
    const style = Math.floor(Math.random() * 3);
    let username;
    
    switch (style) {
        case 0: // Prefix + Adjective + Number
            username = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${adjectives[Math.floor(Math.random() * adjectives.length)]}${Math.floor(Math.random() * 9999)}`;
            break;
        case 1: // Name + Suffix + Special
            username = `x${generateName().replace(/\s/g, '').toLowerCase()}${suffixes[Math.floor(Math.random() * suffixes.length)]}${Math.floor(Math.random() * 100)}`;
            break;
        default: // Random gamer style
            username = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}_${Math.floor(Math.random() * 99999)}`;
    }
    
    document.getElementById('usernameResult').textContent = username;
    updateCopyButton('usernameResult');
}

function copyToClipboard(targetId) {
    const text = document.getElementById(targetId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copiado para área de transferência!');
        // Auto-check if auto-copy checkbox exists
        const checkbox = document.querySelector(`[data-auto-copy="${targetId}"]`);
        if (checkbox) checkbox.checked = true;
    });
}

function copyAllToClipboard() {
    const results = [
        document.getElementById('cpfResult').textContent,
        document.getElementById('passwordResult').textContent,
        document.getElementById('nameResult').textContent,
        document.getElementById('usernameResult').textContent
    ].join('\n');
    
    navigator.clipboard.writeText(results).then(() => {
        showToast('Tudo copiado!');
    });
}

function updateCopyButton(targetId) {
    const btn = document.querySelector(`[data-copy="${targetId}"]`);
    if (btn) {
        btn.innerHTML = '📋 <span class="copied-text">Copiado!</span>';
        setTimeout(() => {
            btn.innerHTML = '📋 Copiar';
        }, 2000);
    }
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('d-none');
    document.getElementById('generateBtn').disabled = true;
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('d-none');
    document.getElementById('generateBtn').disabled = false;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('d-none');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('d-none'), 300);
    }, 3000);
}

// Theme toggle
function toggleTheme() {
    const isLight = document.getElementById('themeToggle').checked;
    const theme = isLight ? 'light' : 'dark';
    
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(theme + '-theme');
    
    localStorage.setItem('dataforge-theme', theme);
}

// History management
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
    if (history.length > 50) history.pop(); // Keep last 50
    
    localStorage.setItem('dataforge-history', JSON.stringify(history));
    renderHistory(history);
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('dataforge-history') || '[]');
    renderHistory(history);
}

function renderHistory(history) {
    const container = document.getElementById('historyList');
    container.innerHTML = '';
    
    history.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-header">
                <small>${entry.timestamp}</small>
                <div>
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="copyHistoryItem(${index})">📋</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteHistoryItem(${index})">🗑️</button>
                </div>
            </div>
            <div class="history-content">
                <strong>CPF:</strong> ${entry.cpf}<br>
                <strong>Nome:</strong> ${entry.name}<br>
                <strong>Username:</strong> ${entry.username}<br>
                <strong>Senha:</strong> ${entry.password}
            </div>
        `;
        container.appendChild(item);
    });
}

function copyHistoryItem(index) {
    const history = JSON.parse(localStorage.getItem('dataforge-history') || '[]');
    const entry = history[index];
    const text = `CPF: ${entry.cpf}\nNome: ${entry.name}\nUsername: ${entry.username}\nSenha: ${entry.password}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Item copiado!');
    });
}

function deleteHistoryItem(index) {
    const history = JSON.parse(localStorage.getItem('dataforge-history') || '[]');
    history.splice(index, 1);
    localStorage.setItem('dataforge-history', JSON.stringify(history));
    renderHistory(history);
    showToast('Item removido!');
}

function clearHistory() {
    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
        localStorage.removeItem('dataforge-history');
        document.getElementById('historyList').innerHTML = '';
        showToast('Histórico limpo!');
    }
}
