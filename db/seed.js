const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to database for seeding.');

    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || 'password123';
    const email = process.argv[4] || 'admin@hippoclouds.com';

    // Check if user already exists
    const checkRes = await client.query('SELECT id FROM admins WHERE username = $1', [username]);
    if (checkRes.rows.length > 0) {
      console.log(`Admin user '${username}' already exists.`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await client.query(
      'INSERT INTO admins (username, email, password_hash) VALUES ($1, $2, $3)',
      [username, email, passwordHash]
    );

    console.log(`Successfully created admin user '${username}' with password '${password}'.`);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
