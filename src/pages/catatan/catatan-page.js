import { DB } from '../../js/db.js';

export class CatatanPage {
  constructor() {
    this.name = 'catatan';
    this.notes = [];
    this.currentFilter = 'all';
  }

  async render() {
    return `
      <section class="notes-section">
        <div class="container">
          <h2>Catatan Saya</h2>
          <p>Kelola catatan belajar dan ide-ide penting</p>
          
          <div class="notes-actions">
            <button class="btn" id="addNoteBtn">
              <i class="fas fa-plus"></i> Tambah Catatan
            </button>
            <div class="search-box">
              <input type="text" id="noteSearch" placeholder="Cari catatan...">
              <i class="fas fa-search"></i>
            </div>
          </div>
          
          <div class="notes-grid" id="notesGrid">
            <div class="loading-indicator">
              <p>Memuat catatan...</p>
            </div>
          </div>
        </div>
      </section>

      <div id="noteModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="noteModalTitle">Tambah Catatan</h3>
            <span class="close-modal">&times;</span>
          </div>
          <form id="noteForm">
            <div class="form-group">
              <label for="noteTitle">Judul Catatan</label>
              <input type="text" id="noteTitle" placeholder="Masukkan judul catatan" required>
            </div>
            <div class="form-group">
              <label for="noteBody">Isi Catatan</label>
              <textarea id="noteBody" placeholder="Tulis isi catatan Anda di sini" rows="8" required></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" id="cancelNote">Batal</button>
              <button type="submit" class="btn">Simpan Catatan</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  async afterRender() {
    await this.loadNotes();
    this.setupEventListeners();
  }

  async loadNotes() {
    try {
      this.notes = await DB.getAll('notes');
      this.renderNotes();
    } catch (error) {
      console.error('Error loading notes:', error);
      this.showError('Gagal memuat catatan');
    }
  }

  renderNotes(filteredNotes = null) {
    const notesToRender = filteredNotes || this.notes;
    const notesGrid = document.getElementById('notesGrid');

    if (notesToRender.length === 0) {
      notesGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-sticky-note"></i>
          <h3>Belum ada catatan</h3>
          <p>Mulai tambahkan catatan untuk mengorganisir pemikiran dan ide Anda</p>
          <button class="btn" id="addFirstNote">Tulis Catatan Pertama</button>
        </div>
      `;
      return;
    }

    notesGrid.innerHTML = notesToRender.map(note => `
      <div class="note-card" data-id="${note.id}">
        <div class="note-header">
          <h3>${this.escapeHtml(note.title)}</h3>
          <div class="note-actions">
            <button class="icon-btn edit-note" data-id="${note.id}" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="icon-btn delete-note" data-id="${note.id}" title="Hapus">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="note-content">
          <p>${this.escapeHtml(note.body)}</p>
        </div>
        <div class="note-footer">
          <span class="note-date">
            ${new Date(note.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // Add note button
    document.getElementById('addNoteBtn').addEventListener('click', () => this.openNoteModal());
    
    // Search functionality
    document.getElementById('noteSearch').addEventListener('input', (e) => {
      this.searchNotes(e.target.value);
    });
    
    // Modal events
    document.querySelector('#noteModal .close-modal').addEventListener('click', () => this.closeModal());
    document.getElementById('cancelNote').addEventListener('click', () => this.closeModal());
    document.getElementById('noteForm').addEventListener('submit', (e) => this.handleNoteSubmit(e));
    
    // Event delegation for note actions
    document.getElementById('notesGrid').addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      const noteId = parseInt(target.dataset.id);
      
      if (target.classList.contains('edit-note') || target.closest('.edit-note')) {
        this.editNote(noteId);
      } else if (target.classList.contains('delete-note') || target.closest('.delete-note')) {
        this.deleteNote(noteId);
      }
    });

    // Empty state buttons
    document.addEventListener('click', (e) => {
      if (e.target.id === 'addFirstNote') {
        this.openNoteModal();
      }
    });
  }

  searchNotes(query) {
    if (!query.trim()) {
      this.renderNotes();
      return;
    }

    const filteredNotes = this.notes.filter(note =>
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.body.toLowerCase().includes(query.toLowerCase())
    );

    this.renderNotes(filteredNotes);
  }

  openNoteModal(note = null) {
    const modal = document.getElementById('noteModal');
    const title = document.getElementById('noteModalTitle');
    const form = document.getElementById('noteForm');

    if (note) {
      title.textContent = 'Edit Catatan';
      form.dataset.editId = note.id;
      document.getElementById('noteTitle').value = note.title;
      document.getElementById('noteBody').value = note.body;
    } else {
      title.textContent = 'Tambah Catatan';
      form.reset();
      delete form.dataset.editId;
    }

    modal.style.display = 'flex';
  }

  closeModal() {
    document.getElementById('noteModal').style.display = 'none';
  }

  async handleNoteSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const noteData = {
      title: document.getElementById('noteTitle').value,
      body: document.getElementById('noteBody').value,
      createdAt: new Date().toISOString(),
    };

    try {
      if (form.dataset.editId) {
        // Update existing note
        noteData.id = parseInt(form.dataset.editId);
        await DB.set('notes', noteData);
      } else {
        // Add new note
        await DB.set('notes', noteData);
      }

      await this.loadNotes();
      this.closeModal();
      this.showSuccess('Catatan berhasil disimpan');
    } catch (error) {
      console.error('Error saving note:', error);
      this.showError('Gagal menyimpan catatan');
    }
  }

  async editNote(id) {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      this.openNoteModal(note);
    }
  }

  async deleteNote(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) return;

    try {
      await DB.delete('notes', id);
      await this.loadNotes();
      this.showSuccess('Catatan berhasil dihapus');
    } catch (error) {
      console.error('Error deleting note:', error);
      this.showError('Gagal menghapus catatan');
    }
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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