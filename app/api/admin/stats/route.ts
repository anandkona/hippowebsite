import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const getCount = async (tableName: string, condition?: string) => {
      try {
        const queryStr = condition ? `SELECT COUNT(*) FROM ${tableName} WHERE ${condition}` : `SELECT COUNT(*) FROM ${tableName}`;
        const res = await query(queryStr);
        return parseInt(res.rows[0].count);
      } catch (e) {
        console.warn(`Table ${tableName} might not exist yet. Returning 0.`);
        return 0;
      }
    };

    const bannersTotal = await getCount('banners');
    const bannersActive = await getCount('banners', 'is_active = true');
    
    const partnersTotal = await getCount('partners');
    
    const blogsTotal = await getCount('blogs');
    const blogsActive = await getCount('blogs', 'is_active = true');
    
    const seoTotal = await getCount('seo_metadata');

    const productsTotal = await getCount('products');
    const productsActive = await getCount('products', 'is_active = true');

    const servicesTotal = await getCount('services');
    const servicesActive = await getCount('services', 'is_active = true');

    const skillsTotal = await getCount('skills');
    const skillsActive = await getCount('skills', 'is_active = true');

    return NextResponse.json({
      banners: { total: bannersTotal, active: bannersActive },
      partners: { total: partnersTotal },
      blogs: { total: blogsTotal, active: blogsActive },
      seo: { total: seoTotal },
      products: { total: productsTotal, active: productsActive },
      services: { total: servicesTotal, active: servicesActive },
      skills: { total: skillsTotal, active: skillsActive }
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
