import { query } from './db';

export async function getActiveBanners() {
  try {
    const { rows } = await query('SELECT * FROM banners WHERE is_active = true ORDER BY id DESC');
    return rows;
  } catch (error) {
    console.error('Failed to fetch banner:', error);
    return null;
  }
}

export async function getActivePartners() {
  try {
    const { rows } = await query(
      'SELECT * FROM partners WHERE is_active = true ORDER BY CASE WHEN display_order = 0 THEN 999999 ELSE display_order END ASC, id ASC'
    );
    return rows;
  } catch (error) {
    console.error('Failed to fetch active partners:', error);
    return [];
  }
}

export async function getActiveSkills() {
  try {
    const { rows } = await query(
      'SELECT * FROM skills WHERE is_active = true ORDER BY CASE WHEN display_order = 0 THEN 999999 ELSE display_order END ASC, id ASC'
    );
    return rows;
  } catch (error) {
    console.error('Failed to fetch active skills:', error);
    return [];
  }
}

export async function getActiveBlogs() {
  try {
    const { rows } = await query(
      'SELECT * FROM blogs WHERE is_active = true ORDER BY published_date DESC, id DESC'
    );
    return rows;
  } catch (error) {
    console.error('Failed to fetch active blogs:', error);
    return [];
  }
}

export async function getBlogById(id: string) {
  try {
    const { rows } = await query('SELECT * FROM blogs WHERE id = $1', [id]);
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to fetch blog by id:', error);
    return null;
  }
}

export async function getSeoMetadata(pagePath: string) {
  try {
    const { rows } = await query('SELECT * FROM seo_metadata WHERE page_path = $1', [pagePath]);
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to fetch seo:', error);
    return null;
  }
}

export async function getActiveProducts() {
  try {
    const { rows } = await query(
      'SELECT * FROM products WHERE is_active = true ORDER BY CASE WHEN display_order = 0 THEN 999999 ELSE display_order END ASC, id ASC'
    );
    return rows;
  } catch (error) {
    console.error('Failed to fetch active products:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const { rows } = await query(
      'SELECT * FROM products WHERE LOWER(product_id) = LOWER($1)',
      [slug]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to fetch product by slug:', error);
    return null;
  }
}

export async function getActiveServices() {
  try {
    const { rows } = await query(
      'SELECT * FROM services WHERE is_active = true ORDER BY CASE WHEN display_order = 0 THEN 999999 ELSE display_order END ASC, id ASC'
    );
    return rows;
  } catch (error) {
    console.error('Failed to fetch active services:', error);
    return [];
  }
}

export async function getServiceBySlug(slug: string) {
  try {
    const { rows } = await query(
      'SELECT * FROM services WHERE LOWER(slug) = LOWER($1)',
      [slug]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to fetch service by slug:', error);
    return null;
  }
}

