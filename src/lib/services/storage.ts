import fs from 'fs/promises';
import path from 'path';

export interface StorageUploadResult {
    success: boolean;
    fileName?: string;
    filePath?: string;
    error?: string;
}

export class StorageService {
    // Güvenlik için dosyaları public dışı bir klasöre kaydediyoruz
    private static readonly UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'technician_docs');
    private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static readonly ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

    /**
     * Dosyayı sunucuya kaydeder ve doğrulama yapar.
     */
    static async uploadDocument(
        file: File,
        userId: string,
        documentType: string
    ): Promise<StorageUploadResult> {
        try {
            // 1. Dosya boyutu kontrolü
            if (file.size > this.MAX_FILE_SIZE) {
                return { success: false, error: 'Dosya boyutu 5MB\'dan büyük olamaz.' };
            }

            // 2. Uzantı kontrolü
            let ext = path.extname(file.name || '').toLowerCase();
            
            if (!ext && file.type) {
                if (file.type === 'application/pdf') ext = '.pdf';
                else if (file.type === 'image/jpeg') ext = '.jpg';
                else if (file.type === 'image/png') ext = '.png';
            }

            if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
                return {
                    success: false,
                    error: `Desteklenmeyen dosya formatı. İzin verilenler: ${this.ALLOWED_EXTENSIONS.join(', ')}`
                };
            }

            // 3. Klasör kontrolü
            await fs.mkdir(this.UPLOADS_DIR, { recursive: true });

            // 4. Benzersiz dosya adı oluştur
            const timestamp = Date.now();
            const fileName = `${userId}_${documentType}_${timestamp}${ext}`;
            const filePath = path.join(this.UPLOADS_DIR, fileName);

            // 5. Dosyayı kaydet
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await fs.writeFile(filePath, buffer);

            return {
                success: true,
                fileName,
                filePath, // Not: Gerçek API'de path yerine erişim URL'i döner.
            };

        } catch (error) {
            console.error('Storage Service Error:', error);
            return { success: false, error: 'Dosya yüklenirken bir hata oluştu.' };
        }
    }

    /**
     * Dosyayı siler.
     */
    static async deleteDocument(fileName: string): Promise<boolean> {
        try {
            const filePath = path.join(this.UPLOADS_DIR, fileName);
            await fs.unlink(filePath);
            return true;
        } catch (error) {
            console.error('Storage Delete Error:', error);
            return false;
        }
    }
}
