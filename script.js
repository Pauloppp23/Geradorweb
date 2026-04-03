// NeoForge AI - Core Engine v1.0
class NeoForge {
    constructor() {
        this.init();
        this.bindEvents();
        this.loadSettings();
    }

    init() {
        // Loading animation
        setTimeout(() => {
            document.getElementById('loadingScreen').style.opacity = '0';
            setTimeout(() => document.getElementById('loadingScreen').remove(), 500);
        }, 1500);

        // Data pools
        this.names = {
            pt: {
                male: ['João', 'Pedro', 'Lucas', 'Gabriel', 'Rafael', 'Diego', 'Eduardo', 'Bruno', 'Felipe', 'Marcos'],
                female: ['Maria', 'Ana', 'Juliana', 'Camila', 'Beatriz', 'Larissa', 'Fernanda', 'Patricia', 'Vanessa', 'Carolina'],
                surnames: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes']
            },
            en: {
                male: ['James', 'Michael', 'William', 'David', 'John', 'Robert', 'Thomas', 'Charles', 'Christopher', 'Daniel'],
                female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'],
                surnames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
            }
        };

        this.history = JSON.parse(localStorage.getItem('neoforge-history') || '[]');
        this.renderHistory();
    }

    bindEvents() {
        document.getElementById('generateAllBtn').onclick = () => this.generateAll();
        document.getElementById('clearAllBtn').onclick = () => this.clearAll();
        document.getElementById('themeToggle').onclick = () => this.toggleTheme();
        document.getElementById('clearHistoryBtn').onclick = () => this.clearHistory();

        // Password controls
        document.getElementById('pwdLength').oninput = (e) => {
            document.getElementById('pwdLengthVal').textContent = e.target.value;
        };

        // Copy buttons
        document.querySelectorAll('[data-copy]').forEach(btn => {
            btn.onclick = () => this.copyToClipboard(btn.dataset.copy);
        });

        // Language toggle
        document.getElementById('nameLang').onchange = () => this.generateName();
    }

    generateAll() {
        this.generateCPF();
        this.generatePassword();
        this.generateName();
        this.generateUsername();
        this.addToHistory();
        this.showNotification('⚡ Todos os dados gerados!');
    }

    generateCPF() {
        let cpf = '';
        let sum = 0;

        // 9 random digits
        for (let i = 0; i < 9; i++) {
            const digit = Math.floor(Math.random() * 10);
            cpf += digit;
            sum += digit * (10 - i);
        }

        // First check digit
        let remainder = (sum * 10) % 11;
        cpf += remainder < 2 ? 0 : 11 - remainder;

        // Second check digit
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf[i]) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        cpf += remainder < 2 ? 0 : 11 - remainder;

        // Format
        document.getElementById('cpfOutput').textContent = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    generatePassword() {
        const length = parseInt(document.getElementById('pwdLength').value);
        const lower = document.getElementById('pwdLower').checked;
        const upper = document.getElementById('pwdUpper').checked;
        const numbers = document.getElementById('pwdNumbers').checked;
        const symbols = document.getElementById('pwdSymbols').checked;

        const charset = [];
        if (lower) charset.push('abcdefghijklmnopqrstuvwxyz');
        if (upper) charset.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        if (numbers) charset.push('0123456789');
        if (symbols) charset.push('!@#$%^&*()_+-=[]{}|;:,.<>?');

        let password = '';
        const allChars = charset.join('');

        // Ensure at least one of each type
        [lower && 'abcdefghijklmnopqrstuvwxyz', upper && 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 
         numbers && '0123456789', symbols && '!@#$%^&*()'].forEach(set => {
            if (set) password += set[Math.floor(Math.random() * set.length)];
        });

        // Fill remaining length
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Shuffle
        password = this.shuffleString(password);

        document.getElementById('passwordOutput').textContent = password;
        document.getElementById('passwordStrength').textContent = this.getPasswordStrength(password);
        document.getElementById('passwordStrength').className = `strength-indicator ${this.getStrengthClass(password)}`;
    }

