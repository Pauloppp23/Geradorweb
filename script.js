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
        
        // Generate buttons
        document.querySelectorAll('.generate-btn').forEach(btn => {
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

    async handleGenerate(event) {
        const btn = event.currentTarget;
        const action = btn.dataset.action;
        
        // Show loading
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');
        const originalText = btnText.innerHTML;
        
        btnText.style.opacity = '0';
        btnLoader.classList.remove('d-none');
        btn.disabled = true;
        
        try {
            await this.generateData(action);
        } finally {
            btnText.innerHTML = originalText;
            btnText.style.opacity = '1';
            btnLoader.classList.add('d-none');
            btn.disabled = false;
        }
    }

    async generateData(type) {
        await new Promise(resolve => setTimeout(resolve, 1200)); // Loading effect

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

    // CPF Generator (Algoritmo oficial)
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

    // Password Generator (NIST Compliant)
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

    // Name Generator
    generateName() {
        const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Julia', 'Gabriel', 'Sofia', 'Matheus', 'Isabela', 'José', 'Carlos', 'Fernanda', 'Rafael', 'Camila'];
        const middleNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Carvalho', 'Barbosa', 'Marques'];
        const lastNames = ['da Silva', 'dos Santos', 'da Conceição', 'Pereira', 'Barbosa', 'Castro', 'Monteiro', 'Cardoso', 'Mendonça', 'Nunes', 'Moreira', 'Dias', 'Rocha', 'Fernandes'];

        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${middleNames[Math.floor(Math.random() * middleNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    }

    // Username Generator
    generateUsername() {
        const prefixes = ['Shadow', 'Dark', 'Epic', 'Pro', 'Ninja', 'Ghost', 'Storm', 'Fire', 'Ice', 'Cyber', 'Pixel', 'Nova', 'Vortex', 'Blaze', 'Frost'];
        const suffixes = ['Player', 'Gamer', 'Master', 'King', 'Queen', 'Hero', 'Legend', 'Boss', 'Pro', 'X', 'Elite', 'Prime'];
        const numbers = Math.floor(100 + Math.random() * 9900);
        const symbols = ['_', '-', '.'];

        const style = Math.floor(Math.random() * 4);
        switch(style) {
            case 0: return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}${numbers}`;
            case 1: return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${symbols[Math.floor(Math.random() * symbols.length)]}${numbers}`;
            case 2: return `x${prefixes[Math.floor(Math.random() * prefixes.length)]}${numbers}x`;
            case 3: return `${numbers}${prefixes[Math.floor(Math.random() * prefixes.length)]}${symbols[Math.floor(Math.random() * symbols.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
            default: return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${numbers}`;
        }
    }

    // Copy to Clipboard
    copyToClipboard(event) {
        const btn = event.currentTarget;
        const targetId = btn.dataset.copy;
        const field = document.getElementById(targetId);
        
        navigator.clipboard.writeText(field.value).then(() => {
            btn.innerHTML = '<i class="bi bi-check-lg"></i>';
            btn.classList.add('btn-success');
            btn.classList.remove('btn-outline-secondary');
            
            setTimeout(() => {
                btn.innerHTML = '<i class="bi bi-clipboard"></i>';
                btn.classList.remove('btn-success');
                btn.classList.add('btn-outline-secondary');
            }, 2000);
        });
    }

    // Theme Toggle
    toggleTheme() {
        const body = document.body;
        const isDark = body.getAttribute('data-bs-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        
        body.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('progen-theme', newTheme);
        
        // Bootstrap theme change
        new BootstrapTheme().setTheme(newTheme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('progen-theme') || 'light';
        document.body.setAttribute('data-bs-theme', savedTheme);
    }

    generateInitialData() {
        document.getElementById('cpf-output').value = this.generateCPF();
    }

    showSuccessFeedback() {
        const card = document.querySelector('.card');
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 200);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new ProGen();
});
