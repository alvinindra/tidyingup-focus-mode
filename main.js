// Import service worker dan notifikasi
import { NotificationManager } from './src/js/notification.js';
import { OfflineManager } from './src/js/offline.js';
import './src/styles/responsive.css';
import './src/styles/styles.css';

// Tambahkan di bagian atas main.js
const API_BASE_URL = 'http://localhost:3001/api';
let authToken = null;

// Fungsi helper untuk API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Update fungsi login/register di main.js untuk menggunakan API

// Inisialisasi Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Inisialisasi Notifikasi
async function initializeNotifications() {
  try {
    await NotificationManager.requestPermission();
    console.log('Notification permission granted');
  } catch (error) {
    console.log('Notification permission denied');
  }
}

// Panggil inisialisasi notifikasi
initializeNotifications();

// Simple authentication state
let currentUser = null;

// Check if user is logged in
function checkAuth() {
  const user = localStorage.getItem('currentUser');
  if (user) {
    currentUser = JSON.parse(user);
    showMainApp();
  } else {
    showAuthPage();
  }
}

// Show authentication page dengan soft blue theme
function showAuthPage() {
  document.getElementById('auth-container').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('loading-indicator').classList.add('hidden');

  document.getElementById('auth-container').innerHTML = `
    <div class="auth-container" style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);">
      <div class="auth-card" style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(187, 222, 251, 0.3);">
        <div class="logo" style="text-align: center; margin-bottom: 2rem;">
          <i class="fas fa-brain" style="font-size: 3rem; background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
          <h2 style="margin-top: 1rem; font-weight: 700; color: #1565c0;">FocusMode</h2>
          <p style="color: #546e7a; margin-top: 0.5rem;">Premium Learning Experience</p>
        </div>
        
        <div class="auth-tabs" style="background: rgba(187, 222, 251, 0.3); border-radius: 50px; padding: 5px; backdrop-filter: blur(10px);">
          <div class="auth-tab active" data-tab="login" style="color: #1565c0;">Login</div>
          <div class="auth-tab" data-tab="register" style="color: #1565c0;">Register</div>
        </div>
        
        <form id="loginForm" class="auth-form active">
          <div class="form-group">
            <label for="email" style="color: #1565c0; font-weight: 600;">Email</label>
            <input type="email" id="email" placeholder="Masukkan email Anda" required 
                   style="border: 2px solid #bbdefb; border-radius: 12px; padding: 0.8rem 1rem; font-size: 1rem; transition: all 0.3s ease; background: white;">
          </div>
          <div class="form-group">
            <label for="password" style="color: #1565c0; font-weight: 600;">Password</label>
            <input type="password" id="password" placeholder="Masukkan password Anda" required 
                   style="border: 2px solid #bbdefb; border-radius: 12px; padding: 0.8rem 1rem; font-size: 1rem; transition: all 0.3s ease; background: white;">
          </div>
          <button type="submit" class="btn" style="width: 100%; background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%); color: white; border: none; border-radius: 50px; padding: 1rem 2rem; font-weight: 700; cursor: pointer; transition: all 0.3s ease;">Login</button>
          <div class="form-footer">
            <p style="color: #546e7a;">Belum punya akun? <a href="#" id="switchToRegister" style="color: #1976d2; text-decoration: none; font-weight: 500;">Daftar di sini</a></p>
          </div>
        </form>
        
        <form id="registerForm" class="auth-form">
          <div class="form-group">
            <label for="regName" style="color: #1565c0; font-weight: 600;">Nama Lengkap</label>
            <input type="text" id="regName" placeholder="Masukkan nama lengkap" required 
                   style="border: 2px solid #bbdefb; border-radius: 12px; padding: 0.8rem 1rem; font-size: 1rem; transition: all 0.3s ease; background: white;">
          </div>
          <div class="form-group">
            <label for="regEmail" style="color: #1565c0; font-weight: 600;">Email</label>
            <input type="email" id="regEmail" placeholder="Masukkan email Anda" required 
                   style="border: 2px solid #bbdefb; border-radius: 12px; padding: 0.8rem 1rem; font-size: 1rem; transition: all 0.3s ease; background: white;">
          </div>
          <div class="form-group">
            <label for="regPassword" style="color: #1565c0; font-weight: 600;">Password</label>
            <input type="password" id="regPassword" placeholder="Buat password (min. 6 karakter)" required minlength="6" 
                   style="border: 2px solid #bbdefb; border-radius: 12px; padding: 0.8rem 1rem; font-size: 1rem; transition: all 0.3s ease; background: white;">
          </div>
          <div class="form-group">
            <label for="regConfirmPassword" style="color: #1565c0; font-weight: 600;">Konfirmasi Password</label>
            <input type="password" id="regConfirmPassword" placeholder="Konfirmasi password Anda" required 
                   style="border: 2px solid #bbdefb; border-radius: 12px; padding: 0.8rem 1rem; font-size: 1rem; transition: all 0.3s ease; background: white;">
          </div>
          <button type="submit" class="btn" style="width: 100%; background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%); color: white; border: none; border-radius: 50px; padding: 1rem 2rem; font-weight: 700; cursor: pointer; transition: all 0.3s ease;">Daftar</button>
          <div class="form-footer">
            <p style="color: #546e7a;">Sudah punya akun? <a href="#" id="switchToLogin" style="color: #1976d2; text-decoration: none; font-weight: 500;">Login di sini</a></p>
          </div>
        </form>
      </div>
    </div>
  `;

  // Add hover effects for inputs
  const style = document.createElement('style');
  style.textContent = `
    .auth-container input:focus {
      outline: none;
      border-color: #1976d2 !important;
      box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1) !important;
    }
    
    .auth-tab.active {
      background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%) !important;
      color: white !important;
      box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3) !important;
    }
    
    .auth-tab {
      transition: all 0.3s ease !important;
    }
    
    .auth-tab:hover:not(.active) {
      background: rgba(25, 118, 210, 0.1) !important;
    }
    
    .btn:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(25, 118, 210, 0.4) !important;
    }
    
    a:hover {
      text-decoration: underline !important;
    }
  `;
  document.head.appendChild(style);

  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      switchAuthTab(tabName);
    });
  });

  document.getElementById('switchToRegister').addEventListener('click', (e) => {
    e.preventDefault();
    switchAuthTab('register');
  });

  document.getElementById('switchToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    switchAuthTab('login');
  });

  // Handle login
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      showMainApp();
      NotificationManager.show('Selamat Datang!', {
        body: `Halo ${user.name}, selamat belajar!`,
        icon: '/icons/icon-192x192.png'
      });
    } else {
      showToast('Email atau password salah!', 'error');
    }
  });

  // Handle register
  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (password !== confirmPassword) {
      showToast('Password dan konfirmasi tidak cocok!', 'error');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
      showToast('Email sudah terdaftar!', 'error');
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      avatar: name.charAt(0).toUpperCase(),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showMainApp();
    showToast('Akun berhasil dibuat!', 'success');
    NotificationManager.show('Akun Berhasil Dibuat!', {
      body: `Selamat ${name}, akun premium Anda telah aktif!`,
      icon: '/icons/icon-192x192.png'
    });
  });
}

