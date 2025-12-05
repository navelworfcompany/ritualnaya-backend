// scripts/migrate-to-supabase.js
import Database from 'better-sqlite3';
import { supabase } from '../database/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

const sqliteDb = new Database('./database.sqlite');

async function migrateData() {
  console.log('Starting migration from SQLite to Supabase...');

  try {
    // Миграция users
    const users = sqliteDb.prepare('SELECT * FROM users').all();
    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          phone: user.phone,
          password: user.password,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at
        });
      if (error) console.error('User migration error:', error);
    }
    console.log(`Migrated ${users.length} users`);

    // Аналогично для других таблиц...
    
    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateData();