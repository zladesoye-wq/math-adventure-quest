import { Pool } from 'pg';
import { neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Standard pg pool for server-side Express apps
// If using Neon in a serverless environment (like Vercel functions), 
// we might use the @neondatabase/serverless driver instead of pg.
// But for a long-running Node process, pg is fine.

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
