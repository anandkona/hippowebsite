import { NextResponse } from 'next/server';
import { verifyCandidateAuth } from '@/lib/candidateAuth';
import { query } from '@/lib/db';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { logAudit } from '@/lib/careersService';

// Initialize Cloudflare R2 client
const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  try {
    const candidate = await verifyCandidateAuth(request);
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const docType = (formData.get('docType') as string) || 'Resume';

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    // Size limit: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, message: 'File size exceeds maximum 10MB limit' }, { status: 400 });
    }

    // Validate MIME type & extension
    const allowedMime = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExts = ['.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = allowedExts.some(ext => fileName.endsWith(ext));

    if (!allowedMime.includes(file.type) && !hasValidExt) {
      return NextResponse.json({
        success: false,
        message: 'Invalid file format. Only PDF, DOC, and DOCX documents are allowed.'
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = fileName.split('.').pop();
    const prefix = candidate?.candidateCode || `applicant_${Date.now()}`;
    const uniqueKey = `resumes/${prefix}_${Date.now()}.${ext}`;

    const bucketName = process.env.R2_BUCKET_NAME || 'hippobuildx';
    const publicUrlBase = process.env.R2_PUBLIC_URL || 'https://pub-d75b2d87daef4bd489b89cea15303971.r2.dev';

    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueKey,
        Body: buffer,
        ContentType: file.type || 'application/pdf',
      })
    );

    const publicUrl = `${publicUrlBase.replace(/\/$/, '')}/${uniqueKey}`;

    if (candidate) {
      // Update candidate profile with new resume if logged in
      await query(
        `UPDATE candidates SET resume_url = $1, resume_filename = $2, resume_uploaded_at = NOW() WHERE id = $3`,
        [publicUrl, file.name, candidate.candidateId]
      );

      // Insert into candidate_documents
      await query(
        `INSERT INTO candidate_documents (candidate_id, doc_type, file_name, file_url, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [candidate.candidateId, docType, file.name, publicUrl, file.size, file.type]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        fileUrl: publicUrl,
        fileName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to upload document'
    }, { status: 500 });
  }
}

