class ProGen {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTheme();
        this.generateInitialData();
    }

    bindEvents() {
        // Theme toggle
        document.querySelector('.theme-toggle').addEventListener('click', () => this.toggleTheme());
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.switchTab(e);
                }
            });
        });

        // Main buttons
        document.querySelectorAll('.main-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleGenerate(e));
        });

        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.copyToClipboard(e));
        });

        // Password controls
        const lengthSlider = document.getElementById('pass-length');
        if (lengthSlider) {
            lengthSlider.addEventListener('input', (e) => {
                document.getElementById('length-val').textContent = e.target.value;
            });
        }
    }

    switchTab(event) {
        const btn = event.currentTarget;
        const tabId = btn.dataset.tab;

        // Update tabs
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
            b.setAttribute('tabindex', '-1');
        });
        document.querySelectorAll('.tab-content').forEach(c => {
            c.classList.remove('active');
            c.hidden = true;
        });

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        btn.setAttribute('tabindex', '0');

        const tabContent = document.getElementById(tabId);
        tabContent.classList.add('active');
        tabContent.hidden = false;
        tabContent.focus();

        // Accessibility
        const tabLabel = btn.getAttribute('aria-labelledby') || btn.textContent.trim();
        this.announce(`Tab ${tabLabel} selecionado`);
    }

    async handleGenerate(event) {
        const btn = event.currentTarget;
        const action = btn.dataset.action;
        
        btn.classList.add('loading');
        
        try {
            await this.generateData(action);
        } finally {
            btn.classList.remove('loading');
        }
    }

    async generateData(type) {
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        await delay(800); // Simulate API call

        switch(type) {
            case 'cpf':
                document.getElementById('cpf-output').value = this.generateCPF();
                break;
            case 'pass':
                document.getElementById('pass-output').value = this.generatePassword();
                break;
            case 'names':
                document.getElementById('name-output').value = this.generateName();
                break;
            case 'users':
                document.getElementById('user-output').value = this.generateUsername();
                break;
        }

        this.showSuccessFeedback();
    }

    generateCPF() {
        const n = Array.from({length: 9}, () => Math.floor(Math.random() * 10));
        let d1 = 0, d2 = 0;
        
        for(let i = 0; i < 9; i++) {
            d1 += n[8-i] * (i+1);
            d2 += n[8-i] * (i+2);
        }
        
        const dv1 = ((d1 * 10) % 11) % 10;
        n.push(dv1);
        d2 += dv1 * 2;
        const dv2 = ((d2 * 10) % 11) % 10;
        n.push(dv2);
        
        return n.reduce((acc, digit, i) => {
            if (i === 3 || i === 6) acc += '.';
            else if (i === 9) acc += '-';
            acc += digit;
            return acc;
        }, '');
    }

    generatePassword() {
        const length = parseInt(document.getElementById('pass-length').value);
        const useNumbers = document.getElementById('use-numbers').checked;
        const useSymbols = document.getElementById('use-symbols').checked;

        let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (useNumbers) charset += '0123456789';
        if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        return password;
    }

    generateName() {
        const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Julia', 'Gabriel', 'Sofia', 'Matheus', 'Isabela'];
        const middleNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes'];
        const lastNames = ['da Silva', 'dos Santos', 'da Conceição', 'Pereira', 'Barbosa', 'Castro', 'Monteiro', 'Cardoso', 'Mendonça', 'Nunes'];

        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${middleNames[Math.floor(Math.random() * middleNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    }

    generateUsername() {
        const prefixes = ['Shadow', 'Dark', 'Epic', 'Pro', 'Ninja', 'Ghost', 'Storm', 'Fire', 'Ice', 'Cyber'];
        const suffixes = ['Player', 'Gamer', 'Master', 'King', 'Queen', 'Hero', 'Legend', 'Boss', 'Pro', 'X'];
        const numbers = Math.floor(Math.random() * 9999);
        const symbols = ['_', '-', '.'];

        const style = Math.floor(Math.random() * 3);
        switch(style) {
            case 0: return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}${numbers}`;
            case 1: return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${symbols[Math.floor(Math.random() * symbols.length)]}${numbers}`;
            case 2: return `x${prefixes[Math.floor(Math.random() * prefixes.length)]}${numbers}x`;
        }
    }

    copyToClipboard(event) {
        const btn = event.currentTarget;
        const targetId = btn.dataset.copy;
        const field = document.getElementById(targetId);
        
        field.select();
        field.setSelectionRange(0, 99999);
        
        navigator.clipboard.writeText(field.value).then(() => {
            const original = btn.innerHTML;
            btn.innerHTML = '✅';
            btn.style.background = '#10b981';
            
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.background = '';
            }, 2000);
            
            this.announce('Copiado para área de transferência');
        }).catch(() => {
            // Fallback
            document.execCommand('copy');
        });
    }

    showSuccessFeedback() {
        // Visual feedback
        document.querySelector('.content').style.transform = 'scale(0.98)';
        setTimeout(() => {
            document.querySelector('.content').style.transform = '';
        }, 150);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('progen-theme', newTheme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('progen-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    generateInitialData() {
        // Generate initial CPF
        document.getElementById('cpf-output').value = this.generateCPF();
    }

    announce(message) {
        // Screen reader announcement
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-9999px';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProGen();
});