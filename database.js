import mysql from 'mysql2/promise';

class Database {
  constructor() {
    this.connection = null;
    // Konfigurasi untuk XAMPP dengan port 3307
    this.config = {
      host: 'localhost',
      port: 3307, // PORT YANG BENAR
      user: 'root',
      password: '', // XAMPP default biasanya tanpa password
      database: 'focusmode_db',
      charset: 'utf8mb4',
      timezone: '+07:00',
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    };
  }

  async connect() {
    try {
      console.log('🔧 Mencoba koneksi ke MySQL...');
      console.log('📍 Config:', {
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        database: this.config.database
      });
      
      this.connection = await mysql.createConnection(this.config);
      
      // Test connection
      await this.connection.execute('SELECT 1 + 1 as result');
      const [rows] = await this.connection.execute('SELECT DATABASE() as db');
      
      console.log('✅ BERHASIL terhubung ke MySQL!');
      console.log('📊 Database:', rows[0].db);
      console.log('🚀 Server siap menerima koneksi API');
      
      return this.connection;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('\n🔧 SOLUSI:');
      console.log('1. Pastikan XAMPP MySQL running di port 3307');
      console.log('2. Buka XAMPP → Config my.ini → cek port setting');
      console.log('3. Atau ubah port di file database.js');
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('✅ Database connection closed');
    }
  }

  async query(sql, params = []) {
    try {
      if (!this.connection) {
        await this.connect();
      }
      
      console.log('📝 Executing query:', sql.substring(0, 100) + '...');
      const [results] = await this.connection.execute(sql, params);
      return results;
    } catch (error) {
      console.error('❌ Database query error:', error.message);
      console.error('Query:', sql);
      throw error;
    }
  }

