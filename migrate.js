const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  let dbUrl = '';
  for (const line of envFile.split('\n')) {
    if (line.startsWith('DATABASE_URL=')) {
      dbUrl = line.split('=')[1].trim().replace(/^"|"$/g, '');
      break;
    }
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: false
  });

  try {
    await client.connect();
    
    await client.query('ALTER TABLE blogs ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255), ADD COLUMN IF NOT EXISTS seo_description TEXT, ADD COLUMN IF NOT EXISTS seo_keywords VARCHAR(255)');
    console.log('blogs updated');

    await client.query('ALTER TABLE skills ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255), ADD COLUMN IF NOT EXISTS seo_description TEXT, ADD COLUMN IF NOT EXISTS seo_keywords VARCHAR(255)');
    console.log('skills updated');
    
    await client.query('ALTER TABLE partners ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255), ADD COLUMN IF NOT EXISTS seo_description TEXT, ADD COLUMN IF NOT EXISTS seo_keywords VARCHAR(255)');
    console.log('partners updated');
    
    console.log('Done!');
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
