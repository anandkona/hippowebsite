import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { FALLBACK_REVIEWS } from '@/lib/fallbackData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { rows } = await query(
      'SELECT * FROM reviews WHERE is_active = true ORDER BY CASE WHEN display_order = 0 THEN 999999 ELSE display_order END ASC, id DESC'
    );
    if (rows && rows.length > 0) {
      return NextResponse.json(rows);
    }
    return NextResponse.json(FALLBACK_REVIEWS);
  } catch (error) {
    console.error('Error fetching public reviews:', error);
    return NextResponse.json(FALLBACK_REVIEWS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { author, role, company, content, stars } = body;

    if (!author || !role || !content) {
      return NextResponse.json(
        { message: 'Author name, role, and review content are required.' },
        { status: 400 }
      );
    }

    const starRating = Math.min(5, Math.max(1, parseInt(stars, 10) || 5));

    const { rows } = await query(
      `INSERT INTO reviews (author, role, company, content, stars, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, 0, true)
       RETURNING *`,
      [author.trim(), role.trim(), (company || '').trim() || null, content.trim(), starRating]
    );

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully! Thank you for your feedback.',
      review: rows[0],
    });
  } catch (error: any) {
    console.error('Error submitting public review:', error);
    return NextResponse.json(
      { message: 'Failed to submit review. Please try again later.' },
      { status: 500 }
    );
  }
}
