class LoginPage {
  constructor() {
    this.name = 'login';
  }

  async render() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <h2>FocusMode</h2>
          <div class="auth-tabs">
            <div class="auth-tab active" data-tab="login">Login</div>
            <div class="auth-tab" data-tab="register">Register</div>
          </div>
          
          <form id="loginForm" class="auth-form active">
            <div class="form-group">
              <label for="loginEmail">Email</label>
              <input type="email" id="loginEmail" placeholder="Masukkan email Anda" required>
              <i class="fas fa-envelope"></i>
            </div>
            <div class="form-group">
              <label for="loginPassword">Password</label>
              <input type="password" id="loginPassword" placeholder="Masukkan password Anda" required>
              <i class="fas fa-lock"></i>
            </div>
            <button type="submit" class="btn" style="width: 100%;">Login</button>
            <div class="form-footer">
              <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Auth tabs
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        this.switchAuthTab(tabName);
      });
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
  }

  switchAuthTab(tabName) {
    if (tabName === 'register') {
      window.location.hash = '#/register';
      return;
    }

    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
      if (tab.getAttribute('data-tab') === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    document.getElementById('loginForm').classList.add('active');
  }

  async handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Simple validation
    if (!email || !password) {
      this.showError('Harap isi semua field');
      return;
    }

    try {
      const response = await fetch('http://localhost:3307/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Save token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        
        // Redirect to home
        window.location.hash = '#/';
        
      } else {
        const errorData = await response.json();
        this.showError(errorData.error || 'Login gagal');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to local login
      this.handleLocalLogin(email, password);
    }
  }

  handleLocalLogin(email, password) {
    // Simulate API call for local fallback
    try {
      const user = {
        id: Date.now(),
        name: email.split('@')[0],
        email: email,
        avatar: email.charAt(0).toUpperCase()
      };

      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Redirect to home
      window.location.hash = '#/';
      
    } catch (error) {
      this.showError('Login gagal. Periksa email dan password Anda.');
    }
  }

  showError(message) {
    // Remove existing error
    const existingError = document.querySelector('.auth-error');
    if (existingError) {
      existingError.remove();
    }

    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'auth-error';
    errorElement.style.cssText = `
      background: #e17055;
      color: white;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
    `;
    errorElement.textContent = message;

    // Insert before form
    const form = document.getElementById('loginForm');
    form.parentNode.insertBefore(errorElement, form);
  }
}

export default LoginPage;