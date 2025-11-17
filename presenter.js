import AppModel from './model.js';
import { showToast } from './utils/index.js';

class AppPresenter {
  constructor(view) {
    this.view = view;
    this.model = AppModel;
  }

  // User operations
  async loadUser() {
    try {
      const user = await this.model.getUser();
      this.view.displayUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  async saveUser(userData) {
    try {
      await this.model.saveUser(userData);
      showToast('Profil berhasil disimpan', 'success');
    } catch (error) {
      console.error('Error saving user:', error);
      showToast('Gagal menyimpan profil', 'error');
    }
  }

  // Notes operations
  async loadNotes() {
    try {
      const notes = await this.model.getNotes();
      this.view.displayNotes(notes);
    } catch (error) {
      console.error('Error loading notes:', error);
      showToast('Gagal memuat catatan', 'error');
    }
  }

  async addNote(noteData) {
    try {
      const newNote = await this.model.addNote(noteData);
      this.view.addNote(newNote);
      showToast('Catatan berhasil ditambahkan', 'success');
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      showToast('Gagal menambahkan catatan', 'error');
      throw error;
    }
  }

  async updateNote(noteId, updates) {
    try {
      const note = await this.model.getNote(noteId);
      const updatedNote = { ...note, ...updates };
      await this.model.updateNote(updatedNote);
      this.view.updateNote(updatedNote);
      showToast('Catatan berhasil diperbarui', 'success');
    } catch (error) {
      console.error('Error updating note:', error);
      showToast('Gagal memperbarui catatan', 'error');
    }
  }

  async deleteNote(noteId) {
    try {
      await this.model.deleteNote(noteId);
      this.view.removeNote(noteId);
      showToast('Catatan berhasil dihapus', 'success');
    } catch (error) {
      console.error('Error deleting note:', error);
      showToast('Gagal menghapus catatan', 'error');
    }
  }

  // Sessions operations
  async loadSessions() {
    try {
      const sessions = await this.model.getSessions();
      this.view.displaySessions(sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      showToast('Gagal memuat sesi belajar', 'error');
    }
  }

  async addSession(sessionData) {
    try {
      const newSession = await this.model.addSession(sessionData);
      this.view.addSession(newSession);
      showToast('Sesi belajar berhasil ditambahkan', 'success');
      return newSession;
    } catch (error) {
      console.error('Error adding session:', error);
      showToast('Gagal menambahkan sesi belajar', 'error');
      throw error;
    }
  }

  async updateSession(sessionId, updates) {
    try {
      const session = await this.model.getSession(sessionId);
      const updatedSession = { ...session, ...updates };
      await this.model.updateSession(updatedSession);
      this.view.updateSession(updatedSession);
      showToast('Sesi belajar berhasil diperbarui', 'success');
    } catch (error) {
      console.error('Error updating session:', error);
      showToast('Gagal memperbarui sesi belajar', 'error');
    }
  }

  async deleteSession(sessionId) {
    try {
      await this.model.deleteSession(sessionId);
      this.view.removeSession(sessionId);
      showToast('Sesi belajar berhasil dihapus', 'success');
    } catch (error) {
      console.error('Error deleting session:', error);
      showToast('Gagal menghapus sesi belajar', 'error');
    }
  }

  // Books operations
  async loadBooks() {
    try {
      const books = await this.model.getBooks();
      this.view.displayBooks(books);
    } catch (error) {
      console.error('Error loading books:', error);
      showToast('Gagal memuat buku', 'error');
    }
  }

  async addBook(bookData) {
    try {
      const newBook = await this.model.addBook(bookData);
      this.view.addBook(newBook);
      showToast('Buku berhasil ditambahkan', 'success');
      return newBook;
    } catch (error) {
      console.error('Error adding book:', error);
      showToast('Gagal menambahkan buku', 'error');
      throw error;
    }
  }

  async updateBook(bookId, updates) {
    try {
      const book = await this.model.getBook(bookId);
      const updatedBook = { ...book, ...updates };
      await this.model.updateBook(updatedBook);
      this.view.updateBook(updatedBook);
      showToast('Buku berhasil diperbarui', 'success');
    } catch (error) {
      console.error('Error updating book:', error);
      showToast('Gagal memperbarui buku', 'error');
    }
  }

  async deleteBook(bookId) {
    try {
      await this.model.deleteBook(bookId);
      this.view.removeBook(bookId);
      showToast('Buku berhasil dihapus', 'success');
    } catch (error) {
      console.error('Error deleting book:', error);
      showToast('Gagal menghapus buku', 'error');
    }
  }

  // Statistics operations
  async loadStatistics() {
    try {
      const stats = await this.model.getStudyStats();
      this.view.displayStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }
}

export default AppPresenter;