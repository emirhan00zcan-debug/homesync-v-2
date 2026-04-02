import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StorageService } from '@/lib/services/storage';

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('[Upload-Document] Auth Error:', authError);
            return NextResponse.json({ error: 'Oturumunuz sona erdi. Lütfen tekrar giriş yapınız.' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const documentType = formData.get('documentType') as string;

        if (!file || !documentType) {
            console.warn('[Upload-Document] Missing params - File:', !!file, 'DocType:', documentType);
            return NextResponse.json({ error: 'Dosya veya belge türü eksik.' }, { status: 400 });
        }

        // Get user's actual role from both metadata and profile
        let rawRole = (user.user_metadata?.role || '').toUpperCase();
        console.log('[Upload-Document] Initial role from metadata:', rawRole, 'raw:', user.user_metadata?.role);

        // If role not in metadata, check profiles table
        if (!rawRole || rawRole === '') {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.warn('[Upload-Document] Profile fetch error:', profileError);
            } else if (profile?.role) {
                rawRole = (profile.role || '').toUpperCase();
                console.log('[Upload-Document] Role from profiles table:', rawRole);
            }
        }

        // If still no role, default to CUSTOMER
        if (!rawRole) {
            rawRole = 'CUSTOMER';
            console.log('[Upload-Document] No role found, defaulting to CUSTOMER');
        }

        const isTech = ['TECHNICIAN', 'USTA'].includes(rawRole);
        const isVendor = ['VENDOR', 'SATICI', 'CUSTOMER', 'ALICI'].includes(rawRole) || !isTech;
        
        console.log('[Upload-Document] User:', user.id, 'Role:', rawRole, 'isVendor:', isVendor, 'isTech:', isTech);

        // 1. Dosyayı kaydet
        const storageResult = await StorageService.uploadDocument(file, user.id, documentType);

        if (!storageResult.success) {
            console.error('[Upload-Document] Storage error:', storageResult.error);
            return NextResponse.json({ 
                error: storageResult.error || 'Dosya yükleme başarısız oldu.',
                type: 'STORAGE_ERROR'
            }, { status: 400 });
        }

        const fileUrl = `/api/craftsman/documents/${storageResult.fileName}`;
        console.log('[Upload-Document] File stored:', fileUrl);

        // 2. Veritabanına kayıt at (Role göre tablo seçimi)
        let dbError;
        let insertResult;

        if (isTech) {
            const { error, data } = await supabase
                .from('technician_documents')
                .insert({
                    usta_id: user.id,
                    document_type: documentType,
                    file_url: fileUrl,
                    status: 'PENDING'
                })
                .select();
            dbError = error;
            insertResult = data;
            console.log('[Upload-Document] Technician insert:', { success: !error, error, dataId: data?.[0]?.id });
        } else if (isVendor) {
            const { error, data } = await supabase
                .from('verification_documents')
                .insert({
                    user_id: user.id,
                    document_type: documentType,
                    document_url: fileUrl,
                    status: 'pending'
                })
                .select();
            dbError = error;
            insertResult = data;
            console.log('[Upload-Document] Vendor insert:', { success: !error, error, dataId: data?.[0]?.id });
        } else {
            console.warn('[Upload-Document] Unsupported role:', rawRole, 'User ID:', user.id);
            // Clean up uploaded file if role is unsupported
            if (storageResult.fileName) {
                await StorageService.deleteDocument(storageResult.fileName);
            }
            return NextResponse.json({ 
                error: `Bu rol (${rawRole}) için belge yükleme desteklenmiyor. Lütfen satıcı veya usta olarak kayıtlı olduğunuzdan emin olunuz.`,
                type: 'UNSUPPORTED_ROLE',
                role: rawRole
            }, { status: 403 });
        }

        if (dbError) {
            console.error('[Upload-Document] DB Insert Error:', {
                code: dbError.code,
                message: dbError.message,
                details: dbError.details,
                hint: dbError.hint
            });
            
            // Clean up uploaded file if DB insert fails
            if (storageResult.fileName) {
                await StorageService.deleteDocument(storageResult.fileName);
            }

            // More specific error messages
            let errorMsg = 'Veritabanı kaydı başarısız.';
            if (dbError.code === '23505') {
                errorMsg = 'Bu belge türü için zaten bir dosya yüklenmişti. Lütfen eski belgeyi silin veya farklı türde bir belge yükleyin.';
            } else if (dbError.code === '23502') {
                errorMsg = 'Zorunlu alan eksik. Lütfen tüm bilgileri kontrol edin.';
            } else if (dbError.code === '23514') {
                errorMsg = 'Belge durumu geçersiz.';
            }

            return NextResponse.json({ 
                error: errorMsg,
                type: 'DB_ERROR',
                code: dbError.code
            }, { status: 500 });
        }

        console.log('[Upload-Document] Success for user:', user.id, 'Document ID:', insertResult?.[0]?.id);

        return NextResponse.json({
            success: true,
            message: 'Belge başarıyla yüklendi ve onay bekliyor.',
            documentId: insertResult?.[0]?.id
        });


    } catch (error: any) {
        console.error('[Upload-Document] Fatal Error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return NextResponse.json({ 
            error: 'Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.',
            type: 'SERVER_ERROR'
        }, { status: 500 });
    }
}