    getPasswordStrength(password) {
        const lengthScore = Math.min(password.length / 80, 1);
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSymbols = /[^a-zA-Z\d]/.test(password);

        const score = (lengthScore * 0.4) + (hasLower ? 0.15 : 0) + (hasUpper ? 0.15 : 0) + 
                     (hasNumbers ? 0.15 : 0) + (hasSymbols ? 0.15 : 0);

        if (score >= 0.9) return '🔒 NIST Level 4 Ultra';
        if (score >= 0.7) return '🛡️ NIST Level 3 Forte';
        if (score >= 0.5) return '✅ Forte';
        return '⚠️ Média';
    }

    getStrengthClass(password) {
        const score = this.getPasswordStrength(password).includes('Ultra') ? 1 : 
                     this.getPasswordStrength(password).includes('Forte') ? 0.7 : 0.4;
        return score >= 0.7 ? 'ultra' : score >= 0.5 ? 'strong' : 'medium';
    }

    generateName() {
        const isPT = !document.getElementById('nameLang').checked;
        const pool = this.names[isPT ? 'pt' : 'en'];
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const first = pool[gender][Math.floor(Math.random() * pool[gender].length)];
        const surnames = pool.surnames.sort(() => Math.random() - 0.5).slice(0, 2);
        
        document.getElementById('nameOutput').textContent = `${first} ${surnames.join(' ')}`;
    }

    generateUsername() {
        const prefixes = ['xX', 'iAm', 'Pro', 'Noob', 'Epic', '_', ''];
        const adjectives = ['Shadow', 'Fire', 'Ice', 'Ghost', 'Rage', 'Storm', 'Blade', 'Ninja'];
        const nouns = ['King', 'God', 'Pro', 'Master', 'Slayer', 'Hunter', 'Killer', 'Beast'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const number = Math.floor(Math.random() * 9999);
        
        document.getElementById('usernameOutput').textContent = `${prefix}${adj}${noun}_${number}`;
    }

    shuffleString(str) {
        const array = str.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }

    copyToClipboard(elementId) {
        const text = document.getElementById(elementId).textContent;
        navigator.clipboard.writeText(text).then(() => {
            const btn = event.target.closest('.copy-btn');
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check-lg"></i> Copiado!';
            btn.style.background = 'linear-gradient(135deg, var(--success), #059669)';
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.background = '';
            }, 1500);
        });
    }

    addToHistory() {
        const entry = {
            timestamp: new Date().toLocaleString('pt-BR'),
            cpf: document.getElementById('cpfOutput').textContent,
            password: document.getElementById('passwordOutput').textContent,
            name: document.getElementById('nameOutput').textContent,
            username: document.getElementById('usernameOutput').textContent
        };

        this.history.unshift(entry);
        if (this.history.length > 50) this.history.length = 50;
        localStorage.setItem('neoforge-history', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        const container = document.getElementById('historyList');
        container.innerHTML = this.history.slice(0, 10).map(entry => `
            <div class="history-item">
                <div class="history-meta">
                    <span class="time">${entry.timestamp}</span>
                </div>
                <div class="history-data">
                    <span class="data-item">${entry.cpf}</span>
                    <span class="data-item">${entry.name}</span>
                    <span class="data-item">${entry.username}</span>
                    <span class="data-item password-preview">${entry.password.slice(0, 20)}...</span>
                </div>
            </div>
        `).join('') || '<div class="empty-state"><i class="bi bi-inbox"></i><p>Nenhum histórico</p></div>';
    }

    clearAll() {
        document.getElementById('cpfOutput').textContent = '000.000.000-00';
        document.getElementById('passwordOutput').textContent = 'Clique para gerar';
        document.getElementById('nameOutput').textContent = 'Nome Completo';
        document.getElementById('usernameOutput').textContent = 'Nickname Gamer';
        this.showNotification('🧹 Tudo limpo!');
    }

    clearHistory() {
        if (confirm('Limpar todo histórico?')) {
            this.history = [];
            localStorage.removeItem('neoforge-history');
            this.renderHistory();
            this.showNotification('🗑️ Histórico limpo!');
        }
    }

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('neoforge-theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    }

    loadSettings() {
        const savedTheme = localStorage.getItem('neoforge-theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
            document.getElementById('themeToggle').checked = true;
        }
    }

    showNotification(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Initialize
const neoforge = new NeoForge();