function switchAuthTab(tabName) {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
  });
  document.getElementById('loginForm').classList.toggle('active', tabName === 'login');
  document.getElementById('registerForm').classList.toggle('active', tabName === 'register');
}

// Show main application
function showMainApp() {
  document.getElementById('auth-container').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('loading-indicator').classList.add('hidden');

  const userProfile = document.getElementById('user-profile');
  if (userProfile) {
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-avatar').innerHTML = `<span class="avatar-initial premium-avatar">${currentUser.avatar}</span>`;
  }

  loadPage();

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('currentUser');
      currentUser = null;
      location.reload();
    });
  }
}

// Data management
const DataManager = {
  getNotes() {
    return JSON.parse(localStorage.getItem(`notes_${currentUser.id}`) || '[]');
  },
  saveNote(note) {
    const notes = this.getNotes();
    if (note.id) {
      const index = notes.findIndex(n => n.id === note.id);
      if (index !== -1) {
        notes[index] = { ...notes[index], ...note, updatedAt: new Date().toISOString() };
      }
    } else {
      note.id = Date.now();
      note.createdAt = new Date().toISOString();
      note.updatedAt = note.createdAt;
      note.userId = currentUser.id;
      notes.push(note);
    }
    localStorage.setItem(`notes_${currentUser.id}`, JSON.stringify(notes));
    return note;
  },
  deleteNote(id) {
    const notes = this.getNotes().filter(n => n.id !== id);
    localStorage.setItem(`notes_${currentUser.id}`, JSON.stringify(notes));
  },

  getBooks() {
    return JSON.parse(localStorage.getItem(`books_${currentUser.id}`) || '[]');
  },
  saveBook(book) {
    const books = this.getBooks();
    if (book.id) {
      const index = books.findIndex(b => b.id === book.id);
      if (index !== -1) {
        books[index] = { ...books[index], ...book, updatedAt: new Date().toISOString() };
      }
    } else {
      book.id = Date.now();
      book.createdAt = new Date().toISOString();
      book.updatedAt = book.createdAt;
      book.userId = currentUser.id;
      book.isComplete = false;
      books.push(book);
    }
    localStorage.setItem(`books_${currentUser.id}`, JSON.stringify(books));
    return book;
  },
  deleteBook(id) {
    const books = this.getBooks().filter(b => b.id !== id);
    localStorage.setItem(`books_${currentUser.id}`, JSON.stringify(books));
  },
  toggleBookStatus(id) {
    const books = this.getBooks();
    const book = books.find(b => b.id === id);
    if (book) {
      book.isComplete = !book.isComplete;
      book.updatedAt = new Date().toISOString();
      localStorage.setItem(`books_${currentUser.id}`, JSON.stringify(books));
    }
  }
};

// Focus Mode Timer
let timerInterval;
let timerMinutes = 25;
let timerSeconds = 0;
let isTimerRunning = false;
let currentTimerType = 'pomodoro';

