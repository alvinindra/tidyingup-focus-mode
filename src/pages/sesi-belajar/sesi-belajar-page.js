import { DB } from '../../js/db.js';

export class SesiBelajarPage {
  constructor() {
    this.name = 'sesi-belajar';
    this.sessions = [];
  }

  async render() {
    return `
      <section class="sessions">
        <div class="container">
          <h2>Sesi Belajar Saya</h2>
          <p>Kelola dan pantau sesi belajar Anda</p>
          
          <div class="session-actions">
            <button class="btn" id="addSessionBtn">Tambah Sesi Baru</button>
            <div class="filter-controls">
              <select id="sessionFilter">
                <option value="all">Semua Sesi</option>
                <option value="planned">Direncanakan</option>
                <option value="inprogress">Sedang Berlangsung</option>
                <option value="completed">Selesai</option>
              </select>
            </div>
          </div>
          
          <div class="session-list" id="sessionList">
            <div class="loading-indicator">
              <p>Memuat sesi belajar...</p>
            </div>
          </div>
        </div>
      </section>

      <div id="sessionModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="sessionModalTitle">Tambah Sesi Belajar</h3>
            <span class="close-modal">&times;</span>
          </div>
          <form id="sessionForm">
            <div class="form-group">
              <label for="sessionTitle">Judul Sesi</label>
              <input type="text" id="sessionTitle" placeholder="Masukkan judul sesi belajar" required>
            </div>
            <div class="form-group">
              <label for="sessionSubject">Mata Pelajaran</label>
              <input type="text" id="sessionSubject" placeholder="Masukkan mata pelajaran" required>
            </div>
            <div class="form-group">
              <label for="sessionDuration">Durasi (menit)</label>
              <input type="number" id="sessionDuration" placeholder="Durasi sesi dalam menit" required>
            </div>
            <div class="form-group">
              <label for="sessionStatus">Status</label>
              <select id="sessionStatus" required>
                <option value="planned">Direncanakan</option>
                <option value="inprogress">Sedang Berlangsung</option>
                <option value="completed">Selesai</option>
              </select>
            </div>
            <div class="form-group">
              <label for="sessionNotes">Catatan</label>
              <textarea id="sessionNotes" placeholder="Tambahkan catatan untuk sesi ini" rows="3"></textarea>
            </div>
            <button type="submit" class="btn" style="width: 100%;">Simpan Sesi</button>
          </form>
        </div>
      </div>
    `;
  }

  async afterRender() {
    await this.loadSessions();
    this.setupEventListeners();
  }

  async loadSessions() {
    try {
      this.sessions = await DB.getAll('sessions');
      this.renderSessions();
    } catch (error) {
      console.error('Error loading sessions:', error);
      this.showError('Gagal memuat sesi belajar');
    }
  }

