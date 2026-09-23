CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name, permissions) 
SELECT 'Super Admin', '["manage_blogs", "manage_skills", "manage_partners", "manage_products", "manage_services", "manage_seo", "manage_banners", "manage_team"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Super Admin');

ALTER TABLE admins ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES roles(id);

UPDATE admins SET role_id = (SELECT id FROM roles WHERE name = 'Super Admin') WHERE role_id IS NULL;

ALTER TABLE admins DROP COLUMN IF EXISTS role;