const TimerManager = {
  startTimer(minutes = 25) {
    if (isTimerRunning) return;
    
    timerMinutes = minutes;
    timerSeconds = 0;
    isTimerRunning = true;
    currentTimerType = minutes === 25 ? 'pomodoro' : minutes === 5 ? 'short-break' : 'long-break';
    
    this.updateTimerDisplay();
    
    timerInterval = setInterval(() => {
      if (timerSeconds === 0) {
        if (timerMinutes === 0) {
          this.timerComplete();
          return;
        }
        timerMinutes--;
        timerSeconds = 59;
      } else {
        timerSeconds--;
      }
      this.updateTimerDisplay();
    }, 1000);
    
    // Update UI
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    const resetBtn = document.getElementById('reset-timer');
    
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
    if (resetBtn) resetBtn.disabled = false;
    
    // Show notification
    NotificationManager.show('Timer Dimulai!', {
      body: `Fokus selama ${minutes} menit dimulai sekarang!`,
      icon: '/icons/icon-192x192.png'
    });
  },
  
  pauseTimer() {
    if (!isTimerRunning) return;
    
    clearInterval(timerInterval);
    isTimerRunning = false;
    
    // Update UI
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    
    // Show notification
    NotificationManager.show('Timer Dijeda', {
      body: 'Sesi fokus Anda telah dijeda.',
      icon: '/icons/icon-192x192.png'
    });
  },
  
  resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    
    // Reset to current timer type
    if (currentTimerType === 'pomodoro') timerMinutes = 25;
    else if (currentTimerType === 'short-break') timerMinutes = 5;
    else timerMinutes = 15;
    
    timerSeconds = 0;
    this.updateTimerDisplay();
    
    // Update UI
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    const resetBtn = document.getElementById('reset-timer');
    
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    if (resetBtn) resetBtn.disabled = false;
  },
  
  updateTimerDisplay() {
    const display = document.querySelector('.timer-display');
    if (display) {
      display.textContent = `${timerMinutes.toString().padStart(2, '0')}:${timerSeconds.toString().padStart(2, '0')}`;
    }
  },
  
  timerComplete() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    
    // Show notification
    showToast('Timer selesai!', 'success');
    NotificationManager.showTimerComplete();
    
    // Play sound (jika diperlukan)
    this.playCompletionSound();
    
    // Update UI
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    
    // Auto-start break if it was a pomodoro session
    if (currentTimerType === 'pomodoro') {
      setTimeout(() => {
        if (confirm('Pomodoro selesai! Mulai istirahat pendek?')) {
          this.startTimer(5);
        }
      }, 1000);
    }
  },
  
  playCompletionSound() {
    // Implement sound notification jika diperlukan
    console.log('Timer completed - play sound');
  }
};

// Session Manager
const SessionManager = {
  getSessions() {
    return JSON.parse(localStorage.getItem(`sessions_${currentUser.id}`) || '[]');
  },
  
  saveSession(session) {
    const sessions = this.getSessions();
    if (session.id) {
      const index = sessions.findIndex(s => s.id === session.id);
      if (index !== -1) {
        sessions[index] = { ...sessions[index], ...session, updatedAt: new Date().toISOString() };
      }
    } else {
      session.id = Date.now();
      session.createdAt = new Date().toISOString();
      session.updatedAt = session.createdAt;
      session.userId = currentUser.id;
      session.status = 'planned';
      sessions.push(session);
    }
    localStorage.setItem(`sessions_${currentUser.id}`, JSON.stringify(sessions));
    return session;
  },
  
  deleteSession(id) {
    const sessions = this.getSessions().filter(s => s.id !== id);
    localStorage.setItem(`sessions_${currentUser.id}`, JSON.stringify(sessions));
  },
  
  startSession(id) {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === id);
    if (session) {
      session.status = 'inprogress';
      session.startedAt = new Date().toISOString();
      localStorage.setItem(`sessions_${currentUser.id}`, JSON.stringify(sessions));
    }
  },
  
  completeSession(id) {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === id);
    if (session) {
      session.status = 'completed';
      session.completedAt = new Date().toISOString();
      localStorage.setItem(`sessions_${currentUser.id}`, JSON.stringify(sessions));
    }
  }
};

