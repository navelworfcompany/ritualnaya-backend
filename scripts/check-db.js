import { db } from '../database/init.js';

console.log('🔍 Checking database status...');

try {
  // Проверяем подключение
  const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  
  console.log('✅ Database connected successfully');
  console.log(`📊 Found ${result.length} tables:`);
  
  result.forEach(table => {
    console.log(`  - ${table.name}`);
  });
  
  // Проверяем данные в таблицах
  const tablesToCheck = ['users', 'products', 'applications'];
  
  tablesToCheck.forEach(tableName => {
    try {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
      console.log(`  ${tableName}: ${count.count} records`);
    } catch (e) {
      console.log(`  ${tableName}: table doesn't exist`);
    }
  });
  
  process.exit(0);
} catch (error) {
  console.error('❌ Database check failed:', error.message);
  process.exit(1);
}