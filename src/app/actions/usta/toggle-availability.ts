"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ToggleAvailabilityResult =
    | { success: true; isAvailable: boolean }
    | { success: false; error: string };

/**
 * toggleAvailability
 * ─────────────────────────────────────────────────────────────────
 * Ustanın "Şu an iş alıyorum / Mesaim bitti" durumunu tersine çevirir.
 * `technician_stats.is_available` sütunu güncellenir.
 * Bu alan, müşteri tarafında haritada/listede ustanın görünürlüğünü belirler.
 */
export async function toggleAvailability(): Promise<ToggleAvailabilityResult> {
    const supabase = createClient();

    // Oturum açmış kullanıcıyı al
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: 'Oturum açmanız gerekiyor.' };
    }

    // Mevcut durumu oku
    const { data: stats, error: fetchError } = await supabase
        .from('technician_stats')
        .select('is_available')
        .eq('usta_id', user.id)
        .single();

    if (fetchError || !stats) {
        return {
            success: false,
            error: 'Usta profili bulunamadı. Lütfen yöneticinizle iletişime geçin.',
        };
    }

    const newValue = !stats.is_available;

    // Tersi değeri kaydet
    const { error: updateError } = await supabase
        .from('technician_stats')
        .update({ is_available: newValue, updated_at: new Date().toISOString() })
        .eq('usta_id', user.id);

    if (updateError) {
        console.error('[toggleAvailability] Supabase update error:', updateError);
        return { success: false, error: 'Durum güncellenemedi. Lütfen tekrar deneyin.' };
    }

    revalidatePath('/usta');
    revalidatePath('/usta/settings');

    return { success: true, isAvailable: newValue };
}