// Modal Manager - FIXED VERSION
const ModalManager = {
  showModal(title, content) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal premium-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content premium-modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <span class="close-modal">×</span>
        </div>
        ${content}
      </div>
    `;
    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { 
      if (e.target === modal) modal.remove(); 
    });

    return modal;
  },

  showNoteModal(note = null) {
    const isEdit = !!note;
    const content = `
      <form id="noteForm" class="premium-form">
        <div class="form-group">
          <label>Judul Catatan</label>
          <input type="text" id="noteTitle" value="${note?.title || ''}" required class="premium-input">
        </div>
        <div class="form-group">
          <label>Isi Catatan</label>
          <textarea id="noteContent" rows="6" required class="premium-input">${note?.content || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Kategori</label>
          <select id="noteCategory" class="premium-input">
            ${['study', 'personal', 'work', 'other'].map(cat => `
              <option value="${cat}" ${note?.category === cat ? 'selected' : ''}>
                ${getCategoryLabel(cat)}
              </option>
            `).join('')}
          </select>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <button type="button" class="btn btn-secondary premium-btn-secondary" id="cancelNote">Batal</button>
          <button type="submit" class="btn premium-btn">${isEdit ? 'Update' : 'Simpan'}</button>
        </div>
      </form>
    `;

    const modal = this.showModal(isEdit ? 'Edit Catatan' : 'Tambah Catatan', content);
    
    // Add event listeners
    modal.querySelector('#cancelNote').addEventListener('click', () => modal.remove());
    modal.querySelector('#noteForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        title: document.getElementById('noteTitle').value.trim(),
        content: document.getElementById('noteContent').value.trim(),
        category: document.getElementById('noteCategory').value
      };
      if (isEdit) data.id = note.id;
      DataManager.saveNote(data);
      modal.remove();
      showToast(isEdit ? 'Catatan diperbarui!' : 'Catatan ditambahkan!', 'success');
      loadPage();
    });
  },

  showBookModal(book = null) {
    const isEdit = !!book;
    const content = `
      <form id="bookForm" class="premium-form">
        <div class="form-group">
          <label>Judul Buku</label>
          <input type="text" id="bookTitle" value="${book?.title || ''}" required class="premium-input">
        </div>
        <div class="form-group">
          <label>Penulis</label>
          <input type="text" id="bookAuthor" value="${book?.author || ''}" required class="premium-input">
        </div>
        <div class="form-group">
          <label>Deskripsi</label>
          <textarea id="bookDescription" rows="4" class="premium-input">${book?.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Kategori</label>
          <select id="bookCategory" class="premium-input">
            ${['academic', 'fiction', 'non-fiction', 'reference'].map(cat => `
              <option value="${cat}" ${book?.category === cat ? 'selected' : ''}>
                ${getBookCategoryLabel(cat)}
              </option>
            `).join('')}
          </select>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <button type="button" class="btn btn-secondary premium-btn-secondary" id="cancelBook">Batal</button>
          <button type="submit" class="btn premium-btn">${isEdit ? 'Update' : 'Simpan'}</button>
        </div>
      </form>
    `;

    const modal = this.showModal(isEdit ? 'Edit Buku' : 'Tambah Buku', content);
    
    // Add event listeners
    modal.querySelector('#cancelBook').addEventListener('click', () => modal.remove());
    modal.querySelector('#bookForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        title: document.getElementById('bookTitle').value.trim(),
        author: document.getElementById('bookAuthor').value.trim(),
        description: document.getElementById('bookDescription').value.trim(),
        category: document.getElementById('bookCategory').value
      };
      if (isEdit) data.id = book.id;
      DataManager.saveBook(data);
      modal.remove();
      showToast(isEdit ? 'Buku diperbarui!' : 'Buku ditambahkan!', 'success');
      loadPage();
    });
  },

  showSessionModal(session = null) {
    const isEdit = !!session;
    const content = `
      <form id="sessionForm" class="premium-form">
        <div class="form-group">
          <label>Judul Sesi</label>
          <input type="text" id="sessionTitle" value="${session?.title || ''}" required class="premium-input">
        </div>
        <div class="form-group">
          <label>Deskripsi</label>
          <textarea id="sessionDescription" rows="3" class="premium-input">${session?.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Durasi (menit)</label>
          <input type="number" id="sessionDuration" value="${session?.duration || 25}" min="5" max="180" required class="premium-input">
        </div>
        <div class="form-group">
          <label>Mata Pelajaran/Topik</label>
          <input type="text" id="sessionSubject" value="${session?.subject || ''}" required class="premium-input">
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <button type="button" class="btn btn-secondary premium-btn-secondary" id="cancelSession">Batal</button>
          <button type="submit" class="btn premium-btn">${isEdit ? 'Update' : 'Simpan'}</button>
        </div>
      </form>
    `;

    const modal = this.showModal(isEdit ? 'Edit Sesi Belajar' : 'Tambah Sesi Belajar', content);
    
    // Add event listeners
    modal.querySelector('#cancelSession').addEventListener('click', () => modal.remove());
    modal.querySelector('#sessionForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        title: document.getElementById('sessionTitle').value.trim(),
        description: document.getElementById('sessionDescription').value.trim(),
        duration: parseInt(document.getElementById('sessionDuration').value),
        subject: document.getElementById('sessionSubject').value.trim()
      };
      if (isEdit) data.id = session.id;
      SessionManager.saveSession(data);
      modal.remove();
      showToast(isEdit ? 'Sesi diperbarui!' : 'Sesi ditambahkan!', 'success');
      loadPage();
    });
  }
};

// Render Notification Settings Page
function renderNotificationSettings() {
  return `
    <section class="settings-section premium-section">
      <div class="container">
        <h1 class="text-center premium-section-title">Pengaturan Notifikasi</h1>
        <p class="text-center premium-section-subtitle">Kelola preferensi notifikasi Anda</p>
       
        <div class="settings-card premium-card" style="max-width: 600px; margin: 0 auto;">
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="push-enabled" ${NotificationManager.getSettings().isPushEnabled ? 'checked' : ''}>
              <span>Web Push Notifications</span>
            </label>
            <small>Terima notifikasi bahkan ketika aplikasi tidak terbuka</small>
          </div>
         
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="daily-reminders" ${NotificationManager.getSettings().dailyReminders ? 'checked' : ''}>
              <span>Pengingat Harian</span>
            </label>
            <small>Notifikasi pengingat belajar setiap hari</small>
          </div>
         
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="session-reminders" ${NotificationManager.getSettings().sessionReminders ? 'checked' : ''}>
              <span>Pengingat Sesi</span>
            </label>
            <small>Pengingat sebelum sesi belajar dimulai</small>
          </div>
         
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="achievement-alerts" ${NotificationManager.getSettings().achievementAlerts ? 'checked' : ''}>
              <span>Pencapaian & Laporan</span>
            </label>
            <small>Notifikasi pencapaian dan laporan mingguan</small>
          </div>
         
          <div class="form-actions" style="margin-top: 2rem;">
            <button class="btn premium-btn" id="save-notification-settings">
              <i class="fas fa-save"></i> Simpan Pengaturan
            </button>
            <button class="btn premium-btn-secondary" id="test-notification">
              <i class="fas fa-bell"></i> Test Notifikasi
            </button>
          </div>
         
          <div class="notification-status" style="margin-top: 1.5rem; padding: 1rem; background: var(--soft-blue); border-radius: var(--border-radius-md);">
            <h4>Status Notifikasi:</h4>
            <p>Permission: <strong>${Notification.permission}</strong></p>
            <p>Service Worker: <strong>${'serviceWorker' in navigator ? 'Supported' : 'Not Supported'}</strong></p>
            <p>Push Manager: <strong>${'PushManager' in window ? 'Supported' : 'Not Supported'}</strong></p>
          </div>
        </div>
      </div>
    </section>
  `;
}

// Initialize Notification Settings Page
function initializeNotificationSettings() {
  const saveBtn = document.getElementById('save-notification-settings');
  const testBtn = document.getElementById('test-notification');
 
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const settings = {
        pushEnabled: document.getElementById('push-enabled').checked,
        dailyReminders: document.getElementById('daily-reminders').checked,
        sessionReminders: document.getElementById('session-reminders').checked,
        achievementAlerts: document.getElementById('achievement-alerts').checked
      };
     
      NotificationManager.updateSettings(settings);
      showToast('Pengaturan notifikasi disimpan!', 'success');
     
      // Jika daily reminders diaktifkan, jadwalkan pengingat
      if (settings.dailyReminders) {
        NotificationManager.scheduleDailyReminder(8, 0); // Setiap jam 8 pagi
      }
    });
  }
 
  if (testBtn) {
    testBtn.addEventListener('click', () => {
      NotificationManager.testNotification();
    });
  }
}

// Routing & Page Rendering
function loadPage() {
  const hash = window.location.hash.slice(2) || 'beranda';
  const mainContent = document.getElementById('main-content');

  const pages = {
    beranda: renderHomePage(),
    fitur: renderFeaturesPage(),
    'focus-mode': renderFocusModePage(),
    'sesi-belajar': renderSessionsPage(),
    catatan: renderNotesPage(),
    'rak-buku': renderBooksPage(),
    'pengaturan-notifikasi': renderNotificationSettings()
  };

  mainContent.innerHTML = pages[hash] || pages.beranda;

  // Initialize specific page functionality
  if (hash === 'focus-mode') initializeFocusModePage();
  if (hash === 'sesi-belajar') initializeSessionsPage();
  if (hash === 'catatan') initializeNotesPage();
  if (hash === 'rak-buku') initializeBooksPage();
  if (hash === 'pengaturan-notifikasi') initializeNotificationSettings();

  injectComponentStyles();
  updateActiveNav();
}

// Render functions - Enhanced with premium styling
function renderHomePage() {
  return `
    <section class="hero premium-hero">
      <div class="container">
        <h1 class="premium-title">Selamat Datang di FocusMode</h1>
        <p class="premium-subtitle">Platform pembelajaran premium untuk meningkatkan produktivitas belajar dengan teknik Pomodoro, manajemen waktu, dan pencatatan yang efektif.</p>
        <div class="hero-actions">
          <a href="#/focus-mode" class="btn premium-btn">Mulai Fokus</a>
          <a href="#/fitur" class="btn premium-btn-secondary">Pelajari Fitur</a>
        </div>
      </div>
    </section>
    
    <section class="features premium-features">
      <div class="container">
        <h2 class="text-center premium-section-title">Fitur Unggulan</h2>
        <div class="features-grid">
          <div class="feature-card premium-card">
            <i class="fas fa-clock feature-icon"></i>
            <h3>Timer Pomodoro</h3>
            <p>Teknik 25 menit fokus, 5 menit istirahat untuk meningkatkan konsentrasi belajar.</p>
          </div>
          <div class="feature-card premium-card">
            <i class="fas fa-book feature-icon"></i>
            <h3>Manajemen Catatan</h3>
            <p>Buat dan kelola catatan belajar dengan kategori yang terorganisir.</p>
          </div>
          <div class="feature-card premium-card">
            <i class="fas fa-tasks feature-icon"></i>
            <h3>Sesi Belajar</h3>
            <p>Jadwalkan dan pantau sesi belajar Anda dengan sistem pelacakan waktu.</p>
          </div>
          <div class="feature-card premium-card">
            <i class="fas fa-books feature-icon"></i>
            <h3>Rak Buku Digital</h3>
            <p>Kelola daftar bacaan dan progress belajar dari berbagai sumber.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderFeaturesPage() {
  return `
    <section class="features premium-features">
      <div class="container">
        <h1 class="text-center premium-section-title">Fitur FocusMode</h1>
        <p class="text-center premium-section-subtitle">
          Temukan semua fitur premium yang akan membantu Anda belajar lebih fokus dan produktif
        </p>
        
        <div class="features-grid">
          <div class="feature-card premium-card">
            <i class="fas fa-clock feature-icon"></i>
            <h3>Pomodoro Timer</h3>
            <p>Teknik waktu 25/5 untuk fokus maksimal dengan istirahat teratur.</p>
          </div>
          <div class="feature-card premium-card">
            <i class="fas fa-book feature-icon"></i>
            <h3>Smart Notes</h3>
            <p>Catatan terorganisir dengan kategori dan pencarian cepat.</p>
          </div>
          <div class="feature-card premium-card">
            <i class="fas fa-chart-line feature-icon"></i>
            <h3>Progress Tracking</h3>
            <p>Pantau perkembangan belajar dengan statistik visual.</p>
          </div>
          <div class="feature-card premium-card">
            <i class="fas fa-bell feature-icon"></i>
            <h3>Smart Reminders</h3>
            <p>Pengingat sesi belajar dan istirahat yang cerdas.</p>
          </div>
          <div class="feature-card premium-card">
            <i class="fas fa-moon feature-icon"></i>
            <h3>Focus Mode</h3>
            <p>Mode bebas gangguan untuk konsentrasi penuh.</p>
          </div>
          <div class="feature-card premium-card">
            <i class="fas fa-sync feature-icon"></i>
            <h3>Sync Across Devices</h3>
            <p>Data tersinkronisasi di semua perangkat Anda.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderFocusModePage() {
  return `
    <section class="focus-mode premium-section">
      <div class="container">
        <h1 class="text-center premium-section-title">Focus Mode</h1>
        <p class="text-center premium-section-subtitle">Gunakan teknik Pomodoro premium untuk meningkatkan fokus belajar</p>
        
        <div class="timer-controls premium-timer-controls">
          <button class="timer-btn premium-timer-btn active" data-minutes="25">Pomodoro (25m)</button>
          <button class="timer-btn premium-timer-btn" data-minutes="5">Istirahat Pendek (5m)</button>
          <button class="timer-btn premium-timer-btn" data-minutes="15">Istirahat Panjang (15m)</button>
        </div>
        
        <div class="timer-display premium-timer-display">25:00</div>
        
        <div class="timer-actions">
          <button class="btn premium-btn" id="start-timer">Mulai</button>
          <button class="btn premium-btn-secondary" id="pause-timer" disabled>Jeda</button>
          <button class="btn premium-btn-secondary" id="reset-timer">Reset</button>
        </div>
        
        <div class="session-info mt-2 premium-session-info">
          <h3>Sesi Saat Ini</h3>
          <p>Fokus pada: <span id="current-task" contenteditable="true">Belajar</span></p>
        </div>
      </div>
    </section>
  `;
}

function renderSessionsPage() {
  return `
    <section class="sessions premium-section">
      <div class="container">
        <h1 class="text-center premium-section-title">Sesi Belajar</h1>
        <p class="text-center premium-section-subtitle">Kelola jadwal dan progress sesi belajar Anda</p>
        
        <div class="session-actions">
          <button class="btn premium-btn" id="add-session">Tambah Sesi Baru</button>
        </div>
        
        <div class="session-list" id="session-list">
          <!-- Sessions will be populated by JavaScript -->
        </div>
      </div>
    </section>
  `;
}

function renderNotesPage() {
  return `
    <section class="notes-section premium-section">
      <div class="container">
        <h1 class="text-center premium-section-title">Catatan Belajar</h1>
        <p class="text-center premium-section-subtitle">Kelola semua catatan belajar Anda di satu tempat</p>
        
        <div class="notes-actions">
          <button class="btn premium-btn" id="add-note">Tambah Catatan Baru</button>
        </div>
        
        <div class="notes-filter" style="margin-bottom: 2rem; text-align: center;">
          <select id="note-category-filter" class="premium-input" style="display: inline-block; width: auto;">
            <option value="all">Semua Kategori</option>
            <option value="study">Studi</option>
            <option value="personal">Personal</option>
            <option value="work">Pekerjaan</option>
            <option value="other">Lainnya</option>
          </select>
        </div>
        
        <div class="notes-grid">
          <!-- Notes will be populated by JavaScript -->
        </div>
      </div>
    </section>
  `;
}

function renderBooksPage() {
  return `
    <section class="bookshelf-section premium-section">
      <div class="container">
        <h1 class="text-center premium-section-title">Rak Buku Digital</h1>
        <p class="text-center premium-section-subtitle">Kelola daftar bacaan dan progress belajar Anda</p>
        
        <div class="bookshelf-actions">
          <button class="btn premium-btn" id="add-book">Tambah Buku Baru</button>
        </div>
        
        <div class="bookshelf premium-bookshelf">
          <div class="bookshelf-rack premium-rack">
            <h3>Sedang Dibaca</h3>
            <div class="book-list" id="reading-books">
              <!-- Reading books will be populated here -->
            </div>
          </div>
          
          <div class="bookshelf-rack premium-rack">
            <h3>Selesai Dibaca</h3>
            <div class="book-list" id="completed-books">
              <!-- Completed books will be populated here -->
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

// Initialize Focus Mode Page
function initializeFocusModePage() {
  // Timer controls
  const timerButtons = document.querySelectorAll('.timer-btn');
  timerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      timerButtons.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');
      
      // Reset timer dengan durasi baru
      const minutes = parseInt(btn.getAttribute('data-minutes'));
      TimerManager.resetTimer();
      timerMinutes = minutes;
      TimerManager.updateTimerDisplay();
    });
  });

  // Timer actions
  const startBtn = document.getElementById('start-timer');
  const pauseBtn = document.getElementById('pause-timer');
  const resetBtn = document.getElementById('reset-timer');

  if (startBtn) startBtn.addEventListener('click', () => TimerManager.startTimer(timerMinutes));
  if (pauseBtn) pauseBtn.addEventListener('click', () => TimerManager.pauseTimer());
  if (resetBtn) resetBtn.addEventListener('click', () => TimerManager.resetTimer());

  // Task input
  const currentTask = document.getElementById('current-task');
  if (currentTask) {
    currentTask.addEventListener('blur', () => {
      if (currentTask.textContent.trim() === '') {
        currentTask.textContent = 'Belajar';
      }
    });
  }
}

// Initialize Sessions Page - FIXED VERSION
function initializeSessionsPage() {
  const sessionList = document.getElementById('session-list');
  if (!sessionList) return;

  const sessions = SessionManager.getSessions();

  if (sessions.length === 0) {
    sessionList.innerHTML = `
      <div class="empty-state premium-empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-calendar-plus"></i>
        <h3>Belum Ada Sesi</h3>
        <p>Mulai dengan menambahkan sesi belajar pertama Anda</p>
      </div>
    `;
  } else {
    sessionList.innerHTML = sessions.map(session => `
      <div class="session-card premium-card" data-session-id="${session.id}">
        <div class="session-header">
          <h3>${session.title}</h3>
          <span class="session-status ${session.status}">
            ${session.status === 'planned' ? 'Direncanakan' : 
              session.status === 'inprogress' ? 'Berlangsung' : 'Selesai'}
          </span>
        </div>
        <div class="session-details">
          <p><strong>Topik:</strong> ${session.subject}</p>
          <p><strong>Durasi:</strong> ${session.duration} menit</p>
          <p><strong>Deskripsi:</strong> ${session.description || '-'}</p>
          <p><strong>Dibuat:</strong> ${new Date(session.createdAt).toLocaleDateString('id-ID')}</p>
        </div>
        <div class="session-actions">
          ${session.status === 'planned' ? `
            <button class="action-btn start-btn premium-action-btn" data-action="start">
              <i class="fas fa-play"></i> Mulai
            </button>
          ` : session.status === 'inprogress' ? `
            <button class="action-btn complete-btn premium-action-btn" data-action="complete">
              <i class="fas fa-check"></i> Selesai
            </button>
          ` : ''}
          <button class="action-btn edit-btn premium-action-btn" data-action="edit">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="action-btn delete-btn premium-action-btn" data-action="delete">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </div>
    `).join('');

    // Event delegation untuk session actions
    sessionList.addEventListener('click', handleSessionAction);
  }

  // FIXED: Event listener untuk tombol tambah sesi
  const addSessionBtn = document.getElementById('add-session');
  if (addSessionBtn) {
    // Remove any existing event listeners
    const newBtn = addSessionBtn.cloneNode(true);
    addSessionBtn.parentNode.replaceChild(newBtn, addSessionBtn);
    
    // Add new event listener
    document.getElementById('add-session').addEventListener('click', () => {
      ModalManager.showSessionModal();
    });
  }
}

// Initialize Notes Page - FIXED VERSION
function initializeNotesPage() {
  const notesGrid = document.querySelector('.notes-grid');
  if (!notesGrid) return;

  const notes = DataManager.getNotes();
  const filter = document.getElementById('note-category-filter')?.value || 'all';

  if (notes.length === 0) {
    notesGrid.innerHTML = `
      <div class="empty-state premium-empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-sticky-note"></i>
        <h3>Belum Ada Catatan</h3>
        <p>Mulai dengan menambahkan catatan pertama Anda</p>
      </div>
    `;
  } else {
    const filteredNotes = filter === 'all' ? notes : notes.filter(note => note.category === filter);

    if (filteredNotes.length === 0) {
      notesGrid.innerHTML = `
        <div class="empty-state premium-empty-state" style="grid-column: 1 / -1;">
          <i class="fas fa-search"></i>
          <h3>Tidak Ada Catatan di Kategori Ini</h3>
          <p>Coba pilih kategori lain atau tambahkan catatan baru</p>
        </div>
      `;
    } else {
      notesGrid.innerHTML = filteredNotes.map(note => `
        <div class="note-card premium-card" data-note-id="${note.id}">
          <div class="note-header">
            <h3>${note.title}</h3>
            <span class="note-category ${note.category}">${getCategoryLabel(note.category)}</span>
          </div>
          <div class="note-date">${new Date(note.createdAt).toLocaleDateString('id-ID')}</div>
          <div class="note-body">${note.content}</div>
          <div class="note-actions">
            <button class="action-btn edit-btn premium-action-btn" data-action="edit">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="action-btn delete-btn premium-action-btn" data-action="delete">
              <i class="fas fa-trash"></i> Hapus
            </button>
          </div>
        </div>
      `).join('');

      // Event delegation
      notesGrid.addEventListener('click', handleNoteAction);
    }
  }

  // Filter
  const filterSelect = document.getElementById('note-category-filter');
  if (filterSelect) {
    filterSelect.addEventListener('change', initializeNotesPage);
  }

  // FIXED: Event listener untuk tombol tambah catatan
  const addNoteBtn = document.getElementById('add-note');
  if (addNoteBtn) {
    // Remove any existing event listeners
    const newBtn = addNoteBtn.cloneNode(true);
    addNoteBtn.parentNode.replaceChild(newBtn, addNoteBtn);
    
    // Add new event listener
    document.getElementById('add-note').addEventListener('click', () => {
      ModalManager.showNoteModal();
    });
  }
}

// Initialize Books Page
function initializeBooksPage() {
  const readingContainer = document.getElementById('reading-books');
  const completedContainer = document.getElementById('completed-books');
  if (!readingContainer || !completedContainer) return;

  const books = DataManager.getBooks();
  const readingBooks = books.filter(book => !book.isComplete);
  const completedBooks = books.filter(book => book.isComplete);

  readingContainer.innerHTML = readingBooks.length === 0
    ? '<p class="empty-state premium-empty-state">Belum ada buku yang sedang dibaca</p>'
    : readingBooks.map(book => `
      <div class="book-card premium-card" data-book-id="${book.id}">
        <div class="book-info">
          <h4>${book.title}</h4>
          <p><strong>Penulis:</strong> ${book.author}</p>
          <p><strong>Kategori:</strong> ${getBookCategoryLabel(book.category)}</p>
          ${book.description ? `<p class="book-description">${book.description}</p>` : ''}
          <p class="book-date">Ditambahkan: ${new Date(book.createdAt).toLocaleDateString('id-ID')}</p>
        </div>
        <div class="book-actions">
          <button class="move-btn premium-action-btn" data-action="toggle">
            <i class="fas fa-check"></i> Tandai Selesai
          </button>
          <button class="action-btn edit-btn premium-action-btn" data-action="edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn premium-action-btn" data-action="delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

  completedContainer.innerHTML = completedBooks.length === 0
    ? '<p class="empty-state premium-empty-state">Belum ada buku yang selesai dibaca</p>'
    : completedBooks.map(book => `
      <div class="book-card premium-card" data-book-id="${book.id}">
        <div class="book-info">
          <h4>${book.title}</h4>
          <p><strong>Penulis:</strong> ${book.author}</p>
          <p><strong>Kategori:</strong> ${getBookCategoryLabel(book.category)}</p>
          ${book.description ? `<p class="book-description">${book.description}</p>` : ''}
          <p class="book-date">Selesai: ${new Date(book.updatedAt).toLocaleDateString('id-ID')}</p>
        </div>
        <div class="book-actions">
          <button class="move-btn premium-action-btn" data-action="toggle">
            <i class="fas fa-undo"></i> Kembalikan
          </button>
          <button class="action-btn edit-btn premium-action-btn" data-action="edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn premium-action-btn" data-action="delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

  // Event delegation
  document.querySelector('.bookshelf').addEventListener('click', handleBookAction);

  // Add book
  const addBookBtn = document.getElementById('add-book');
  if (addBookBtn) {
    // Remove any existing event listeners
    const newBtn = addBookBtn.cloneNode(true);
    addBookBtn.parentNode.replaceChild(newBtn, addBookBtn);
    
    // Add new event listener
    document.getElementById('add-book').addEventListener('click', () => ModalManager.showBookModal());
  }
}

// Event Delegation Handlers
function handleNoteAction(event) {
  const button = event.target.closest('button');
  if (!button) return;

  const noteCard = button.closest('.note-card');
  if (!noteCard) return;

  const noteId = parseInt(noteCard.getAttribute('data-note-id'));
  const action = button.getAttribute('data-action');

  if (action === 'edit') editNote(noteId);
  if (action === 'delete') deleteNote(noteId);
}

function handleBookAction(event) {
  const button = event.target.closest('button');
  if (!button) return;

  const bookCard = button.closest('.book-card');
  if (!bookCard) return;

  const bookId = parseInt(bookCard.getAttribute('data-book-id'));
  const action = button.getAttribute('data-action');

  if (action === 'toggle') toggleBookStatus(bookId);
  if (action === 'edit') editBook(bookId);
  if (action === 'delete') deleteBook(bookId);
}

function handleSessionAction(event) {
  const button = event.target.closest('button');
  if (!button) return;

  const sessionCard = button.closest('.session-card');
  if (!sessionCard) return;

  const sessionId = parseInt(sessionCard.getAttribute('data-session-id'));
  const action = button.getAttribute('data-action');

  if (action === 'start') startSession(sessionId);
  if (action === 'complete') completeSession(sessionId);
  if (action === 'edit') editSession(sessionId);
  if (action === 'delete') deleteSession(sessionId);
}

// Helper functions
function editNote(id) {
  const note = DataManager.getNotes().find(n => n.id === id);
  if (note) ModalManager.showNoteModal(note);
}

function deleteNote(id) {
  if (confirm('Hapus catatan ini?')) {
    DataManager.deleteNote(id);
    showToast('Catatan dihapus!', 'success');
    loadPage();
  }
}

function editBook(id) {
  const book = DataManager.getBooks().find(b => b.id === id);
  if (book) ModalManager.showBookModal(book);
}

function deleteBook(id) {
  if (confirm('Hapus buku ini?')) {
    DataManager.deleteBook(id);
    showToast('Buku dihapus!', 'success');
    loadPage();
  }
}

function toggleBookStatus(id) {
  DataManager.toggleBookStatus(id);
  showToast('Status buku diperbarui!', 'success');
  loadPage();
}

function startSession(id) {
  SessionManager.startSession(id);
  showToast('Sesi dimulai!', 'success');
  loadPage();
}

function completeSession(id) {
  SessionManager.completeSession(id);
  showToast('Sesi diselesaikan!', 'success');
  loadPage();
}

function editSession(id) {
  const session = SessionManager.getSessions().find(s => s.id === id);
  if (session) ModalManager.showSessionModal(session);
}

function deleteSession(id) {
  if (confirm('Hapus sesi ini?')) {
    SessionManager.deleteSession(id);
    showToast('Sesi dihapus!', 'success');
    loadPage();
  }
}

function getCategoryLabel(cat) {
  const map = { study: 'Studi', personal: 'Personal', work: 'Pekerjaan', other: 'Lainnya' };
  return map[cat] || cat;
}

function getBookCategoryLabel(cat) {
  const map = { academic: 'Akademik', fiction: 'Fiksi', 'non-fiction': 'Non-Fiksi', reference: 'Referensi' };
  return map[cat] || cat;
}

// Toast Notification - Enhanced Version
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} premium-toast`;
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  toastContainer.appendChild(toast);

  // Add show class after a small delay for animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Inject component styles
function injectComponentStyles() {
  const styles = document.createElement('style');
  styles.id = 'component-styles';
  styles.textContent = `
    .note-category { padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; }
    .note-category.study { background: var(--primary); color: white; }
    .note-category.personal { background: var(--accent); color: white; }
    .note-category.work { background: var(--warning); color: var(--dark); }
    .note-category.other { background: #636e72; color: white; }
    
    .session-status { padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; white-space: nowrap; }
    .session-status.planned { background: var(--warning); color: var(--dark); }
    .session-status.inprogress { background: var(--primary); color: white; }
    .session-status.completed { background: var(--success); color: white; }
    
    .start-btn { background: var(--success); color: white; }
    .start-btn:hover { background: #00a085; }
    .complete-btn { background: var(--primary); color: white; }
    .complete-btn:hover { background: var(--secondary); }
  `;
  const existing = document.getElementById('component-styles');
  if (existing) existing.remove();
  document.head.appendChild(styles);
}

// Navigation active state
function updateActiveNav() {
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  const current = window.location.hash.slice(2) || 'beranda';
  const link = document.querySelector(`nav a[href="#/${current}"]`);
  if (link) link.classList.add('active');
}

// Initialize app
// Initialize offline manager
document.addEventListener('DOMContentLoaded', async () => {
  console.log('FocusMode Premium App Initialized');
  
  // Setup offline manager
  await OfflineManager.initialize();
  
  // Check auth
  checkAuth();
  
  // Initialize notifications and schedule reminders
  await NotificationManager.requestPermission();
  const settings = NotificationManager.getSettings();
  if (settings.dailyReminders) {
    NotificationManager.scheduleDailyReminder(8, 0);
  }
  console.log('Notification system initialized');
  
  // Create initial backup
  setTimeout(() => {
    OfflineManager.backupData();
  }, 5000);
});

window.addEventListener('hashchange', () => {
  if (currentUser) {
    loadPage();
    updateActiveNav();
  }
});

// Hide loading indicator after 2 seconds
setTimeout(() => {
  document.getElementById('loading-indicator').classList.add('hidden');
}, 2000);