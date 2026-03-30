"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type AcceptJobResult =
    | { success: true }
    | { success: false; error: string };

/**
 * acceptJob
 * ─────────────────────────────────────────────────────────────────
 * Usta gelen talebi tek tuşla kabul eder.
 * `service_requests.status` → 'usta_atandi' olarak güncellenir ve
 * usta_id bu kayda atanır.
 *
 * Güvenlik:
 * - Sadece giriş yapmış kullanıcılar çağırabilir.
 * - RLS, ustanın sadece kendisine açık talepleri görmesini/güncellemesini sağlar.
 */
export async function acceptJob(requestId: string): Promise<AcceptJobResult> {
    if (!requestId) {
        return { success: false, error: 'Geçersiz talep ID.' };
    }

    const supabase = createClient();

    // Oturum başarımını kontrol et
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: 'Oturum açmanız gerekiyor.' };
    }

    // Durumu güncelle: usta atandı
    const { error: updateError } = await supabase
        .from('service_requests')
        .update({
            status: 'usta_atandi',
            usta_id: user.id,
            updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        // Yalnızca henüz atanmamış (pending) talepleri kabul et
        .eq('status', 'pending');

    if (updateError) {
        console.error('[acceptJob] Supabase update error:', updateError);
        return {
            success: false,
            error: 'Talep kabul edilemedi. Talep zaten başkası tarafından alınmış olabilir.',
        };
    }

    revalidatePath('/usta');
    revalidatePath('/usta/jobs');

    return { success: true };
}
