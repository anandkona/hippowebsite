import { Pool } from 'pg';

let pool: Pool;

// Determine whether to use SSL:
// Only use SSL for remote databases (e.g. Neon, AWS RDS, Supabase) unless explicitly configured
const isLocalhost =
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes('localhost') ||
  process.env.DATABASE_URL.includes('127.0.0.1');

const ssl =
  process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : process.env.DATABASE_SSL === 'false' || isLocalhost
      ? false
      : { rejectUnauthorized: false };

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl,
  });
} else {
  if (!(global as any).pgPool) {
    (global as any).pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl,
    });
  }
  pool = (global as any).pgPool;
}

export const query = (text: string, params?: any[]) => pool.query(text, params);
