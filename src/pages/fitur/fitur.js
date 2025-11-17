export class FiturPage {
  constructor() {
    this.name = 'fitur';
  }

  async render() {
    return `
      <section class="features">
        <div class="container">
          <h1>Fitur FocusMode</h1>
          <p class="subtitle">Semua alat yang Anda butuhkan untuk belajar lebih fokus dan produktif</p>
          
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-clock"></i>
              </div>
              <h3>Timer Pomodoro</h3>
              <p>Teknik 25 menit fokus dan 5 menit istirahat untuk meningkatkan produktivitas belajar Anda.</p>
              <ul>
                <li>Timer yang dapat disesuaikan</li>
                <li>Notifikasi waktu habis</li>
                <li>Statistik sesi belajar</li>
              </ul>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-sticky-note"></i>
              </div>
              <h3>Catatan Pintar</h3>
              <p>Buat dan kelola catatan belajar Anda dengan mudah. Terintegrasi dengan sistem fokus.</p>
              <ul>
                <li>Editor catatan yang sederhana</li>
                <li>Pencarian cepat</li>
                <li>Kategorisasi otomatis</li>
              </ul>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-book"></i>
              </div>
              <h3>Rak Buku Digital</h3>
              <p>Kelola koleksi buku dan materi belajar Anda dalam rak buku digital yang terorganisir.</p>
              <ul>
                <li>Status baca (selesai/belum)</li>
                <li>Pencarian dan filter</li>
                <li>Import dari ISBN</li>
              </ul>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <h3>Statistik Belajar</h3>
              <p>Pantau perkembangan belajar Anda dengan statistik dan laporan yang detail.</p>
              <ul>
                <li>Grafik waktu belajar</li>
                <li>Target harian/mingguan</li>
                <li>Pencapaian dan badge</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Add event listeners for fitur page
  }
}