const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function seed() {
  const ssl =
    process.env.DATABASE_SSL === 'true'
      ? { rejectUnauthorized: false }
      : process.env.DATABASE_SSL === 'false' || process.env.NODE_ENV !== 'production'
        ? false
        : { rejectUnauthorized: false };

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl,
  });

  try {
    await client.connect();
    console.log('Connected to database for seeding.');

    const username = process.argv[2] || 'sateesh';
    const password = process.argv[3] || 'Hippo@2026';
    const email = process.argv[4] || 'sateesh@hippoclouds.com';

    // Check if user already exists
    const checkRes = await client.query('SELECT id FROM admins WHERE username = $1', [username]);
    if (checkRes.rows.length > 0) {
      console.log(`Admin user '${username}' already exists.`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Fetch the Super Admin role id for protected routes
    let roleId = null;
    const roleRes = await client.query("SELECT id FROM roles WHERE name = 'Super Admin'");
    if (roleRes.rows.length > 0) {
      roleId = roleRes.rows[0].id;
    }

    await client.query(
      'INSERT INTO admins (username, email, password_hash, role_id) VALUES ($1, $2, $3, $4)',
      [username, email, passwordHash, roleId]
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
