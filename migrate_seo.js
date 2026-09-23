require('dotenv').config({ path: 'd:\\hippowebsite\\.env.local' });
const { Client } = require('pg');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const tables = ['blogs', 'skills', 'partners'];
    
    for (const table of tables) {
      console.log(`Adding SEO columns to ${table}...`);
      await client.query(`
        ALTER TABLE ${table}
        ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
        ADD COLUMN IF NOT EXISTS seo_description TEXT,
        ADD COLUMN IF NOT EXISTS seo_keywords VARCHAR(255)
      `);
      console.log(`Successfully updated ${table}.`);
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
