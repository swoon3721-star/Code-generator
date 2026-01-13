// Sistema de Geração de Códigos
class CodeGenerator {
    constructor() {
        this.currentCode = null;
        this.expirationTime = null;
        this.timer = null;
        this.history = this.loadHistory();
        this.init();
    }
    
    init() {
        this.updateStats();
        this.updateHistory();
        this.setupEventListeners();
        setTimeout(() => this.generate(), 500);
    }
    
    generate() {
        // Gerar código aleatório: XXXX-XXXX
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.currentCode = code.slice(0, 4) + '-' + code.slice(4);
        
        // Definir expiração (30 minutos)
        this.expirationTime = new Date();
        this.expirationTime.setMinutes(this.expirationTime.getMinutes() + 30);
        
        // Atualizar display
        this.updateDisplay();
        this.startTimer();
        this.addToHistory(this.currentCode);
        this.updateStats();
        this.showToast('✅ Novo código gerado!', 'success');
        
        // Efeito visual
        document.getElementById('codeDisplay').classList.add('pulse');
        setTimeout(() => {
            document.getElementById('codeDisplay').classList.remove('pulse');
        }, 500);
    }
    
    updateDisplay() {
        const codeElement = document.getElementById('currentCode');
        if (codeElement) {
            codeElement.textContent = this.currentCode;
        }
    }
    
    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => this.updateCountdown(), 1000);
        this.updateCountdown();
    }
    
    updateCountdown() {
        if (!this.expirationTime) return;
        const now = new Date();
        const diff = this.expirationTime - now;
        
        if (diff <= 0) {
            clearInterval(this.timer);
            document.getElementById('countdown').textContent = 'EXPIRADO';
            document.getElementById('timer').style.background = '#f8d7da';
            document.getElementById('timer').style.color = '#721c24';
            document.getElementById('timer').style.borderColor = '#f5c6cb';
            return;
        }
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        document.getElementById('countdown').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (minutes < 5) {
            document.getElementById('timer').style.animation = 'pulse 1s infinite';
        }
    }
    
    copyToClipboard() {
        if (!this.currentCode) {
            this.showToast('❌ Gere um código primeiro!', 'error');
            return;
        }
        
        const codeToCopy = this.currentCode.replace('-', '');
        navigator.clipboard.writeText(codeToCopy).then(() => {
            const btn = document.getElementById('copyBtn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
            btn.style.background = '#2196F3';
            this.showToast('✅ Código copiado!', 'success');
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 2000);
        }).catch(err => {
            this.showToast('❌ Erro ao copiar', 'error');
        });
    }
    
    addToHistory(code) {
        const historyItem = {
            code: code,
            timestamp: new Date().toISOString(),
            expires: this.expirationTime.toISOString()
        };
        this.history.unshift(historyItem);
        if (this.history.length > 10) this.history = this.history.slice(0, 10);
        this.saveHistory();
        this.updateHistory();
    }
    
    updateHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="empty-history"><i class="fas fa-code"></i><p>Nenhum código gerado ainda</p></div>';
            return;
        }
        
        historyList.innerHTML = '';
        this.history.forEach(item => {
            const now = new Date();
            const expires = new Date(item.expires);
            const isExpired = expires < now;
            const time = new Date(item.timestamp);
            const timeStr = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            const historyItem = document.createElement('div');
            historyItem.className = 'code-item';
            historyItem.innerHTML = `<div><div class="code-text">${item.code}</div><div class="code-time">${timeStr}</div></div><div class="code-status ${isExpired ? 'status-expired' : 'status-valid'}">${isExpired ? 'Expirado' : 'Válido'}</div>`;
            historyList.appendChild(historyItem);
        });
    }
    
    clearHistory() {
        if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
            this.history = [];
            this.saveHistory();
            this.updateHistory();
            this.updateStats();
            this.showToast('🗑️ Histórico limpo!', 'info');
        }
    }
    
    updateStats() {
        const now = new Date();
        const validCodes = this.history.filter(item => {
            const expires = new Date(item.expires);
            return expires > now;
        }).length;
        document.getElementById('totalCodes').textContent = this.history.length;
        document.getElementById('validCodes').textContent = validCodes;
    }
    
    loadHistory() {
        try {
            const saved = localStorage.getItem('codeHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    }
    
    saveHistory() {
        try {
            localStorage.setItem('codeHistory', JSON.stringify(this.history));
        } catch (e) { console.error('Erro ao salvar histórico:', e); }
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        const colors = { success: '#4CAF50', error: '#dc3545', info: '#17a2b8', warning: '#ffc107' };
        toast.textContent = message;
        toast.style.background = colors[type] || colors.info;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Enter' || e.code === 'Space') this.generate();
        });
        document.getElementById('currentCode').addEventListener('click', () => this.copyToClipboard());
    }
}

// Funções globais
function generateNewCode() { codeGen.generate(); }
function copyToClipboard() { codeGen.copyToClipboard(); }
function clearHistory() { codeGen.clearHistory(); }

// Inicializar
let codeGen;
document.addEventListener('DOMContentLoaded', () => { codeGen = new CodeGenerator(); });