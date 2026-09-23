-- Add slug and page_content to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS page_content JSONB DEFAULT '{}';

-- Auto-generate slug from title for existing records
UPDATE services SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;

-- Remove trailing/leading hyphens just in case
UPDATE services SET slug = TRIM(BOTH '-' FROM slug);
