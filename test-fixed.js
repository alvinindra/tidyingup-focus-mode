// test-fixed.js - Test koneksi dengan port 3307
import mysql from 'mysql2/promise';

async function testFixedConnection() {
  const config = {
    host: 'localhost',
    port: 3307, // PORT YANG BENAR
    user: 'root',
    password: '', // Kosong untuk XAMPP
    database: 'focusmode_db'
  };

  try {
    console.log('🧪 Testing connection to MySQL...');
    console.log('Config:', config);
    
    const connection = await mysql.createConnection(config);
    console.log('✅ BERHASIL terhubung ke MySQL!');
    
    // Test query
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Total users: ${users[0].count}`);
    
    const [sessions] = await connection.execute('SELECT COUNT(*) as count FROM study_sessions');
    console.log(`📊 Total sessions: ${sessions[0].count}`);
    
    const [notes] = await connection.execute('SELECT COUNT(*) as count FROM notes');
    console.log(`📊 Total notes: ${notes[0].count}`);
    
    const [books] = await connection.execute('SELECT COUNT(*) as count FROM books');
    console.log(`📊 Total books: ${books[0].count}`);
    
    await connection.end();
    console.log('🎉 Semua test berhasil! Database siap digunakan.');
    
  } catch (error) {
    console.error('❌ Test gagal:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 PORT 3307 ditolak. Coba:');
      console.log('1. Buka XAMPP Control Panel');
      console.log('2. Pastikan MySQL running');
      console.log('3. Cek port di XAMPP MySQL config');
    }
  }
}

testFixedConnection();