  // User operations
  async createUser(userData) {
    const { name, email, password, avatar = 'U' } = userData;
    const sql = `
      INSERT INTO users (name, email, password, avatar) 
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await this.query(sql, [name, email, password, avatar]);
    
    // Create default settings for user
    await this.query(
      'INSERT INTO user_settings (user_id) VALUES (?)',
      [result.insertId]
    );
    
    return result.insertId;
  }

  async getUserByEmail(email) {
    const sql = `
      SELECT u.*, us.push_enabled, us.daily_reminders, us.session_reminders, us.achievement_alerts
      FROM users u 
      LEFT JOIN user_settings us ON u.id = us.user_id 
      WHERE u.email = ? AND u.status = 'active'
    `;
    const users = await this.query(sql, [email]);
    return users[0] || null;
  }

  async getUserById(id) {
    const sql = `
      SELECT u.*, us.push_enabled, us.daily_reminders, us.session_reminders, us.achievement_alerts
      FROM users u 
      LEFT JOIN user_settings us ON u.id = us.user_id 
      WHERE u.id = ? AND u.status = 'active'
    `;
    const users = await this.query(sql, [id]);
    return users[0] || null;
  }

  // Study Sessions operations
  async getSessionsByUserId(userId) {
    const sql = 'SELECT * FROM study_sessions WHERE user_id = ? ORDER BY created_at DESC';
    return await this.query(sql, [userId]);
  }

  async createSession(sessionData) {
    const { user_id, title, description, subject, duration, status = 'planned' } = sessionData;
    const sql = `
      INSERT INTO study_sessions (user_id, title, description, subject, duration, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await this.query(sql, [user_id, title, description, subject, duration, status]);
    return result.insertId;
  }

  async updateSession(id, sessionData) {
    const { title, description, subject, duration, status } = sessionData;
    const sql = `
      UPDATE study_sessions 
      SET title = ?, description = ?, subject = ?, duration = ?, status = ? 
      WHERE id = ?
    `;
    await this.query(sql, [title, description, subject, duration, status, id]);
  }

  async deleteSession(id) {
    await this.query('DELETE FROM study_sessions WHERE id = ?', [id]);
  }

  async startSession(id) {
    const sql = `
      UPDATE study_sessions 
      SET status = 'inprogress', started_at = NOW() 
      WHERE id = ?
    `;
    await this.query(sql, [id]);
  }

  async completeSession(id) {
    const sql = `
      UPDATE study_sessions 
      SET status = 'completed', completed_at = NOW() 
      WHERE id = ?
    `;
    await this.query(sql, [id]);
  }

  // Notes operations
  async getNotesByUserId(userId, category = 'all') {
    let sql = 'SELECT * FROM notes WHERE user_id = ?';
    let params = [userId];
    
    if (category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY created_at DESC';
    return await this.query(sql, params);
  }

  async createNote(noteData) {
    const { user_id, title, content, category = 'study' } = noteData;
    const sql = `
      INSERT INTO notes (user_id, title, content, category) 
      VALUES (?, ?, ?, ?)
    `;
    const result = await this.query(sql, [user_id, title, content, category]);
    return result.insertId;
  }

  async updateNote(id, noteData) {
    const { title, content, category } = noteData;
    const sql = `
      UPDATE notes 
      SET title = ?, content = ?, category = ? 
      WHERE id = ?
    `;
    await this.query(sql, [title, content, category, id]);
  }

  async deleteNote(id) {
    await this.query('DELETE FROM notes WHERE id = ?', [id]);
  }

  // Books operations
  async getBooksByUserId(userId) {
    const sql = 'SELECT * FROM books WHERE user_id = ? ORDER BY created_at DESC';
    return await this.query(sql, [userId]);
  }

  async createBook(bookData) {
    const { user_id, title, author, description, category = 'academic' } = bookData;
    const sql = `
      INSERT INTO books (user_id, title, author, description, category) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await this.query(sql, [user_id, title, author, description, category]);
    return result.insertId;
  }

  async updateBook(id, bookData) {
    const { title, author, description, category } = bookData;
    const sql = `
      UPDATE books 
      SET title = ?, author = ?, description = ?, category = ? 
      WHERE id = ?
    `;
    await this.query(sql, [title, author, description, category, id]);
  }

  async deleteBook(id) {
    await this.query('DELETE FROM books WHERE id = ?', [id]);
  }

  async toggleBookStatus(id) {
    const sql = `
      UPDATE books 
      SET is_complete = NOT is_complete, updated_at = NOW() 
      WHERE id = ?
    `;
    await this.query(sql, [id]);
  }

  // Statistics operations
  async getTodayStats(userId) {
    const sql = `
      SELECT 
        COALESCE(SUM(duration), 0) as total_minutes,
        COUNT(*) as total_sessions
      FROM study_sessions 
      WHERE user_id = ? AND DATE(created_at) = CURDATE() AND status = 'completed'
    `;
    const results = await this.query(sql, [userId]);
    return results[0];
  }

  async getWeeklyReport(userId) {
    const sql = `
      SELECT 
        DATE(created_at) as study_date,
        COUNT(*) as sessions_count,
        SUM(duration) as total_minutes
      FROM study_sessions 
      WHERE user_id = ? 
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY study_date DESC
    `;
    return await this.query(sql, [userId]);
  }

  async getDashboardData(userId) {
    const sql = `
      SELECT 
        u.name,
        u.email,
        u.avatar,
        us.push_enabled,
        us.daily_reminders,
        (SELECT COUNT(*) FROM study_sessions WHERE user_id = u.id AND status = 'completed') as completed_sessions,
        (SELECT COUNT(*) FROM notes WHERE user_id = u.id) as total_notes,
        (SELECT COUNT(*) FROM books WHERE user_id = u.id) as total_books
      FROM users u
      LEFT JOIN user_settings us ON u.id = us.user_id
      WHERE u.id = ?
    `;
    const results = await this.query(sql, [userId]);
    return results[0];
  }

  // Focus timers operations
  async saveFocusTimer(timerData) {
    const { user_id, timer_type, duration, completed = false, task_description } = timerData;
    const sql = `
      INSERT INTO focus_timers (user_id, timer_type, duration, completed, task_description) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await this.query(sql, [user_id, timer_type, duration, completed, task_description]);
    return result.insertId;
  }

  async completeFocusTimer(id) {
    const sql = `
      UPDATE focus_timers 
      SET completed = TRUE, completed_at = NOW() 
      WHERE id = ?
    `;
    await this.query(sql, [id]);
  }

  async getFocusTimersByUserId(userId) {
    const sql = 'SELECT * FROM focus_timers WHERE user_id = ? ORDER BY started_at DESC LIMIT 50';
    return await this.query(sql, [userId]);
  }
}

export default new Database();