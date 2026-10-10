import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, message } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and Phone are required' }, { status: 400 });
    }

    // Check if the same phone number has EVER submitted an enquiry
    const { rows: existingRows } = await query(
      'SELECT * FROM enquiries WHERE phone = $1 ORDER BY created_at ASC LIMIT 1',
      [phone]
    );

    if (existingRows.length > 0) {
      const existingDate = new Date(existingRows[0].created_at);
      const today = new Date();
      
      const isToday = existingDate.getDate() === today.getDate() &&
                      existingDate.getMonth() === today.getMonth() &&
                      existingDate.getFullYear() === today.getFullYear();
      
      if (isToday) {
        return NextResponse.json({ 
          error: 'Your message is already recorded.' 
        }, { status: 429 });
      } else {
        const formattedDate = existingDate.toLocaleDateString();
        return NextResponse.json({ 
          error: `Already your respond submit on ${formattedDate}` 
        }, { status: 429 });
      }
    }

    const { rows } = await query(
      'INSERT INTO enquiries (name, phone, email, message) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, phone, email || '', message || '']
    );

    return NextResponse.json({ success: true, id: rows[0].id });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
