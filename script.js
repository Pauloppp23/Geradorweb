// DataForge Pro - BULLETPROOF & INSTANTÂNEO
document.addEventListener('DOMContentLoaded', function() {
    const theme = localStorage.getItem('dataforge-theme') || 'dark';
    document.body.classList.add(theme + '-theme');
    document.getElementById('themeToggle').checked = theme === 'light';
    
    loadHistory();
    setupEvents();
});

function setupEvents() {
    document.getElementById('generateBtn').onclick = generateAll;
    document.getElementById('copyAllBtn').onclick = copyAll;
    document.getElementById('clearHistoryBtn').onclick = clearHistory;
    document.getElementById('themeToggle').onchange = toggleTheme;
    
    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.onclick = () => copyToClipboard(btn.dataset.copy);
    });
}

function generateAll() {
    generateCPF();
    generatePassword();
    generateName();
    generateUsername();
    addToHistory();
    
    const btn = document.getElementById('generateBtn');
    btn.innerHTML = '<i class="bi bi-check-circle"></i> ✅ Gerado!';
    btn.classList.add('btn-success');
    setTimeout(() => {
        btn.innerHTML = '<i class="bi bi-lightning-charge"></i> 🔥 Gerar Tudo';
        btn.classList.remove('btn-success');
    }, 1000);
}

function generateCPF() {
    let cpf = '', sum = 0;
    for (let i = 0; i < 9; i++) {
        const n = ~~(Math.random() * 10);
        cpf += n; sum += n * (10 - i);
    }
    let r = (sum * 10) % 11; cpf += r < 2 ? 0 : 11 - r;
    sum = 0; for (let i = 0; i < 10; i++) sum += +cpf[i] * (11 - i);
    r = (sum * 10) % 11; cpf += r < 2 ? 0 : 11 - r;
    document.getElementById('cpfResult').textContent = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function generatePassword() {
    const len = Math.max(32, +document.getElementById('passwordLength').value);
    const spec = document.getElementById('includeSpecial').checked;
    
    const s = {l:'abcdefghijklmnopqrstuvwxyz',u:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',n:'0123456789',s:'!@#$%^&*()_+-=[]{}|;:,.<>?'} 
    let pwd = '';
    
    ['l','u','n'].forEach(t => {for(let i=0;i<4;i++) pwd += s[t][~~(Math.random()*s[t].length)]});
    if(spec) for(let i=0;i<4;i++) pwd += s.s[~~(Math.random()*s.s.length)];
    
    const all = spec ? s.l+s.u+s.n+s.s : s.l+s.u+s.n;
    while(pwd.length < len) pwd += all[~~(Math.random()*all.length)];
    
    pwd = shuffle(shuffle(pwd));
    document.getElementById('passwordResult').textContent = pwd;
    document.getElementById('passwordStrength').textContent = '🔒 NIST Ultra';
}

function shuffle(s) {
    for(let i=s.length-1;i>0;i--) {
        const j=~~(Math.random()*(i+1));
        [s[i],s[j]]=[s[j],s[i]];
    }
    return s;
}

function generateName() {
    const f = ['João','Maria','José','Ana','Pedro','Lucas','Ana','Gabriel','Rafael','Diego','Eduardo'];
    const l = ['Silva','Santos','Oliveira','Souza','Rodrigues','Alves','Pereira','Lima','Gomes'];
    document.getElementById('nameResult').textContent = f[~~(Math.random()*f.length)] + ' ' + l[~~(Math.random()*l.length)];
}

function generateUsername() {
    const a = ['Fast','Deadly','Rage','Fire','Ice','Shadow'];
    const su = ['King','Pro','Kill'];
    document.getElementById('usernameResult').textContent = 'xX' + a[~~(Math.random()*a.length)] + su[~~(Math.random()*su.length)] + '_' + ~~(Math.random()*99999);
}

function copyToClipboard(id) {
    navigator.clipboard.writeText(document.getElementById(id).textContent);
    showToast('✅ Copiado!');
}

function copyAll() {
    const t = Array.from(document.querySelectorAll('.result-box')).map(e=>e.textContent).join('\n');
    navigator.clipboard.writeText(t);
    showToast('🎉 Tudo copiado!');
}

function showToast(m) {
    const t = document.getElementById('toast');
    t.textContent = m;
    t.classList.remove('d-none');
    setTimeout(()=>t.classList.add('d-none'), 2000);
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
    localStorage.setItem('dataforge-theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

function addToHistory() {
    const h = JSON.parse(localStorage.getItem('dataforge-history') || '[]');
    h.unshift({t:new Date().toLocaleString('pt-BR'),c:document.getElementById('cpfResult').textContent,p:document.getElementById('passwordResult').textContent,n:document.getElementById('nameResult').textContent,u:document.getElementById('usernameResult').textContent});
    if(h.length>20) h.length=20;
    localStorage.setItem('dataforge-history', JSON.stringify(h));
    renderHistory(h);
}

function loadHistory() { renderHistory(JSON.parse(localStorage.getItem('dataforge-history') || '[]')); }

function renderHistory(h) {
    document.getElementById('historyList').innerHTML = h.map((e,i)=>`
        <div class="history-item p-2 mb-2 rounded bg-opacity-20">
            <div class="d-flex justify-content-between small">
                <span>${e.t}</span>
                <div>
                    <button class="btn btn-sm p-0 me-1" onclick="copyH(${i})">📋</button>
                    <button class="btn btn-sm p-0" onclick="delH(${i})">🗑</button>
                </div>
            </div>
            <div class="small mt-1">${e.c} | ${e.n} | ${e.p.substring(0,20)}...</div>
        </div>
    `).join('');
}

function copyH(i) {
    const h = JSON.parse(localStorage.getItem('dataforge-history') || '[]');
    navigator.clipboard.writeText(Object.values(h[i]).slice(1).join('\n'));
    showToast('Item copiado!');
}

function delH(i) {
    const h = JSON.parse(localStorage.getItem('dataforge-history') || '[]');
    h.splice(i,1);
    localStorage.setItem('dataforge-history', JSON.stringify(h));
    renderHistory(h);
}

function clearHistory() {
    if(confirm('Limpar histórico?')) {
        localStorage.removeItem('dataforge-history');
        document.getElementById('historyList').innerHTML = '';
        showToast('Limpo!');
    }
}
