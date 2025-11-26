import Database from './js/db.js';

class AppModel {
  constructor() {
    this.db = Database;
  }

  // User methods
  async getUser() {
    return this.db.get('user', 'current');
  }

  async saveUser(user) {
    return this.db.update('user', { id: 'current', ...user });
  }

  // Notes methods
  async getNotes() {
    return this.db.getAll('notes');
  }

  async addNote(note) {
    return this.db.add('notes', note);
  }

  async updateNote(note) {
    return this.db.update('notes', note);
  }

  async deleteNote(id) {
    return this.db.delete('notes', id);
  }

  // Sessions methods
  async getSessions() {
    return this.db.getAll('sessions');
  }

  async addSession(session) {
    return this.db.add('sessions', session);
  }

  async updateSession(session) {
    return this.db.update('sessions', session);
  }

  async deleteSession(id) {
    return this.db.delete('sessions', id);
  }

  // Books methods
  async getBooks() {
    return this.db.getAll('books');
  }

  async addBook(book) {
    return this.db.add('books', book);
  }

  async updateBook(book) {
    return this.db.update('books', book);
  }

  async deleteBook(id) {
    return this.db.delete('books', id);
  }

  // Statistics methods
  async getStudyStats() {
    const sessions = await this.getSessions();
    const notes = await this.getNotes();
    const books = await this.getBooks();

    const totalStudyTime = sessions.reduce((total, session) => {
      return total + (session.duration || 0);
    }, 0);

    const completedSessions = sessions.filter(session => 
      session.status === 'completed'
    ).length;

    const readBooks = books.filter(book => 
      book.isComplete
    ).length;

    return {
      totalStudyTime,
      completedSessions,
      totalNotes: notes.length,
      totalBooks: books.length,
      readBooks
    };
  }
}

export default new AppModel();