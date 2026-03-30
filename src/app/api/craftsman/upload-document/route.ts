import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StorageService } from '@/lib/services/storage';

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const documentType = formData.get('documentType') as string;

        if (!file || !documentType) {
            return NextResponse.json({ error: 'Dosya veya belge türü eksik.' }, { status: 400 });
        }

        const rawRole = (user.user_metadata?.role || 'CUSTOMER').toUpperCase();
        const isVendor = ['VENDOR', 'SATICI'].includes(rawRole);
        const isTech = ['TECHNICIAN', 'USTA'].includes(rawRole);

        console.log('Upload Request - User:', user.id, 'Role:', rawRole, 'isVendor:', isVendor, 'isTech:', isTech);

        // 1. Dosyayı kaydet
        const storageResult = await StorageService.uploadDocument(file, user.id, documentType);

        if (!storageResult.success) {
            return NextResponse.json({ error: storageResult.error }, { status: 400 });
        }

        const fileUrl = `/api/craftsman/documents/${storageResult.fileName}`;

        // 2. Veritabanına kayıt at (Role göre tablo seçimi)
        let dbError;
        if (isTech) {
            const { error } = await supabase
                .from('technician_documents')
                .insert({
                    usta_id: user.id,
                    document_type: documentType,
                    file_url: fileUrl,
                    status: 'PENDING'
                });
            dbError = error;
        } else if (isVendor) {
            const { error } = await supabase
                .from('verification_documents')
                .insert({
                    user_id: user.id,
                    document_type: documentType,
                    document_url: fileUrl,
                    status: 'pending'
                });
            dbError = error;
        } else {
            console.warn('Unsupported role for upload:', rawRole, 'User ID:', user.id);
            return NextResponse.json({ error: 'Bu rol için belge yükleme desteklenmiyor.' }, { status: 403 });
        }

        if (dbError) {
            console.error('DB Insert Error:', dbError);
            if (storageResult.fileName) await StorageService.deleteDocument(storageResult.fileName);
            return NextResponse.json({ error: 'Veritabanı kaydı başarısız.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Belge başarıyla yüklendi ve onay bekliyor.'
        });

    } catch (error: any) {
        console.error('API Upload Document Error:', error);
        return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
    }
}
