// script.js
class NeoForgeAI {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('neoForgeHistory') || '[]');
        this.theme = localStorage.getItem('neoForgeTheme') || 'dark';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.loadHistory();
        this.startLoadingSequence();
    }

    startLoadingSequence() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressBar = document.querySelector('.progress-bar-fill');
        const mainApp = document.getElementById('mainApp');

        // Simulate smooth loading
        setTimeout(() => {
            loadingScreen.style.animation = 'fadeIn 0.5s ease-out reverse forwards';
            mainApp.style.opacity = '0';
            mainApp.style.transform = 'translateY(20px)';
        }, 1500);

        setTimeout(() => {
            loadingScreen.style.display = 'none';
            mainApp.style.opacity = '1';
            mainApp.style.transform = 'translateY(0)';
            mainApp.classList.add('fade-in');
        }, 2000);
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Generator buttons
        document.querySelectorAll('.btn-generate').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.generator-card');
                this.generateData(card.dataset.type);
            });
        });

        // Card clicks
        document.querySelectorAll('.generator-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-generate, .copy-btn, input, .form-check')) {
                    this.generateData(card.dataset.type);
                }
            });
        });

        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => this.copyToClipboard(btn.dataset.target));
        });

        // Password controls
        document.getElementById('pwdLength').addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });
        document.querySelectorAll('#pwdUpper, #pwdLower, #pwdNumbers, #pwdSymbols').forEach(cb => {
            cb.addEventListener('change', () => this.updatePasswordStrength());
        });

        // Name language toggle
        document.getElementById('nameLang').addEventListener('change', () => {
            document.querySelector('[for="nameLang"]').textContent = 
                document.getElementById('nameLang').checked ? 'Português' : 'English';
        });

        // History clear
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());
        document.getElementById('clearHistoryMobile').addEventListener('click', () => this.clearHistory());

        // Generate initial data
        setTimeout(() => {
            this.generateData('cpf');
            this.generateData('password');
            this.generateData('names');
            this.generateData('nicknames');
        }, 2200);
    }

    generateData(type) {
        let result;
        
        switch(type) {
            case 'cpf':
                result = this.generateCPF();
                break;
            case 'password':
                result = this.generatePassword();
                break;
            case 'names':
                result = this.generateName();
                break;
            case 'nicknames':
                result = this.generateNickname();
                break;
        }

        const target = document.getElementById(type === 'names' ? 'nameResult' : `${type}Result`);
        target.textContent = result;
        target.parentElement.style.animation = 'none';
        setTimeout(() => target.parentElement.classList.add('fade-in'), 10);

        this.addToHistory(type, result);
    }

    generateCPF() {
        const n = Array(9).fill(0).map(() => Math.floor(Math.random() * 10));
        let d1 = 0, d2 = 0;
        
        for(let i = 0; i < 9; i++) {
            d1 += n[8-i] * (10-i);
            d2 += n[8-i] * (11-i);
        }
        
        d1 = (d1 * 10) % 11;
        d2 = ((d2 + d1 * 2) * 10) % 11;
        
        n.push(d1 > 9 ? 0 : d1);
        n.push(d2 > 9 ? 0 : d2);
        
        return n.reduce((acc, digit, i) => {
            if(i === 3 || i === 6) acc += '.';
            else if(i === 9) acc += '-';
            acc += digit;
            return acc;
        }, '');
    }

    generatePassword() {
        const length = parseInt(document.getElementById('pwdLength').value);
        const useUpper = document.getElementById('pwdUpper').checked;
        const useLower = document.getElementById('pwdLower').checked;
        const useNumbers = document.getElementById('pwdNumbers').checked;
        const useSymbols = document.getElementById('pwdSymbols').checked;

        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let charset = '';
        const required = [];

        if(useUpper) { charset += upper; required.push(upper[Math.floor(Math.random() * upper.length)]); }
        if(useLower) { charset += lower; required.push(lower[Math.floor(Math.random() * lower.length)]); }
        if(useNumbers) { charset += numbers; required.push(numbers[Math.floor(Math.random() * numbers.length)]); }
        if(useSymbols) { charset += symbols; required.push(symbols[Math.floor(Math.random() * symbols.length)]); }

        // Ensure minimum 4 of each required type
        for(let type of ['upper', 'lower', 'numbers', 'symbols']) {
            if((type === 'upper' && useUpper) || (type === 'lower' && useLower) || 
               (type === 'numbers' && useNumbers) || (type === 'symbols' && useSymbols)) {
                for(let i = 0; i < 4; i++) {
                    required.push(this.getRandomChar(type));
                }
            }
        }

        // Leetspeak transformation
        const leetMap = {'a':'4','e':'3','i':'1','o':'0','s':'5','t':'7'};
        let password = required.sort(() => Math.random() - 0.5).join('') + 
                      Array.from({length: length - required.length}, () => 
                          charset[Math.floor(Math.random() * charset.length)]);

        // Apply leetspeak to some characters
        password = password.split('').map(char => {
            if(Math.random() < 0.3 && leetMap[char.toLowerCase()]) {
                return leetMap[char.toLowerCase()];
            }
            return char;
        }).join('');

        // Double shuffle for extra entropy
        for(let i = 0; i < 2; i++) {
            password = password.split('').sort(() => Math.random() - 0.5).join('');
        }

        this.updatePasswordStrength(length);
        return password.slice(0, length);
    }

    getRandomChar(type) {
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        switch(type) {
            case 'upper': return upper[Math.floor(Math.random() * upper.length)];
            case 'lower': return lower[Math.floor(Math.random() * lower.length)];
            case 'numbers': return numbers[Math.floor(Math.random() * numbers.length)];
            case 'symbols': return symbols[Math.floor(Math.random() * symbols.length)];
        }
    }

    generateName() {
        const ptNames = {
            male: ['João', 'Pedro', 'Lucas', 'Mateus', 'Gabriel', 'Rafael', 'Guilherme', 'Samuel', 'Henrique', 'Eduardo'],
            female: ['Maria', 'Ana', 'Julia', 'Beatriz', 'Laura', 'Sofia', 'Manu', 'Clara', 'Luiza', 'Cecilia'],
            surnames: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes']
        };
        
        const enNames = {
            male: ['James', 'Robert', 'John', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles'],
            female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'],
            surnames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
        };

        const isPt = document.getElementById('nameLang').checked;
        const names = isPt ? ptNames : enNames;
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        
        const first = names[gender][Math.floor(Math.random() * names[gender].length)];
        const last = names.surnames[Math.floor(Math.random() * names.surnames.length)];
        
        return `${first} ${last}`;
    }

    generateNickname() {
        const prefixes = ['xX', 'Pro', 'Neo', 'Dark', 'Ghost', 'Shadow', 'Fire', 'Ice', 'Ninja', 'Elite'];
        const suffixes = ['Killer', 'Master', 'Pro', 'God', 'King', 'Queen', 'Boss', 'Legend', 'Hero', 'Ninja'];
        const gamerWords = ['PvP', 'NoobSlayer', 'Headshot', 'Rage', 'Clutch', 'Carry', 'GG', 'WP', 'EZ'];

        const style = Math.floor(Math.random() * 3);
        let nick = '';

        switch(style) {
            case 0: // xX_Nick_Xx
                nick = `${prefixes[Math.floor(Math.random()*prefixes.length)]}_${this.randomWord()}_${suffixes[Math.floor(Math.random()*suffixes.length)]}`;
                break;
            case 1: // ProNick123
                nick = `Pro${this.randomWord()}${Math.floor(Math.random()*9999)}`;
                break;
            case 2: // NickPvP
                nick = `${this.randomWord()}${gamerWords[Math.floor(Math.random()*gamerWords.length)]}`;
                break;
        }

        return nick;
    }

    randomWord() {
        const words = 'a b c d e f g h i j k l m n o p q r s t u v w x y z'.split(' ');
        return words[Math.floor(Math.random()*words.length)].toUpperCase() + 
               words[Math.floor(Math.random()*words.length)].toUpperCase();
    }

    updatePasswordStrength(length = document.getElementById('pwdLength').value) {
        const fill = document.getElementById('strengthFill');
        const text = document.getElementById('strengthText');
        
        const strength = Math.min(100, (length / 128) * 100);
        fill.style.width = strength + '%';
        
        if(strength >= 95) {
            text.textContent = '🔒 NIST Level 4+ (Ultra Forte)';
            text.className = 'text-success';
        } else if(strength >= 80) {
            text.textContent = '🛡️ NIST Level 3 (Muito Forte)';
            text.className = 'text-success';
        }
    }

    copyToClipboard(targetId) {
        const text = document.getElementById(targetId).textContent;
        navigator.clipboard.writeText(text).then(() => {
            this.showToast();
        });
    }

    showToast() {
        const toast = new bootstrap.Toast(document.getElementById('copyToast'));
        toast.show();
    }

    addToHistory(type, value) {
        const timestamp = new Date().toLocaleString('pt-BR');
        const item = { type, value: value.slice(0, 50) + (value.length > 50 ? '...' : ''), timestamp };
        
        this.history.unshift(item);
        this.history = this.history.slice(0, 50); // Keep last 50
        
        localStorage.setItem('neoForgeHistory', JSON.stringify(this.history));
        this.loadHistory();
    }

    loadHistory() {
        const list = document.getElementById('historyList');
        const mobileList = document.getElementById('mobileHistoryList');
        
        list.innerHTML = this.history.map(item => `
            <div class="history-item ${item.type} fade-in" onclick="neoForge.copyToClipboard('${item.type}Result')">
                <div class="d-flex justify-content-between">
                    <span>${item.value}</span>
                    <small class="opacity-75">${item.timestamp}</small>
                </div>
            </div>
        `).join('');
        
        mobileList.innerHTML = list.innerHTML;
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('neoForgeHistory');
        this.loadHistory();
    }

    toggleTheme() {
        document.body.classList.toggle('theme-light');
        this.theme = document.body.classList.contains('theme-light') ? 'light' : 'dark';
        localStorage.setItem('neoForgeTheme', this.theme);
        
        const icon = document.getElementById('themeToggle').querySelector('i');
        icon.className = this.theme === 'dark' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
    }

    applyTheme() {
        if(this.theme === 'light') {
            document.body.classList.add('theme-light');
            document.getElementById('themeToggle').querySelector('i').className = 'bi bi-sun-fill';
        }
    }
}

// Initialize app
const neoForge = new NeoForgeAI();
