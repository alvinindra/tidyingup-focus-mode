import { NotificationManager } from '../../js/notification.js';

export class FocusModePage {
  constructor() {
    this.name = 'focus-mode';
    this.timerInterval = null;
    this.timerSeconds = 25 * 60;
    this.isTimerRunning = false;
    this.isFocusMode = false;
  }

  async render() {
    return `
      <section class="focus-mode">
        <div class="container">
          <h2>Focus Mode</h2>
          <p>Atur waktu fokus belajar Anda dengan teknik Pomodoro</p>
          
          <div class="timer-controls">
            <button class="timer-btn active" data-time="25">Pomodoro (25m)</button>
            <button class="timer-btn" data-time="15">Pendek (15m)</button>
            <button class="timer-btn" data-time="45">Panjang (45m)</button>
          </div>
          
          <div class="timer-display" id="timerDisplay">25:00</div>
          
          <div class="timer-actions">
            <button class="btn" id="startTimer">Mulai</button>
            <button class="btn btn-secondary" id="pauseTimer">Jeda</button>
            <button class="btn btn-secondary" id="resetTimer">Reset</button>
          </div>

          <div class="focus-stats">
            <div class="stat-card">
              <h4>Sesi Hari Ini</h4>
              <p class="stat-number" id="todaySessions">0</p>
            </div>
            <div class="stat-card">
              <h4>Total Waktu</h4>
              <p class="stat-number" id="totalTime">0m</p>
            </div>
          </div>
          
          <button class="exit-focus hidden" id="exitFocus">Keluar Focus Mode</button>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.setupEventListeners();
    this.loadStats();
  }

  setupEventListeners() {
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    const resetBtn = document.getElementById('resetTimer');
    const exitBtn = document.getElementById('exitFocus');
    const timerBtns = document.querySelectorAll('.timer-btn');

    startBtn.addEventListener('click', () => this.startTimer());
    pauseBtn.addEventListener('click', () => this.pauseTimer());
    resetBtn.addEventListener('click', () => this.resetTimer());
    exitBtn.addEventListener('click', () => this.exitFocusMode());

    timerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        timerBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const minutes = parseInt(btn.getAttribute('data-time'));
        this.resetTimer(minutes);
      });
    });
  }

  startTimer() {
    if (this.isTimerRunning) return;

    this.isTimerRunning = true;
    this.enterFocusMode();

    this.timerInterval = setInterval(() => {
      this.timerSeconds--;
      this.updateTimerDisplay();

      if (this.timerSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.isTimerRunning = false;
        this.onTimerComplete();
      }
    }, 1000);
  }

  pauseTimer() {
    if (!this.isTimerRunning) return;

    clearInterval(this.timerInterval);
    this.isTimerRunning = false;
  }

  resetTimer(minutes = null) {
    clearInterval(this.timerInterval);
    this.isTimerRunning = false;

    if (minutes) {
      this.timerSeconds = minutes * 60;
    } else {
      const activeTimer = document.querySelector('.timer-btn.active');
      const minutes = parseInt(activeTimer.getAttribute('data-time'));
      this.timerSeconds = minutes * 60;
    }

    this.updateTimerDisplay();
    this.exitFocusMode();
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timerSeconds / 60);
    const seconds = this.timerSeconds % 60;
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  enterFocusMode() {
    this.isFocusMode = true;
    document.body.classList.add('focus-mode-active');
    document.getElementById('exitFocus').classList.remove('hidden');
  }

  exitFocusMode() {
    this.isFocusMode = false;
    document.body.classList.remove('focus-mode-active');
    document.getElementById('exitFocus').classList.add('hidden');
  }

  async onTimerComplete() {
    await NotificationManager.requestPermission();
    NotificationManager.showTimerComplete();
    
    // Save session to database
    await this.saveSession();
    this.loadStats();
    
    alert('Waktu fokus telah habis! Istirahat sejenak.');
    this.resetTimer();
  }

  async saveSession() {
    const activeTimer = document.querySelector('.timer-btn.active');
    const duration = parseInt(activeTimer.getAttribute('data-time'));
    
    const session = {
      type: 'focus',
      duration,
      completedAt: new Date().toISOString(),
    };

    // Save to IndexedDB
    // await DB.set('sessions', session);
    console.log('Session saved:', session);
  }

  loadStats() {
    // Load stats from database
    document.getElementById('todaySessions').textContent = '3';
    document.getElementById('totalTime').textContent = '125m';
  }
}