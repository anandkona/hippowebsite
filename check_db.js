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
    
    const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`);
    console.log('Tables:', res.rows.map(r => r.table_name));

    // Also check if users table exists and what columns it has
    if (res.rows.some(r => r.table_name === 'admins')) {
      const users = await client.query(`SELECT username, email, role FROM admins`);
      console.log('Admins users:', users.rows);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
