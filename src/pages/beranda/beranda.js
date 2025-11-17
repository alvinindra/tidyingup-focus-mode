export class BerandaPage {
  constructor() {
    this.name = 'beranda';
  }

  async render() {
    return `
      <section class="hero">
        <div class="container">
          <h1>Tingkatkan Fokus Belajar Anda</h1>
          <p>FocusMode membantu siswa dan pelajar untuk meningkatkan produktivitas dengan teknik Pomodoro, pencatatan yang terorganisir, dan lingkungan belajar yang bebas gangguan.</p>
          <div class="hero-actions">
            <a href="#/focus-mode" class="btn">Mulai Fokus</a>
            <a href="#/fitur" class="btn btn-secondary">Pelajari Fitur</a>
          </div>
        </div>
      </section>

      <section class="features-preview">
        <div class="container">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-clock"></i>
            </div>
            <h3>Timer Pomodoro</h3>
            <p>Teknik 25 menit fokus dan 5 menit istirahat</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-sticky-note"></i>
            </div>
            <h3>Catatan Pintar</h3>
            <p>Kelola catatan belajar dengan mudah</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-book"></i>
            </div>
            <h3>Rak Buku Digital</h3>
            <p>Organisir koleksi buku dan materi</p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Add event listeners for beranda page
  }
}