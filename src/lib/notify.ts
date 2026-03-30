/**
 * Notification helper — SMS/WhatsApp
 * 
 * Şu an "mock" modunda çalışıyor: mesajları Supabase'e kaydeder.
 * Twilio'ya geçmek için aşağıdaki TWILIO_* env değişkenlerini .env.local'a ekleyin:
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */

import { createClient } from '@/lib/supabase/server';

export interface NotifyPayload {
    recipientId: string;
    recipientPhone?: string;
    message: string;
    type?: 'sms' | 'whatsapp';
    metadata?: Record<string, unknown>;
}

export interface NotifyResult {
    success: boolean;
    channel: 'twilio' | 'mock';
    notificationId?: string;
    error?: string;
}

export async function sendNotification(payload: NotifyPayload): Promise<NotifyResult> {
    const { recipientId, recipientPhone, message, type = 'sms', metadata = {} } = payload;

    const hasTwilio =
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER;

    let status: 'sent' | 'failed' | 'pending' = 'pending';
    let channel: 'twilio' | 'mock' = 'mock';

    // ─── Twilio (gerçek SMS/WhatsApp) ────────────────────────────
    if (hasTwilio && recipientPhone) {
        try {
            const twilioSid = process.env.TWILIO_ACCOUNT_SID!;
            const twilioAuth = process.env.TWILIO_AUTH_TOKEN!;
            const from = type === 'whatsapp'
                ? `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`
                : process.env.TWILIO_PHONE_NUMBER!;
            const to = type === 'whatsapp' ? `whatsapp:${recipientPhone}` : recipientPhone;

            const body = new URLSearchParams({ From: from, To: to, Body: message });
            const res = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64')}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: body.toString(),
                }
            );

            if (res.ok) {
                status = 'sent';
                channel = 'twilio';
            } else {
                const err = await res.json();
                console.error('[Twilio] Gönderim hatası:', err);
                status = 'failed';
            }
        } catch (e) {
            console.error('[Twilio] Bağlantı hatası:', e);
            status = 'failed';
        }
    } else if (!hasTwilio) {
        // Mock modunda direkt "sent" sayılır (log amaçlı)
        status = 'sent';
        console.log(`[Mock SMS] Alıcı: ${recipientPhone || recipientId} | Mesaj: ${message}`);
    }

    // ─── Supabase'e kaydet ────────────────────────────────────────
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('notifications')
            .insert({
                recipient_id: recipientId,
                recipient_phone: recipientPhone ?? null,
                type,
                channel,
                message,
                status,
                metadata,
            })
            .select('id')
            .single();

        if (error) throw error;

        return { success: status === 'sent', channel, notificationId: data.id };
    } catch (e) {
        console.error('[Notify] DB kayıt hatası:', e);
        return { success: false, channel, error: String(e) };
    }
}
