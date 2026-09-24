-- Add SEO columns to partners table
ALTER TABLE partners ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);
ALTER TABLE partners ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS seo_keywords VARCHAR(255);
