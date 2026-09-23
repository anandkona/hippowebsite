import { Pool } from 'pg';

let pool: Pool;

const isLocalDb = process.env.DATABASE_URL?.includes('localhost');

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocalDb ? false : { rejectUnauthorized: false },
  });
} else {
  if (!(global as any).pgPool) {
    (global as any).pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isLocalDb ? false : { rejectUnauthorized: false },
    });
  }
  pool = (global as any).pgPool;
}

export const query = (text: string, params?: any[]) => pool.query(text, params);
