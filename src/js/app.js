import './js/install.js';
import './js/notification.js';
import './js/offline.js';

class App {
  constructor() {
    this.router = new RouterService();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkAuth();
    this.loadPage();
  }

  setupEventListeners() {
    // Hash change listener for SPA routing
    window.addEventListener('hashchange', () => {
      this.loadPage();
    });

    // Load event listener
    window.addEventListener('load', () => {
      this.loadPage();
    });

    // Online/offline events
    window.addEventListener('online', () => {
      this.showOnlineStatus();
    });

    window.addEventListener('offline', () => {
      this.showOfflineStatus();
    });
  }

  checkAuth() {
    const currentUser = Auth.getCurrentUser();
    const isAuthPage = window.location.hash.includes('login') || 
                      window.location.hash.includes('register');

    if (!currentUser && !isAuthPage) {
      window.location.hash = '#/login';
    } else if (currentUser && isAuthPage) {
      window.location.hash = '#/';
    }
  }

  async loadPage() {
    this.checkAuth();
    await this.router.renderPage();
    this.updateActiveNav();
  }

  updateActiveNav() {
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('nav a');
    navItems.forEach(item => item.classList.remove('active'));

    // Add active class to current page
    const currentHash = window.location.hash.slice(2) || 'beranda';
    const currentNavItem = document.querySelector(`nav a[href="#/${currentHash}"]`);
    if (currentNavItem) {
      currentNavItem.classList.add('active');
    }
  }

  showOnlineStatus() {
    console.log('App is online');
    // You can show a toast or update UI here
  }

  showOfflineStatus() {
    console.log('App is offline');
    // You can show a toast or update UI here
  }
}

export default App;