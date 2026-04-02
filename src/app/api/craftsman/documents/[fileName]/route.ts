import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Tip tanımında params'ın bir Promise olduğunu belirtiyoruz
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileName: string }> }
) {
  try {
    // 1. ADIM: params'ı await ederek içindeki fileName'i alıyoruz
    const { fileName } = await params;

    // 2. Güvenlik: Dosya adı kontrolü
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(fileName)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya adı' },
        { status: 400 }
      );
    }

    // 3. Dosya yolunu oluşturma
    const uploadsDir = join(process.cwd(), 'uploads', 'technician_docs');
    const filePath = join(uploadsDir, fileName);

    // 4. Yetkisiz dizin erişimi kontrolü
    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    // 5. Dosya varlık kontrolü
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 404 }
      );
    }

    // 6. Dosyayı okuma
    const fileBuffer = await readFile(filePath);

    // 7. Content-Type belirleme
    const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
    const contentTypeMap: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif'
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // 8. Yanıtı döndürme
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error: any) {
    console.error('Document Serve Error:', error);
    return NextResponse.json(
      { error: 'Dosya okuma hatası' },
      { status: 500 }
    );
  }
}