"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type CompleteJobResult =
    | { success: true }
    | { success: false; error: string };

export type PaymentType = 'card' | 'cash';

/**
 * completeJob
 * ─────────────────────────────────────────────────────────────────
 * Usta işi tamamladığında çağrılır.
 *
 * İşlemler (sırasıyla):
 * 1. `service_requests.status` → 'completed'
 * 2. `completed_at` → şimdiki zaman
 * 3. `technician_stats.tamamlanan_is_sayisi` arttırılır.
 * 4. `technician_stats.toplam_kazanc`   arttırılır.
 * 5. ÖDEME NOKTASI (mock): Gerçek para geçişi için buraya
 *    Stripe/İyzico veya kasa akışı entegre edilecek.
 *
 * Güvenlik:
 * - Yalnızca talebe atanmış usta çağırabilir (RLS + .eq('usta_id', user.id)).
 */
export async function completeJob(
    requestId: string,
    paymentType: PaymentType = 'cash'
): Promise<CompleteJobResult> {
    if (!requestId) {
        return { success: false, error: 'Geçersiz talep ID.' };
    }

    const supabase = createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: 'Oturum açmanız gerekiyor.' };
    }

    // Talebi al: fiyat ve durumu kontrol etmek için
    const { data: request, error: fetchError } = await supabase
        .from('service_requests')
        .select('id, status, final_price, price_offered, usta_id')
        .eq('id', requestId)
        .eq('usta_id', user.id) // Sadece bu ustanın işi
        .single();

    if (fetchError || !request) {
        return {
            success: false,
            error: 'Talep bulunamadı veya bu işlemi yapma yetkiniz yok.',
        };
    }

    if (request.status === 'completed') {
        return { success: false, error: 'Bu iş zaten tamamlandı.' };
    }

    if (request.status !== 'usta_atandi') {
        return {
            success: false,
            error: `Beklenmedik talep durumu: ${request.status}. İş henüz kabul edilmemiş olabilir.`,
        };
    }

    const jobPrice =
        request.final_price ?? request.price_offered ?? 0;

    // ─── ÖDEME NOKTASI ──────────────────────────────────────
    // TODO: Gerçek ödeme entegrasyonu burada yapılacak.
    //
    // Kart ödemesi için (Stripe/İyzico):
    //   const paymentResult = await stripe.paymentIntents.capture(paymentIntentId);
    //   if (!paymentResult.success) return { success: false, error: '...' };
    //
    // Nakit tahsilat için:
    //   Fiziksel tahsilat kaydı oluşturulabilir (şu an atlanıyor).
    //
    // paymentType: 'card' | 'cash'
    console.info(`[completeJob] Payment type: ${paymentType}, Amount: ${jobPrice} ₺ (mock – no real charge)`);
    // ────────────────────────────────────────────────────────

    // 1. Talebi tamamlandı olarak işaretle
    const { error: updateError } = await supabase
        .from('service_requests')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('usta_id', user.id);

    if (updateError) {
        console.error('[completeJob] update service_requests error:', updateError);
        return { success: false, error: 'İş durumu güncellenemedi.' };
    }

    // 2. Usta istatistiklerini güncelle (tamamlanan iş sayısı + kazanç)
    const { data: stats, error: statsError } = await supabase
        .from('technician_stats')
        .select('tamamlanan_is_sayisi, toplam_kazanc')
        .eq('usta_id', user.id)
        .single();

    if (!statsError && stats) {
        await supabase
            .from('technician_stats')
            .update({
                tamamlanan_is_sayisi: (stats.tamamlanan_is_sayisi ?? 0) + 1,
                toplam_kazanc: Number(stats.toplam_kazanc ?? 0) + Number(jobPrice),
                updated_at: new Date().toISOString(),
            })
            .eq('usta_id', user.id);
    }

    revalidatePath('/usta');
    revalidatePath('/usta/jobs');

    return { success: true };
}
