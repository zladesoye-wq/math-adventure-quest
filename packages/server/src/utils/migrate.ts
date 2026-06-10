import fs from 'fs';
import path from 'path';
import pool from '../config/database';

export const runMigrations = async () => {
  const client = await pool.connect();
  try {
    console.log('Starting migrations...');
    const migrationsPath = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsPath, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      await client.query(sql);
    }
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

if (require.main === module) {
  runMigrations().catch(() => process.exit(1));
}
