// setup-database.js - Script setup database
import mysql from 'mysql2/promise';

async function setupDatabase() {
  let connection;
  
  try {
    // Coba koneksi tanpa database terlebih dahulu
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Coba tanpa password
      charset: 'utf8mb4'
    });

    console.log('✅ Berhasil terkoneksi ke MySQL server');

    // Buat database jika belum ada
    await connection.execute('CREATE DATABASE IF NOT EXISTS focusmode_db');
    console.log('✅ Database focusmode_db siap');

    // Gunakan database
    await connection.execute('USE focusmode_db');
    console.log('✅ Menggunakan database focusmode_db');

    // Import dan jalankan SQL schema
    const { readFileSync } = await import('fs');
    const sqlScript = readFileSync('./focusmode_database.sql', 'utf8');
    
    // Split SQL statements
    const statements = sqlScript
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt + ';');

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✅ Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          console.log('ℹ️  Skipped (mungkin sudah ada):', error.message);
        }
      }
    }

    console.log('🎉 Setup database berhasil!');
    
  } catch (error) {
    console.error('❌ Setup database gagal:', error.message);
    console.log('\n🔧 Coba solusi:');
    console.log('1. Pastikan MySQL di XAMPP running');
    console.log('2. Cek password MySQL Anda');
    console.log('3. Ubah password di file setup-database.js jika perlu');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();