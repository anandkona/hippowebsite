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
    
    // 1. Create roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create default roles if they don't exist
    const { rows: existingRoles } = await client.query('SELECT * FROM roles');
    let superAdminId = null;
    let editorId = null;
    let viewerId = null;

    if (existingRoles.length === 0) {
      const allPerms = JSON.stringify([
        'manage_blogs', 'manage_skills', 'manage_partners', 
        'manage_products', 'manage_services', 'manage_seo', 
        'manage_banners', 'manage_team'
      ]);
      const res1 = await client.query(`INSERT INTO roles (name, permissions) VALUES ('Super Admin', $1) RETURNING id`, [allPerms]);
      superAdminId = res1.rows[0].id;

      const editorPerms = JSON.stringify(['manage_blogs', 'manage_skills', 'manage_partners', 'manage_products', 'manage_services']);
      const res2 = await client.query(`INSERT INTO roles (name, permissions) VALUES ('Editor', $1) RETURNING id`, [editorPerms]);
      editorId = res2.rows[0].id;

      const viewerPerms = JSON.stringify([]);
      const res3 = await client.query(`INSERT INTO roles (name, permissions) VALUES ('Viewer', $1) RETURNING id`, [viewerPerms]);
      viewerId = res3.rows[0].id;
    } else {
      superAdminId = existingRoles.find(r => r.name === 'Super Admin')?.id || existingRoles[0].id;
      editorId = existingRoles.find(r => r.name === 'Editor')?.id || existingRoles[0].id;
      viewerId = existingRoles.find(r => r.name === 'Viewer')?.id || existingRoles[0].id;
    }

    // 3. Add role_id to admins if not exists
    const cols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='admins'`);
    const colNames = cols.rows.map(r => r.column_name);

    if (!colNames.includes('role_id')) {
      await client.query(`ALTER TABLE admins ADD COLUMN role_id INTEGER REFERENCES roles(id)`);
    }

    // 4. Migrate existing data
    if (colNames.includes('role')) {
      await client.query(`UPDATE admins SET role_id = $1 WHERE role = 'admin'`, [superAdminId]);
      await client.query(`UPDATE admins SET role_id = $1 WHERE role = 'editor'`, [editorId]);
      await client.query(`UPDATE admins SET role_id = $1 WHERE role = 'viewer'`, [viewerId]);
      // For any others, fallback to viewer
      await client.query(`UPDATE admins SET role_id = $1 WHERE role_id IS NULL`, [viewerId]);

      // 5. Drop role string column
      await client.query(`ALTER TABLE admins DROP COLUMN role`);
    }

    console.log("Migration complete!");

  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
