import { initDatabase } from '../database/init.js';
import fs from 'fs';
import path from 'path';

async function initializeForRender() {
  console.log('Initializing database for Render...');
  
  try {
    await initDatabase();
    console.log('✅ Database initialized successfully');
    
    // Проверяем создание файла
    const dbPath = '/opt/render/project/src/data/database.sqlite';
    if (fs.existsSync(dbPath)) {
      console.log(`✅ Database file created at: ${dbPath}`);
      const stats = fs.statSync(dbPath);
      console.log(`📊 Database size: ${stats.size} bytes`);
    } else {
      console.log('❌ Database file not found!');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeForRender();