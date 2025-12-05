import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Определяем путь в зависимости от среды
const isRender = process.env.RENDER === 'true';
const dbPath = isRender 
  ? '/opt/render/project/src/database.sqlite'
  : join(__dirname, '../database.sqlite');

// Создаем директорию если нужно
const dbDir = dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`📁 Created database directory: ${dbDir}`);
}

console.log(`📁 Database path: ${dbPath}`);
console.log(`🌍 Environment: ${isRender ? 'Render' : 'Local'}`);

const db = new Database(dbPath, { 
  verbose: isRender ? undefined : console.log 
});

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔄 Starting database initialization...');

      // Users table
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phone TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT,
          role TEXT NOT NULL DEFAULT 'user',
          organization TEXT,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Product types table
      db.exec(`
        CREATE TABLE IF NOT EXISTS product_types (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Products table
      db.exec(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2),
          materials TEXT,
          sizes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (type_id) REFERENCES product_types (id)
        )
      `);

      // Applications table
      db.exec(`
        CREATE TABLE IF NOT EXISTS applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT NOT NULL,
          product_type TEXT NOT NULL,
          product TEXT NOT NULL,
          material TEXT,
          size TEXT,
          comment TEXT,
          product_type_id INTEGER,
          product_id INTEGER,
          status TEXT DEFAULT 'new',
          source TEXT DEFAULT 'public_form',
          marked_for_deletion BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Worker responses table
      db.exec(`
        CREATE TABLE IF NOT EXISTS worker_responses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          application_id INTEGER NOT NULL,
          worker_id INTEGER NOT NULL,
          response TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (application_id) REFERENCES applications (id),
          FOREIGN KEY (worker_id) REFERENCES users (id)
        )
      `);

      // Worker registration requests
      db.exec(`
        CREATE TABLE IF NOT EXISTS worker_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          organization TEXT NOT NULL,
          phone TEXT UNIQUE NOT NULL,
          email TEXT NOT NULL,
          password TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Database tables created successfully');

      // Insert default admin user
      const adminExists = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
      
      if (!adminExists) {
        console.log('👤 Creating default admin user...');
        const hashedPassword = bcrypt.hashSync('admin123', 12);
        db.prepare(
          "INSERT INTO users (phone, password, name, email, role) VALUES (?, ?, ?, ?, ?)"
        ).run('79997778899', hashedPassword, 'Administrator', 'admin@system.com', 'admin');
        console.log('✅ Admin user created');
        
        // Создаем тестовых пользователей только если база пустая
        console.log('👥 Creating test users...');
        const testUsers = [
          {
            phone: '79991234567',
            password: bcrypt.hashSync('123456', 12),
            name: 'Тестовый Клиент',
            email: 'client@test.com',
            role: 'user'
          },
          {
            phone: '79991112233',
            password: bcrypt.hashSync('worker123', 12),
            name: 'Тестовый Работник',
            email: 'worker@test.com',
            role: 'worker'
          },
          {
            phone: '79994445566',
            password: bcrypt.hashSync('operator123', 12),
            name: 'Тестовый Оператор',
            email: 'operator@test.com',
            role: 'operator'
          }
        ];

        testUsers.forEach(user => {
          db.prepare(
            "INSERT INTO users (phone, password, name, email, role) VALUES (?, ?, ?, ?, ?)"
          ).run(user.phone, user.password, user.name, user.email, user.role);
        });
        console.log('✅ Test users created');
        
        // Остальные тестовые данные...
      } else {
        console.log('📊 Database already has data, skipping test data creation');
      }

      console.log('🎉 Database initialization completed successfully');
      resolve();
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      reject(error);
    }
  });
};

export { db, initDatabase };