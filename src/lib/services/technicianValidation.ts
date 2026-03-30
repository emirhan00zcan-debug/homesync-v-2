import { createAdminClient } from '@/lib/supabase/admin';

export class TechnicianValidationService {
    /**
     * Bir ustanın aktif olup olamayacağını kontrol eder.
     * Kural: Kimlik doğrulanmış olmalı VE tüm zorunlu belgeler APPROVED olmalı.
     */
    static async canBeActive(ustaId: string): Promise<{ canActive: boolean; reason?: string }> {
        const supabase = createAdminClient();

        // 1. Profil ve Kimlik Doğrulama kontrolü
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_identity_verified, role')
            .eq('id', ustaId)
            .single();

        if (profileError || !profile) {
            return { canActive: false, reason: 'Profil bulunamadı.' };
        }

        if (!profile.is_identity_verified) {
            return { canActive: false, reason: 'T.C. Kimlik doğrulaması tamamlanmamış.' };
        }

        // 2. Belgelerin kontrolü (IDENTITY ve CERTIFICATE zorunlu olsun)
        const requiredDocs = ['IDENTITY', 'CERTIFICATE'];
        const { data: documents, error: docsError } = await supabase
            .from('technician_documents')
            .select('document_type, status')
            .eq('usta_id', ustaId);

        if (docsError || !documents) {
            return { canActive: false, reason: 'Belgeler kontrol edilemedi.' };
        }

        for (const type of requiredDocs) {
            const doc = documents.find(d => d.document_type === type);
            if (!doc) {
                return { canActive: false, reason: `Eksik belge: ${type}` };
            }
            if (doc.status !== 'APPROVED') {
                return { canActive: false, reason: `Belge onay bekliyor veya reddedildi: ${type}` };
            }
        }

        return { canActive: true };
    }

    /**
     * Usta aktiflik durumunu güncellerken bu validasyonu zorunlu kılar.
     */
    static async trySetAvailable(ustaId: string, requestedAvailable: boolean): Promise<{ success: boolean; message: string }> {
        if (!requestedAvailable) {
            // Pasife çekmek her zaman serbest
            const supabase = createAdminClient();
            await supabase.from('profiles').update({ is_available: false }).eq('id', ustaId);
            return { success: true, message: 'Durum güncellendi.' };
        }

        const validation = await this.canBeActive(ustaId);
        if (!validation.canActive) {
            return { success: false, message: validation.reason || 'Kriterler sağlanmıyor.' };
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('profiles')
            .update({ is_available: true })
            .eq('id', ustaId);

        if (error) {
            return { success: false, message: 'Güncelleme başarısız.' };
        }

        return { success: true, message: 'Tebrikler, artık aktifsiniz!' };
    }
}
