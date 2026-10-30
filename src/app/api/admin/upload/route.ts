import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import path from 'path';
import fs from 'fs/promises';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg']);

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and SVG images are accepted.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit.' },
        { status: 400 }
      );
    }

    const rawExt = path.extname(file.name).toLowerCase();
    const ext = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.jpg';
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 10);
    const safeFilename = `product-${timestamp}-${randomHex}${ext}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const destinationPath = path.join(uploadsDir, safeFilename);

    await fs.writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/${safeFilename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('[POST /api/admin/upload]', error);
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
  }
}

