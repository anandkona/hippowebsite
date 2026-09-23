-- Add page_content column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS page_content JSONB DEFAULT '{}'::jsonb;
