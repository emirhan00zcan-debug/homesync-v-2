import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: { fileName: string } }
) {
    try {
        const { fileName } = params;

        // Security: Only allow alphanumeric and specific characters in filename
        if (!/^[a-zA-Z0-9_\-\.]+$/.test(fileName)) {
            return NextResponse.json(
                { error: 'Geçersiz dosya adı' },
                { status: 400 }
            );
        }

        // Construct safe file path
        const uploadsDir = join(process.cwd(), 'uploads', 'technician_docs');
        const filePath = join(uploadsDir, fileName);

        // Prevent directory traversal attacks
        if (!filePath.startsWith(uploadsDir)) {
            return NextResponse.json(
                { error: 'Yetkisiz erişim' },
                { status: 403 }
            );
        }

        // Check if file exists
        if (!existsSync(filePath)) {
            return NextResponse.json(
                { error: 'Dosya bulunamadı' },
                { status: 404 }
            );
        }

        // Read file
        const fileBuffer = await readFile(filePath);

        // Determine content type based on file extension
        const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
        const contentTypeMap: Record<string, string> = {
            pdf: 'application/pdf',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif'
        };

        const contentType = contentTypeMap[ext] || 'application/octet-stream';

        // Return file with appropriate headers
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
