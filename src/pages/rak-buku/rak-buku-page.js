import Database from '../../js/db.js';

class RakBukuPage {
  constructor() {
    this.name = 'rak-buku';
    this.books = [];
  }

  async render() {
    return `
      <section class="bookshelf-section">
        <div class="container">
          <h2>Rak Buku Saya</h2>
          <p>Kelola koleksi buku dan materi belajar Anda</p>
          
          <div class="bookshelf-actions">
            <button class="btn" id="addBookBtn">
              <i class="fas fa-plus"></i> Tambah Buku
            </button>
          </div>
          
          <div class="bookshelf">
            <div class="bookshelf-rack">
              <h3>Belum Selesai Dibaca</h3>
              <div class="book-list" id="unreadBooks">
                <!-- Unread books will be loaded here -->
              </div>
            </div>
            <div class="bookshelf-rack">
              <h3>Selesai Dibaca</h3>
              <div class="book-list" id="readBooks">
                <!-- Read books will be loaded here -->
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Book Modal -->
      <div id="bookModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="bookModalTitle">Tambah Buku</h3>
            <span class="close-modal">&times;</span>
          </div>
          <form id="bookForm">
            <div class="form-group">
              <label for="bookTitle">Judul Buku</label>
              <input type="text" id="bookTitle" placeholder="Masukkan judul buku" required>
            </div>
            <div class="form-group">
              <label for="bookAuthor">Penulis</label>
              <input type="text" id="bookAuthor" placeholder="Masukkan nama penulis" required>
            </div>
            <div class="form-group">
              <label for="bookYear">Tahun Terbit</label>
              <input type="number" id="bookYear" placeholder="Masukkan tahun terbit" required>
            </div>
            <div class="form-group">
              <label for="bookIsComplete">Status Baca</label>
              <select id="bookIsComplete" required>
                <option value="false">Belum Selesai Dibaca</option>
                <option value="true">Selesai Dibaca</option>
              </select>
            </div>
            <button type="submit" class="btn" style="width: 100%;">Simpan Buku</button>
          </form>
        </div>
      </div>
    `;
  }

  async afterRender() {
    await this.initDatabase();
    await this.loadBooks();
    this.setupEventListeners();
    this.renderBooks();
  }

  async initDatabase() {
    try {
      await Database.init();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  async loadBooks() {
    try {
      this.books = await Database.getAll('books');
    } catch (error) {
      console.error('Error loading books:', error);
      this.books = [];
    }
  }

  async saveBook(book) {
    try {
      await Database.add('books', book);
    } catch (error) {
      console.error('Error saving book:', error);
      throw error;
    }
  }

  setupEventListeners() {
    // Add book button
    document.getElementById('addBookBtn').addEventListener('click', () => {
      this.openBookModal();
    });

    // Book form
    document.getElementById('bookForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleBookSubmit();
    });

    // Close modal
    document.querySelector('.close-modal').addEventListener('click', () => {
      this.closeBookModal();
    });

    // Click outside modal to close
    window.addEventListener('click', (e) => {
      if (e.target === document.getElementById('bookModal')) {
        this.closeBookModal();
      }
    });
  }

  openBookModal() {
    document.getElementById('bookModalTitle').textContent = 'Tambah Buku';
    document.getElementById('bookForm').reset();
    document.getElementById('bookModal').style.display = 'flex';
  }

  closeBookModal() {
    document.getElementById('bookModal').style.display = 'none';
  }

  async handleBookSubmit() {
    const bookData = {
      id: Date.now(),
      title: document.getElementById('bookTitle').value,
      author: document.getElementById('bookAuthor').value,
      year: parseInt(document.getElementById('bookYear').value),
      isComplete: document.getElementById('bookIsComplete').value === 'true',
      createdAt: new Date().toISOString()
    };

    try {
      await this.saveBook(bookData);
      this.books.push(bookData);
      this.renderBooks();
      this.closeBookModal();
      this.showToast('Buku berhasil disimpan', 'success');
    } catch (error) {
      this.showToast('Gagal menyimpan buku', 'error');
    }
  }

  renderBooks() {
    const unreadBooks = this.books.filter(book => !book.isComplete);
    const readBooks = this.books.filter(book => book.isComplete);

    this.renderBookList('unreadBooks', unreadBooks);
    this.renderBookList('readBooks', readBooks);
  }

  renderBookList(containerId, books) {
    const container = document.getElementById(containerId);
    
    if (books.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-book"></i>
          <p>Belum ada buku</p>
        </div>
      `;
      return;
    }

    container.innerHTML = books.map(book => `
      <div class="book-card" data-id="${book.id}">
        <div class="book-info">
          <h4>${this.escapeHtml(book.title)}</h4>
          <p><strong>Penulis:</strong> ${this.escapeHtml(book.author)}</p>
          <p><strong>Tahun:</strong> ${book.year}</p>
        </div>
        <div class="book-actions">
          <button class="action-btn move-btn" data-id="${book.id}">
            ${book.isComplete ? 'Belum Selesai' : 'Selesai'}
          </button>
          <button class="action-btn delete-btn" data-id="${book.id}">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </div>
    `).join('');

    // Add event listeners
    this.attachBookEventListeners(containerId);
  }

  attachBookEventListeners(containerId) {
    const container = document.getElementById(containerId);
    
    // Move buttons
    container.querySelectorAll('.move-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const bookId = parseInt(e.target.closest('.move-btn').dataset.id);
        await this.moveBook(bookId);
      });
    });

    // Delete buttons
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const bookId = parseInt(e.target.closest('.delete-btn').dataset.id);
        await this.deleteBook(bookId);
      });
    });
  }

  async moveBook(bookId) {
    const book = this.books.find(b => b.id === bookId);
    if (!book) return;

    book.isComplete = !book.isComplete;

    try {
      await Database.update('books', book);
      this.renderBooks();
      this.showToast('Status buku berhasil diubah', 'success');
    } catch (error) {
      this.showToast('Gagal mengubah status buku', 'error');
    }
  }

  async deleteBook(bookId) {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      try {
        await Database.delete('books', bookId);
        this.books = this.books.filter(b => b.id !== bookId);
        this.renderBooks();
        this.showToast('Buku berhasil dihapus', 'success');
      } catch (error) {
        this.showToast('Gagal menghapus buku', 'error');
      }
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

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${this.getToastColor(type)};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  getToastColor(type) {
    const colors = {
      success: '#00b894',
      error: '#e17055',
      info: '#74b9ff',
      warning: '#fdcb6e'
    };
    return colors[type] || colors.info;
  }
}

export default RakBukuPage;