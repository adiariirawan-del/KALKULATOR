class ThemeManager {
    constructor() {
        this.currentTheme = this.getPreferredTheme();
        this.applyTheme();
        this.initializeThemeToggle();
    }

    getPreferredTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        // Update theme button icon
        const themeBtn = document.getElementById('themeToggle');
        themeBtn.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
    }

    initializeThemeToggle() {
        const themeBtn = document.getElementById('themeToggle');
        themeBtn.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
    }
}
