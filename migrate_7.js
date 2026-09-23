const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
  const sql = fs.readFileSync('db/migrations/007_add_slug_and_content_to_services.sql', 'utf8');
  await pool.query(sql);
  console.log('Migration 007 applied');
  process.exit(0);
}

runMigration().catch(console.error);