  renderSessions() {
    const sessionList = document.getElementById('sessionList');
    const filter = document.getElementById('sessionFilter')?.value || 'all';

    const filteredSessions = this.sessions.filter(session => {
      if (filter === 'all') return true;
      return session.status === filter;
    });

    if (filteredSessions.length === 0) {
      sessionList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-calendar-plus"></i>
          <h3>Belum ada sesi belajar</h3>
          <p>Tambahkan sesi baru untuk memulai perencanaan belajar Anda</p>
          <button class="btn" id="addFirstSession">Tambah Sesi Pertama</button>
        </div>
      `;
      return;
    }

    sessionList.innerHTML = filteredSessions.map(session => `
      <div class="session-card" data-id="${session.id}">
        <div class="session-header">
          <h3>${session.title}</h3>
          <span class="session-status ${session.status}">
            ${this.getStatusText(session.status)}
          </span>
        </div>
        <div class="session-details">
          <p><strong>Mata Pelajaran:</strong> ${session.subject}</p>
          <p><strong>Durasi:</strong> ${session.duration} menit</p>
          <p><strong>Dibuat:</strong> ${new Date(session.createdAt).toLocaleDateString('id-ID')}</p>
          ${session.notes ? `<p><strong>Catatan:</strong> ${session.notes}</p>` : ''}
        </div>
        <div class="session-actions">
          <button class="action-btn edit-btn" data-id="${session.id}">Edit</button>
          <button class="action-btn delete-btn" data-id="${session.id}">Hapus</button>
          ${session.status === 'planned' ? 
            `<button class="action-btn start-btn" data-id="${session.id}">Mulai</button>` : ''}
        </div>
      </div>
    `).join('');
  }

  getStatusText(status) {
    const statusMap = {
      planned: 'Direncanakan',
      inprogress: 'Sedang Berlangsung',
      completed: 'Selesai'
    };
    return statusMap[status] || status;
  }

  setupEventListeners() {
    // Add session button
    document.getElementById('addSessionBtn').addEventListener('click', () => this.openSessionModal());
    
    // Filter change
    document.getElementById('sessionFilter').addEventListener('change', () => this.renderSessions());
    
    // Modal events
    document.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
    document.getElementById('sessionForm').addEventListener('submit', (e) => this.handleSessionSubmit(e));
    
    // Event delegation for session actions
    document.getElementById('sessionList').addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-btn')) {
        this.editSession(parseInt(e.target.dataset.id));
      } else if (e.target.classList.contains('delete-btn')) {
        this.deleteSession(parseInt(e.target.dataset.id));
      } else if (e.target.classList.contains('start-btn')) {
        this.startSession(parseInt(e.target.dataset.id));
      }
    });
  }

  openSessionModal(session = null) {
    const modal = document.getElementById('sessionModal');
    const title = document.getElementById('sessionModalTitle');
    const form = document.getElementById('sessionForm');

    if (session) {
      title.textContent = 'Edit Sesi Belajar';
      form.dataset.editId = session.id;
      document.getElementById('sessionTitle').value = session.title;
      document.getElementById('sessionSubject').value = session.subject;
      document.getElementById('sessionDuration').value = session.duration;
      document.getElementById('sessionStatus').value = session.status;
      document.getElementById('sessionNotes').value = session.notes || '';
    } else {
      title.textContent = 'Tambah Sesi Belajar';
      form.reset();
      delete form.dataset.editId;
    }

    modal.style.display = 'flex';
  }

  closeModal() {
    document.getElementById('sessionModal').style.display = 'none';
  }

  async handleSessionSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const sessionData = {
      title: document.getElementById('sessionTitle').value,
      subject: document.getElementById('sessionSubject').value,
      duration: parseInt(document.getElementById('sessionDuration').value),
      status: document.getElementById('sessionStatus').value,
      notes: document.getElementById('sessionNotes').value,
      createdAt: new Date().toISOString(),
    };

    try {
      if (form.dataset.editId) {
        // Update existing session
        sessionData.id = parseInt(form.dataset.editId);
        await DB.set('sessions', sessionData);
      } else {
        // Add new session
        await DB.set('sessions', sessionData);
      }

      await this.loadSessions();
      this.closeModal();
      this.showSuccess('Sesi berhasil disimpan');
    } catch (error) {
      console.error('Error saving session:', error);
      this.showError('Gagal menyimpan sesi');
    }
  }

  async editSession(id) {
    const session = this.sessions.find(s => s.id === id);
    if (session) {
      this.openSessionModal(session);
    }
  }

  async deleteSession(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus sesi ini?')) return;

    try {
      await DB.delete('sessions', id);
      await this.loadSessions();
      this.showSuccess('Sesi berhasil dihapus');
    } catch (error) {
      console.error('Error deleting session:', error);
      this.showError('Gagal menghapus sesi');
    }
  }

  startSession(id) {
    // Navigate to focus mode with session data
    window.location.hash = '#/focus-mode';
  }

  showSuccess(message) {
    const event = new CustomEvent('show-toast', {
      detail: { message, type: 'success' }
    });
    document.dispatchEvent(event);
  }

  showError(message) {
    const event = new CustomEvent('show-toast', {
      detail: { message, type: 'error' }
    });
    document.dispatchEvent(event);
  }
}