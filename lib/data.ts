import { query } from './db';
import {
  FALLBACK_PRODUCTS,
  FALLBACK_PRODUCTS_LIST,
  FALLBACK_SERVICES,
  FALLBACK_SERVICES_LIST,
  FALLBACK_BANNERS,
  FALLBACK_PARTNERS,
  FALLBACK_SKILLS,
  FALLBACK_BLOGS,
  FALLBACK_REVIEWS
} from './fallbackData';

export async function getActiveBanners() {
  try {
    const { rows } = await query('SELECT * FROM banners WHERE is_active = true ORDER BY id DESC');
    if (rows && rows.length > 0) {
      return rows;
    }
  } catch (error) {
    console.error('Failed to fetch banner:', error);
  }
  return FALLBACK_BANNERS;
}

export async function getActivePartners() {
  try {
    const { rows } = await query(
      'SELECT * FROM partners WHERE is_active = true ORDER BY CASE WHEN display_order = 0 THEN 999999 ELSE display_order END ASC, id ASC'
    );
    if (rows && rows.length > 0) {
      return rows;
    }
  } catch (error) {
    console.error('Failed to fetch active partners:', error);
  }
  return FALLBACK_PARTNERS;
}

export async function getActiveSkills() {
  try {
    const { rows } = await query(
      'SELECT * FROM skills WHERE is_active = true ORDER BY CASE WHEN display_order = 0 THEN 999999 ELSE display_order END ASC, id ASC'
    );
    if (rows && rows.length > 0) {
      return rows;
    }
  } catch (error) {
    console.error('Failed to fetch active skills:', error);
  }
  return FALLBACK_SKILLS;
}

export async function getActiveBlogs() {
  try {
    const { rows } = await query(
      'SELECT * FROM blogs WHERE is_active = true ORDER BY published_date DESC, id DESC'
    );
    if (rows && rows.length > 0) {
      return rows;
    }
  } catch (error) {
    console.error('Failed to fetch active blogs:', error);
  }
  return FALLBACK_BLOGS;
}

export async function getBlogById(id: string) {
  try {
    const { rows } = await query('SELECT * FROM blogs WHERE id = $1', [id]);
    if (rows && rows[0]) {
      return rows[0];
    }
  } catch (error) {
    console.error('Failed to fetch blog by id:', error);
  }
  const fallback = FALLBACK_BLOGS.find(b => String(b.id) === String(id));
  return fallback || null;
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
    if (rows && rows.length > 0) {
      return rows;
    }
  } catch (error) {
    console.error('Failed to fetch active products:', error);
  }
  return FALLBACK_PRODUCTS_LIST;
}

export async function getProductBySlug(slug: string) {
  try {
    const { rows } = await query(
      'SELECT * FROM products WHERE LOWER(product_id) = LOWER($1)',
      [slug]
    );
    if (rows && rows.length > 0) {
      return rows[0];
    }
  } catch (error) {
    console.error('Failed to fetch product by slug:', error);
  }
  return FALLBACK_PRODUCTS[slug.toLowerCase()] || null;
}

export async function getActiveServices() {
  try {
    const { rows } = await query(
      'SELECT * FROM services WHERE is_active = true ORDER BY CASE WHEN display_order = 0 THEN 999999 ELSE display_order END ASC, id ASC'
    );
    if (rows && rows.length > 0) {
      return rows;
    }
  } catch (error) {
    console.error('Failed to fetch active services:', error);
  }
  return FALLBACK_SERVICES_LIST;
}

export async function getServiceBySlug(slug: string) {
  try {
    const { rows } = await query(
      'SELECT * FROM services WHERE LOWER(slug) = LOWER($1)',
      [slug]
    );
    if (rows && rows.length > 0) {
      return rows[0];
    }
  } catch (error) {
    console.error('Failed to fetch service by slug:', error);
  }
  return FALLBACK_SERVICES[slug.toLowerCase()] || null;
}

export async function getActiveReviews() {
  try {
    const { rows } = await query(
      'SELECT * FROM reviews WHERE is_active = true ORDER BY CASE WHEN display_order = 0 THEN 999999 ELSE display_order END ASC, id ASC'
    );
    if (rows && rows.length > 0) {
      return rows;
    }
  } catch (error) {
    console.error('Failed to fetch active reviews:', error);
  }
  return FALLBACK_REVIEWS;
}

