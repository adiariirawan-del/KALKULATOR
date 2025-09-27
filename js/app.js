class PWAApp {
    constructor() {
        this.deferredPrompt = null;
        this.initializeServiceWorker();
        this.initializeInstallPrompt();
        this.initializeNetworkStatus();
        this.initializeCalculator();
        this.initializeTheme();
    }

    initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }

    initializeInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        const installBtn = document.getElementById('installBtn');
        installBtn.addEventListener('click', async () => {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installBtn.classList.add('hidden');
                }
                this.deferredPrompt = null;
            }
        });
    }

    showInstallPrompt() {
        const installBtn = document.getElementById('installBtn');
        installBtn.classList.remove('hidden');
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            installBtn.classList.add('hidden');
        }, 10000);
    }

    initializeNetworkStatus() {
        const statusElement = document.getElementById('connectionStatus');
        
        const updateStatus = () => {
            if (navigator.onLine) {
                statusElement.textContent = '🟢 Online';
                statusElement.style.color = '#10b981';
            } else {
                statusElement.textContent = '🔴 Offline';
                statusElement.style.color = '#ef4444';
            }
        };

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        updateStatus();
    }

    initializeCalculator() {
        this.calculator = new ScientificCalculator();
    }

    initializeTheme() {
        this.themeManager = new ThemeManager();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PWAApp();
});
