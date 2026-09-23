import { NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function POST(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    // Dynamically load env vars so the user doesn't have to restart the server!
    let R2_ENDPOINT = process.env.R2_ENDPOINT || '';
    let R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
    let R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
    let R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
    let R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
    let R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

    const envPath = join(process.cwd(), '.env.local');
    if (existsSync(envPath)) {
      const envFile = readFileSync(envPath, 'utf8');
      const getEnv = (key: string) => {
        const match = envFile.match(new RegExp(`^${key}=['"]?(.*?)['"]?$`, 'm'));
        return match ? match[1] : '';
      };
      
      R2_ENDPOINT = getEnv('R2_ENDPOINT') || R2_ENDPOINT;
      R2_ACCOUNT_ID = getEnv('R2_ACCOUNT_ID') || R2_ACCOUNT_ID;
      R2_ACCESS_KEY_ID = getEnv('R2_ACCESS_KEY_ID') || R2_ACCESS_KEY_ID;
      R2_SECRET_ACCESS_KEY = getEnv('R2_SECRET_ACCESS_KEY') || R2_SECRET_ACCESS_KEY;
      R2_BUCKET_NAME = getEnv('R2_BUCKET_NAME') || R2_BUCKET_NAME;
      R2_PUBLIC_URL = getEnv('R2_PUBLIC_URL') || R2_PUBLIC_URL;
    }

    const s3Endpoint = R2_ENDPOINT || (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '');

    if (!s3Endpoint || s3Endpoint.includes("your_cloudflare_account_id_here")) {
      return NextResponse.json({ message: 'R2 credentials not set in .env.local' }, { status: 500 });
    }

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: s3Endpoint.replace(/\/$/, ''),
      forcePathStyle: true,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // If you have a custom domain configured for the R2 bucket, use it. Otherwise fallback to the public URL.
    const url = R2_PUBLIC_URL && `${R2_PUBLIC_URL.replace(/\/$/, '')}/${filename}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Error uploading file to R2:', error);
    try {
      require('fs').writeFileSync('r2-error-log.txt', String(error?.stack || error?.message || error));
    } catch(e) {}
    return NextResponse.json({ message: 'Error uploading file', error: String(error?.message || error) }, { status: 500 });
  }
}
