import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// 1. params tipini Promise<{ fileName: string }> olarak tanımlıyoruz
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ fileName: string }> }
) {
    try {
        // 2. params'ı "await" ile çözüyoruz (Next.js 16 kuralı)
        const { fileName } = await params;

        // 3. Güvenlik Kontrolü: Sadece izin verilen karakterler
        if (!/^[a-zA-Z0-9_\-\.]+$/.test(fileName)) {
            return NextResponse.json(
                { error: 'Geçersiz dosya adı' },
                { status: 400 }
            );
        }

        // 4. Dosya yolunu oluştur
        const uploadsDir = join(process.cwd(), 'uploads', 'technician_docs');
        const filePath = join(uploadsDir, fileName);

        // 5. Directory Traversal (Dizin Atlatma) saldırısını engelle
        if (!filePath.startsWith(uploadsDir)) {
            return NextResponse.json(
                { error: 'Yetkisiz erişim' },
                { status: 403 }
            );
        }

        // 6. Dosya var mı kontrol et
        if (!existsSync(filePath)) {
            return NextResponse.json(
                { error: 'Dosya bulunamadı' },
                { status: 404 }
            );
        }

        // 7. Dosyayı oku
        const fileBuffer = await readFile(filePath);

        // 8. İçerik tipini (MIME type) belirle
        const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
        const contentTypeMap: Record<string, string> = {
            pdf: 'application/pdf',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif'
        };

        const contentType = contentTypeMap[ext] || 'application/octet-stream';

        // 9. Dosyayı uygun headerlar ile döndür
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