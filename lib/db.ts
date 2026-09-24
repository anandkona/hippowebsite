import { Pool } from 'pg';

let pool: Pool;

// Local development databases commonly do not support TLS. SSL can be
// explicitly enabled for development databases that require it, or disabled
// for a production database running locally.
const ssl =
  process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : process.env.DATABASE_SSL === 'false' || process.env.NODE_ENV !== 'production'
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
