// script.js
class LSAI {
    constructor() {
        this.currentChatId = null;
        this.chats = [];
        this.messages = [];
        this.apiKey = localStorage.getItem('lsai_api_key') || '';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadApiKey();
        await this.startLoadingSequence();
        await this.initFirebase();
        this.loadTheme();
        this.showToast('LS AI inicializado com sucesso!', 'success');
    }

    async startLoadingSequence() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressBar = document.querySelector('.progress-bar-fill');
        const appContainer = document.getElementById('mainApp');

        return new Promise(resolve => {
            setTimeout(() => {
                loadingScreen.style.animation = 'slideInUp 0.5s ease-out reverse forwards';
                appContainer.classList.add('show');
            }, 1800);
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                resolve();
            }, 2300);
        });
    }

    setupEventListeners() {
        // API Key
        document.getElementById('saveApiKey').addEventListener('click', () => this.saveApiKey());
        document.getElementById('apiKeyInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveApiKey();
        });

        // Chat
        document.getElementById('newChatBtn').addEventListener('click', () => this.createNewChat());
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());

        // UI
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('toggleSidebar').addEventListener('click', () => this.toggleSidebar());
        
        // Auth
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    }

    async initFirebase() {
        const { auth, db } = window.firebase;
        
        // Auth state observer
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.user = user;
                this.showUserProfile();
                await this.loadUserChats();
            } else {
                this.showLoginPrompt();
            }
        });

        // Google Login (call when needed)
        this.googleLogin = () => signInWithPopup(auth, window.firebase.provider);
    }

    showLoginPrompt() {
        const container = document.getElementById('messagesContainer');
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-shield-lock display-1 text-muted mb-4"></i>
                <h4>Faça login para continuar</h4>
                <p class="text-muted mb-4">Conecte sua conta Google para acessar o LS AI</p>
                <button class="btn btn-primary btn-lg px-4" id="googleLoginBtn">
                    <i class="bi bi-google me-2"></i>Entrar com Google
                </button>
            </div>
        `;
        
        document.getElementById('userProfile').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
        
        // Add login button listener
        container.querySelector('#googleLoginBtn').addEventListener('click', this.googleLogin);
    }

    showUserProfile() {
        document.getElementById('userAvatar').src = this.user.photoURL;
        document.getElementById('userName').textContent = this.user.displayName;
        document.getElementById('userProfile').style.display = 'flex';
        document.getElementById('logoutBtn').style.display = 'block';
    }

    async loadUserChats() {
        if (!this.user) return;
        
        const q = query(
            collection(window.firebase.db, 'chats'),
            where('userId', '==', this.user.uid),
            orderBy('createdAt', 'desc')
        );

        onSnapshot(q, (snapshot) => {
            this.chats = [];
            snapshot.forEach((doc) => {
                this.chats.push({ id: doc.id, ...doc.data() });
            });
            this.renderChatList();
            if (this.chats.length > 0 && !this.currentChatId) {
                this.selectChat(this.chats[0].id);
            }
        });
    }

    renderChatList() {
        const chatList = document.getElementById('chatList');
        chatList.innerHTML = this.chats.map(chat => `
            <div class="chat-item ${this.currentChatId === chat.id ? 'active' : ''}" data-chat-id="${chat.id}">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="fw-semibold">${chat.title || 'Novo Chat'}</div>
                        <small class="text-muted">${chat.lastMessage?.slice(0, 40)}...</small>
                    </div>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm p-1 text-muted" onclick="lsai.renameChat('${chat.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm p-1 text-muted" onclick="lsai.deleteChat('${chat.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('') || '<div class="text-muted p-4 text-center">Nenhum chat criado</div>';

        // Add click listeners
        document.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.btn')) {
                    this.selectChat(item.dataset.chatId);
                }
            });
        });
    }

    async createNewChat() {
        if (!this.user) {
            this.showToast('Faça login primeiro', 'warning');
            return;
        }

        const chatRef = await addDoc(collection(window.firebase.db, 'chats'), {
            userId: this.user.uid,
            title: 'Novo Chat',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        this.currentChatId = chatRef.id;
        this.messages = [];
        this.updateChatTitle('Novo Chat');
        this.renderMessages();
        this.renderChatList();
    }

    async selectChat(chatId) {
        this.currentChatId = chatId;
        const chat = this.chats.find(c => c.id === chatId);
        
        this.updateChatTitle(chat.title || 'Chat');
        
        // Load messages
        const q = query(
            collection(window.firebase.db, `chats/${chatId}/messages`),
            orderBy('timestamp', 'asc')
        );
        
        onSnapshot(q, (snapshot) => {
            this.messages = [];
            snapshot.forEach(doc => {
                this.messages.push({ id: doc.id, ...doc.data() });
            });
            this.renderMessages();
            this.scrollToBottom();
        });

        this.renderChatList();
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message || !this.currentChatId || !this.apiKey) {
            if (!this.apiKey) this.showToast('Insira sua API Key primeiro', 'warning');
            return;
        }

        const userMessage = {
            text: message,
            sender: 'user',
            timestamp: new Date()
        };

        // Add user message
        await this.addMessage(userMessage);
        input.value = '';
        this.adjustInputHeight();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get AI response
            const aiResponse = await this.callAI(message);
            const aiMessage = {
                text: aiResponse,
                sender: 'ai',
                timestamp: new Date()
            };
            
            await this.addMessage(aiMessage);
        } catch (error) {
            console.error('AI Error:', error);
            const errorMessage = {
                text: 'Desculpe, ocorreu um erro ao gerar a resposta. Verifique sua API Key.',
                sender: 'ai',
                timestamp: new Date(),
                error: true
            };
            await this.addMessage(errorMessage);
        } finally {
            this.hideTypingIndicator();
        }
    }

    async addMessage(message) {
        if (!this.currentChatId) return;

        const docRef = await addDoc(collection(window.firebase.db, `chats/${this.currentChatId}/messages`), message);
        
        // Update chat title based on first message
        if (this.messages.length === 0 && message.sender === 'user') {
            await updateDoc(doc(window.firebase.db, 'chats', this.currentChatId), {
                title: message.text.slice(0, 50) + '...'
            });
        }

        // Update chat last message
        await updateDoc(doc(window.firebase.db, 'chats', this.currentChatId), {
            updatedAt: new Date(),
            lastMessage: message.text.slice(0, 50) + (message.text.length > 50 ? '...' : '')
        });
    }

    async callAI(message) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192', // Groq free model
                messages: [
                    {
                        role: 'system',
                        content: 'Você é LS AI, um assistente inteligente, útil e conciso. Responda sempre em português brasileiro.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    renderMessages() {
        const container = document.getElementById('messagesContainer');
        if (this.messages.length === 0) {
            container.innerHTML = `
                <div class="welcome-message text-center py-5">
                    <i class="bi bi-chat-dots display-1 text-muted mb-3"></i>
                    <h4 class="text-muted mb-2">Pronto para conversar</h4>
                    <p class="text-muted mb-0">Envie uma mensagem para começar</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.messages.map(msg => `
            <div class="message ${msg.sender} fade-in">
                <div class="message-bubble">
                    ${msg.text}
                    <div class="message-time">${this.formatTime(msg.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    showTypingIndicator() {
        const container = document.getElementById('typingIndicator');
        container.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        document.getElementById('typingIndicator').style.display = 'none';
    }

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTop = container.scrollHeight;
    }

    updateChatTitle(title) {
        document.getElementById('chatTitle').textContent = title;
    }

    adjustInputHeight() {
        const textarea = document.getElementById('messageInput');
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    saveApiKey() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        if (apiKey) {
            this.apiKey = apiKey;
            localStorage.setItem('lsai_api_key', apiKey);
            this.showToast('API Key salva com sucesso!', 'success');
            document.getElementById('apiKeyInput').value = '';
        } else {
            this.showToast('Digite uma API Key válida', 'warning');
        }
    }

    loadApiKey() {
        if (this.apiKey) {
            document.getElementById('apiKeyInput').value = this.apiKey;
        }
    }

    toggleTheme() {
        document.body.classList.toggle('theme-light');
        const isDark = !document.body.classList.contains('theme-light');
        localStorage.setItem('lsai_theme', isDark ? 'dark' : 'light');
        
        const icon = document.querySelector('#themeToggle i');
        icon.className = isDark ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
    }

    loadTheme() {
        const theme = localStorage.getItem('lsai_theme') || 'dark';
        if (theme === 'light') {
            document.body.classList.add('theme-light');
            document.querySelector('#themeToggle i').className = 'bi bi-sun-fill';
        }
    }

    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('show');
    }

    async logout() {
        await signOut(window.firebase.auth);
    }

    async renameChat(chatId) {
        const newTitle = prompt('Novo nome do chat:');
        if (newTitle) {
            await updateDoc(doc(window.firebase.db, 'chats', chatId), {
                title: newTitle
            });
        }
    }

    async deleteChat(chatId) {
        if (confirm('Deletar este chat?')) {
            await deleteDoc(doc(window.firebase.db, 'chats', chatId));
            if (this.currentChatId === chatId) {
                this.currentChatId = null;
                this.renderMessages();
            }
        }
    }

    formatTime(date) {
        return new Date(date.toDate ? date.toDate() : date).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('mainToast');
        document.getElementById('toastTitle').textContent = type === 'success' ? 'Sucesso' : 
            type === 'warning' ? 'Aviso' : 'Info';
        document.getElementById('toastBody').textContent = message;
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
}

// Global instance
const lsai = new LSAI();

// Auto-resize textarea
document.getElementById('messageInput').addEventListener('input', function() {
    lsai.adjustInputHeight();
});
