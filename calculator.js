class ScientificCalculator {
    constructor() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.waitingForNewValue = false;
        this.memory = 0;
        this.history = [];
        this.currentBase = 'dec';
        
        this.initializeEventListeners();
        this.loadFromStorage();
        this.updateDisplay();
    }

    initializeEventListeners() {
        // Number buttons
        document.querySelectorAll('.btn.number').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.inputNumber(e.target.dataset.number);
            });
        });

        // Operator buttons
        document.querySelectorAll('.btn.operator').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.inputOperator(e.target.dataset.action);
            });
        });

        // Scientific functions
        document.querySelectorAll('.btn.scientific').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.scientificFunction(e.target.dataset.action);
            });
        });

        // Programmer functions
        document.querySelectorAll('.btn.programmer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.programmerFunction(e.target.dataset.action);
            });
        });

        // Memory buttons
        document.querySelectorAll('.btn.memory').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.memoryFunction(e.target.dataset.action);
            });
        });

        // Mode switching
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchMode(e.target.id);
            });
        });

        // Base switching
        document.querySelectorAll('.base-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchBase(e.target.dataset.base);
            });
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });

        // History clear
        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });

        // History item click
        document.getElementById('historyList').addEventListener('click', (e) => {
            if (e.target.classList.contains('history-item')) {
                this.useHistoryItem(e.target.dataset.calculation);
            }
        });
    }

    inputNumber(num) {
        if (this.waitingForNewValue) {
            this.currentValue = num;
            this.waitingForNewValue = false;
        } else {
            this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
        }
        this.updateDisplay();
    }

    inputOperator(op) {
        const inputVal = parseFloat(this.currentValue);

        switch(op) {
            case 'clear':
                this.clear();
                break;
            case 'clear-entry':
                this.clearEntry();
                break;
            case 'backspace':
                this.backspace();
                break;
            case '±':
                this.toggleSign();
                break;
            case '=':
                if (this.operation && this.previousValue !== '') {
                    this.calculate();
                }
                break;
            default:
                if (this.previousValue !== '' && this.operation && !this.waitingForNewValue) {
                    this.calculate();
                }
                this.operation = op;
                this.previousValue = this.currentValue;
                this.waitingForNewValue = true;
        }
        this.updateDisplay();
    }

    scientificFunction(func) {
        const val = parseFloat(this.currentValue);
        let result;

        switch(func) {
            case 'sin': result = Math.sin(val * Math.PI / 180); break;
            case 'cos': result = Math.cos(val * Math.PI / 180); break;
            case 'tan': result = Math.tan(val * Math.PI / 180); break;
            case 'sin⁻¹': result = Math.asin(val) * 180 / Math.PI; break;
            case 'cos⁻¹': result = Math.acos(val) * 180 / Math.PI; break;
            case 'tan⁻¹': result = Math.atan(val) * 180 / Math.PI; break;
            case 'log': result = Math.log10(val); break;
            case 'ln': result = Math.log(val); break;
            case 'log₁₀': result = Math.log10(val); break;
            case 'eˣ': result = Math.exp(val); break;
            case 'π': result = Math.PI; break;
            case 'e': result = Math.E; break;
            case 'x²': result = Math.pow(val, 2); break;
            case 'x³': result = Math.pow(val, 3); break;
            case 'xʸ': 
                this.operation = 'xʸ';
                this.previousValue = this.currentValue;
                this.waitingForNewValue = true;
                return;
            case '√': result = Math.sqrt(val); break;
            case '∛': result = Math.cbrt(val); break;
            case '10ˣ': result = Math.pow(10, val); break;
            case '1/x': result = 1 / val; break;
            case '!': result = this.factorial(val); break;
        }

        this.addToHistory(`${func}(${val}) = ${result}`);
        this.currentValue = result.toString();
        this.updateDisplay();
    }

    programmerFunction(func) {
        const val = parseInt(this.currentValue, 10);
        let result;

        switch(func) {
            case 'and': 
            case 'or': 
            case 'xor': 
            case 'mod':
                this.operation = func;
                this.previousValue = this.currentValue;
                this.waitingForNewValue = true;
                return;
            case 'not': result = ~val; break;
            case 'lsh': result = val << 1; break;
            case 'rsh': result = val >> 1; break;
            case '<<': 
            case '>>': 
                this.operation = func;
                this.previousValue = this.currentValue;
                this.waitingForNewValue = true;
                return;
            case '~': result = ~val; break;
            default:
                if (['a','b','c','d','e','f'].includes(func)) {
                    this.inputHexDigit(func.toUpperCase());
                    return;
                }
        }

        if (result !== undefined) {
            this.addToHistory(`${func} ${val} = ${result}`);
            this.currentValue = this.convertBase(result.toString(10), this.currentBase);
        }
        this.updateDisplay();
    }

    memoryFunction(func) {
        const val = parseFloat(this.currentValue);

        switch(func) {
            case 'mc': this.memory = 0; break;
            case 'mr': this.currentValue = this.memory.toString(); break;
            case 'm+': this.memory += val; break;
            case 'm-': this.memory -= val; break;
            case 'ms': this.memory = val; break;
        }

        this.updateMemoryDisplay();
        this.updateDisplay();
    }

    calculate() {
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;

        switch(this.operation) {
            case '+': result = prev + current; break;
            case '-': result = prev - current; break;
            case '*': result = prev * current; break;
            case '/': result = prev / current; break;
            case 'xʸ': result = Math.pow(prev, current); break;
            case 'and': result = prev & current; break;
            case 'or': result = prev | current; break;
            case 'xor': result = prev ^ current; break;
            case 'mod': result = prev % current; break;
            case '<<': result = prev << current; break;
            case '>>': result = prev >> current; break;
        }

        this.addToHistory(`${prev} ${this.operation} ${current} = ${result}`);
        this.currentValue = result.toString();
        this.operation = null;
        this.previousValue = '';
        this.waitingForNewValue = true;
        this.updateDisplay();
    }

    // Helper methods
    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.waitingForNewValue = false;
    }

    clearEntry() {
        this.currentValue = '0';
    }

    backspace() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
    }

    toggleSign() {
        this.currentValue = (parseFloat(this.currentValue) * -1).toString();
    }

    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    inputHexDigit(digit) {
        if (this.currentBase === 'hex') {
            this.inputNumber(digit);
        }
    }

    convertBase(number, toBase) {
        const num = parseInt(number, 10);
        switch(toBase) {
            case 'hex': return num.toString(16).toUpperCase();
            case 'bin': return num.toString(2);
            case 'oct': return num.toString(8);
            default: return number;
        }
    }

    switchMode(modeId) {
        document.querySelectorAll('.calculator').forEach(calc => {
            calc.classList.remove('active');
        });
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.getElementById(modeId).classList.add('active');
        document.querySelector(`#${modeId}`).classList.add('active');

        // Reset calculator when switching modes
        this.clear();
    }

    switchBase(base) {
        document.querySelectorAll('.base-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-base="${base}"]`).classList.add('active');
        
        this.currentBase = base;
        this.currentValue = this.convertBase(this.currentValue, base);
        this.updateDisplay();
    }

    addToHistory(calculation) {
        this.history.unshift({
            calculation,
            timestamp: new Date().toLocaleString()
        });
        
        if (this.history.length > 50) {
            this.history.pop();
        }
        
        this.saveToStorage();
        this.updateHistoryDisplay();
    }

    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
        this.saveToStorage();
    }

    useHistoryItem(calculation) {
        const result = calculation.split('=')[1].trim();
        this.currentValue = result;
        this.updateDisplay();
    }

    updateDisplay() {
        document.getElementById('mainDisplay').textContent = this.currentValue;
        document.getElementById('historyDisplay').textContent = 
            this.previousValue && this.operation ? 
            `${this.previousValue} ${this.operation}` : '';
    }

    updateMemoryDisplay() {
        const indicator = document.getElementById('memoryIndicator');
        indicator.textContent = this.memory !== 0 ? `M: ${this.memory}` : '';
        document.getElementById('memoryStatus').textContent = `Memori: ${this.memory}`;
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = this.history.map((item, index) => `
            <div class="history-item" data-calculation="${item.calculation}">
                <div>${item.calculation}</div>
                <small>${item.timestamp}</small>
            </div>
        `).join('');
    }

    handleKeyboardInput(e) {
        e.preventDefault();
        const key = e.key;

        if (/[0-9]/.test(key)) {
            this.inputNumber(key);
        } else if (['+', '-', '*', '/'].includes(key)) {
            this.inputOperator(key === '*' ? '*' : key === '/' ? '/' : key);
        } else if (key === 'Enter' || key === '=') {
            this.inputOperator('=');
        } else if (key === 'Escape' || key === 'Delete') {
            this.clear();
        } else if (key === 'Backspace') {
            this.backspace();
        }
    }

    saveToStorage() {
        if (typeof Storage !== 'undefined') {
            localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
            localStorage.setItem('calculatorMemory', this.memory.toString());
        }
    }

    loadFromStorage() {
        if (typeof Storage !== 'undefined') {
            const savedHistory = localStorage.getItem('calculatorHistory');
            const savedMemory = localStorage.getItem('calculatorMemory');
            
            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
            }
            
            if (savedMemory) {
                this.memory = parseFloat(savedMemory);
            }
            
            this.updateHistoryDisplay();
            this.updateMemoryDisplay();
        }
    }
}
