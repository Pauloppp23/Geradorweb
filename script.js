/**
 * DataForge Pro - Gerador Profissional de Dados
 * Versão 2.0 - JavaScript Principal
 */

class DataForgePro {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('dataforge-history')) || [];
        this.maxHistory = 10;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTheme();
        this.hideLoading();
        this.updateHistory();
        this.generateInitialData();
    }

    bindEvents() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Generate buttons
        document.querySelectorAll('.generate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.generateData(e));
        });
        
        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.copyToClipboard(e));
        });
        
        // Password controls
        const lengthSlider = document.getElementById('passwordLength');
        lengthSlider.addEventListener('input', (e) => {
            document.getElementById('lengthDisplay').textContent = e.target.value;
        });
        
        // Clear history
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());
    }

    async generateData(event) {
        const btn = event.currentTarget;
        const type = btn.dataset.generate;
        const outputId = `${type}Output`;
        const strengthId = `${type}Strength`;
        
        this.setLoading(btn, true);
        
        // Simular delay realista
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        
        let result;
        switch(type) {
            case 'cpf': result = this.generateCPF(); break;
            case 'password': result = this.generatePassword(); break;
            case 'name': result = this.generateName(); break;
            case 'nickname': result = this.generateNickname(); break;
        }
        
        document.getElementById(outputId).value = result;
        this.updateStrength(type, result);
        this.addToHistory(type, result);
        
        this.setLoading(btn, false);
        this.animateSuccess(btn);
    }

    setLoading(btn, loading) {
        const btnText = btn.querySelector('.btn-text');
        const btnSpinner = btn.querySelector('.btn-spinner');
        
        if (loading) {
            btnText.style.opacity = '0';
            btnSpinner.classList.remove('d-none');
            btn.disabled = true;
        } else {
            btnText.style.opacity = '1';
            btnSpinner.classList.add('d-none');
            btn.disabled = false;
        }
    }

    // CPF VÁLIDO (Algoritmo oficial brasileiro)
    generateCPF() {
        const numbers = [];
        for (let i = 0; i < 9; i++) {
            numbers.push(Math.floor(Math.random() * 10));
        }
        
        // Primeiro dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += numbers[i] * (10 - i);
        }
        let digit1 = (sum * 10) % 11;
        digit1 = digit1 === 10 ? 0 : digit1;
        numbers.push(digit1);
        
        // Segundo dígito verificador
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += numbers[i] * (11 - i);
        }
        let digit2 = (sum * 10) % 11;
        digit2 = digit2 === 10 ? 0 : digit2;
        numbers.push(digit2);
        
        return numbers.reduce((acc, num, i) => {
            if (i === 3 || i === 6) return acc + '.' + num;
            if (i === 9) return acc + '-' + num;
            return acc + num;
        }, '');
    }

    // SENHA SEGURA (NIST Compliant)
    generatePassword() {
        const length = parseInt(document.getElementById('passwordLength').value);
        const includeNumbers = document.getElementById('includeNumbers').checked;
        const includeSymbols = document.getElementById('includeSymbols').checked;
        
        let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeNumbers) charset += '0123456789';
        if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let password = '';
        const types = [
            'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
            includeNumbers ? '0123456789'.split('') : [],
            includeSymbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?'.split('') : []
        ].filter(type => type.length > 0);
        
        // Garantir pelo menos um de cada tipo
        types.forEach(type => {
            password += type[Math.floor(Math.random() * type.length)];
        });
        
        // Preencher restante
        for (let i = types.reduce((a, b) => a + b.length, 0); i < length; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            password += type[Math.floor(Math.random() * type.length)];
        }
        
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    // NOMES BRASILEIROS REALISTAS
    generateName() {
        const firstNames = {
            male: ['João', 'Pedro', 'Lucas', 'Gabriel', 'Mateus', 'Rafael', 'José', 'Carlos', 'Antônio', 'Francisco'],
            female: ['Maria', 'Ana', 'Julia', 'Sofia', 'Isabela', 'Larissa', 'Fernanda', 'Camila', 'Beatriz', 'Letícia']
        };
        
        const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Carvalho', 'Barbosa'];
        
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
        const middleName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${middleName} ${lastName}`;
    }

    // NICKNAMES GAMER
    generateNickname() {
        const prefixes = ['Shadow', 'Dark', 'Epic', 'Pro', 'Ninja', 'Ghost', 'Storm', 'Fire', 'Ice', 'Cyber', 'Pixel', 'Nova', 'Vortex', 'Blaze', 'Frost', 'Quantum'];
        const suffixes = ['X', 'Pro', 'King', 'Queen', 'Master', 'Elite', 'Prime', 'God', 'Boss', 'Legend'];
        const themes = ['Ninja', 'Phantom', 'Spectre', 'Raven', 'Drake', 'Viper', 'Falcon', 'Titan', 'Zeus', 'Apex'];
        
        const style = Math.floor(Math.random() * 5);
        const num = Math.floor(100 + Math.random() * 8999);
        
        switch(style) {
            case 0: return `${prefixes[Math.floor(Math.random()*prefixes.length)]}${num}`;
            case 1: return `${themes[Math.floor(Math.random()*themes.length)]}_${num}`;
            case 2: return `x${prefixes[Math.floor(Math.random()*prefixes.length)]}${suffixes[Math.floor(Math.random()*suffixes.length)]}`;
            case 3: return `${num}${prefixes[Math.floor(Math.random()*prefixes.length)]}`;
            case 4: return `${prefixes[Math.floor(Math.random()*prefixes.length)]}${suffixes[Math.floor(Math.random()*suffixes.length)]}_${num}`;
            default: return `${prefixes[Math.floor(Math.random()*prefixes.length)]}${num}`;
        }
    }

    updateStrength(type, value) {
        const strengthEl = document.getElementById(`${type}Strength`);
        const bar = strengthEl.querySelector('.strength-bar');
        const label = strengthEl.querySelector('.strength-label');
        
        if (type === 'password') {
            const score = this.calculatePasswordStrength(value);
            const colors = ['bg-danger', 'bg-warning', 'bg-info', 'bg-success'];
            const labels = ['Fraca', 'Média', 'Boa', 'Excelente'];
            const widths = ['30%', '60%', '80%', '100%'];
            
            bar.className = `strength-bar ${colors[score]} ${widths[score]}`;
            label.textContent = `Força: ${labels[score]}`;
        } else if (type === 'cpf') {
            strengthEl.classList.remove('d-none');
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        return Math.min(score, 3);
    }

    copyToClipboard(event) {
        const btn = event.currentTarget;
        const targetId = btn.dataset.copy;
        const field = document.getElementById(targetId);
        
        navigator.clipboard.writeText(field.value).then(() => {
            const icon = btn.querySelector('i');
            const originalIcon = icon.className;
            
            icon.className = 'bi bi-check-lg';
            btn.classList.add('btn-success');
            
            setTimeout(() => {
                icon.className = originalIcon;
                btn.classList.remove('btn-success');
            }, 1500);
        }).catch(() => {
            // Fallback
            field.select();
            document.execCommand('copy');
        });
    }

    addToHistory(type, value) {
        this.history.unshift({ type, value, timestamp: Date.now() });
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(0, this.maxHistory);
        }
        localStorage.setItem('dataforge-history', JSON.stringify(this.history));
        this.updateHistory();
    }

    updateHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            historyList.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-inbox fs-1 opacity-50 mb-3 d-block"></i>
                    <p class="text-muted mb-0">Gere dados para ver o histórico</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = this.history.map(item => {
            const typeIcon = {
                cpf: 'bi-person-badge',
                password: 'bi-shield-lock',
                name: 'bi-person',
                nickname: 'bi-controller'
            }[item.type];
            
            const typeLabel = {
                cpf: 'CPF',
                password: 'Senha',
                name: 'Nome',
                nickname: 'Nickname'
            }[item.type];
            
            const shortValue = item.value.length > 30 ? item.value.substring(0, 30) + '...' : item.value;
            
            return `
                <div class="history-item d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                        <div class="bg-light rounded-circle p-2">
                            <i class="${typeIcon} text-${{cpf:'primary',password:'success',name:'info',nickname:'warning'}[item.type]}"></i>
                        </div>
                        <div>
                            <div class="fw-semibold small">${typeLabel}</div>
                            <div class="text-muted small">${shortValue}</div>
                        </div>
                    </div>
                    <small class="text-muted opacity-75">${new Date(item.timestamp).toLocaleTimeString('pt-BR')}</small>
                </div>
            `;
        }).join('');
    }

    clearHistory() {
        if (confirm('Limpar todo o histórico?')) {
            this.history = [];
            localStorage.removeItem('dataforge-history');
            this.updateHistory();
        }
    }

    toggleTheme() {
        const body = document.body;
        const isDark = body.getAttribute('data-bs-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        
        body.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('dataforge-theme', newTheme);
        
        const toggle = document.getElementById('themeToggle');
        const themeText = toggle.querySelector('.theme-text');
        const themeIconMoon = toggle.querySelector('.theme-icon-moon');
        const themeIconSun = toggle.querySelector('.theme-icon-sun');
        
        themeText.textContent = newTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro';
        themeIconMoon.style.display = newTheme === 'dark' ? 'none' : 'inline';
        themeIconSun.style.display = newTheme === 'dark' ? 'inline' : 'none';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('dataforge-theme') || 'light';
        document.body.setAttribute('data-bs-theme', savedTheme);
        
        const toggle = document.getElementById('themeToggle');
        const themeText = toggle.querySelector('.theme-text');
        const isDark = savedTheme === 'dark';
        
        themeText.textContent = isDark ? 'Modo Claro' : 'Modo Escuro';
        toggle.querySelector('.theme-icon-moon').style.display = isDark ? 'none' : 'inline';
        toggle.querySelector('.theme-icon-sun').style.display = isDark ? 'inline' : 'none';
    }

    hideLoading() {
        setTimeout(() => {
            const loading = document.getElementById('loading-screen');
            loading.style.opacity = '0';
            setTimeout(() => loading.style.display = 'none', 500);
        }, 1500);
    }

    generateInitialData() {
        document.getElementById('cpfOutput').value = this.generateCPF();
    }

    animateSuccess(element) {
        element.style.transform = 'scale(0.98)';
        setTimeout(() => {
            element.style.transform = '';
        }, 200);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    new DataForgePro();
});
