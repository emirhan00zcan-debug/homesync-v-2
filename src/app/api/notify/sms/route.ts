import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notify';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        // Yetki kontrolü — sadece admin/super_admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
        }

        const body = await req.json();
        const { recipientId, message, type = 'sms', metadata = {} } = body;

        if (!recipientId || !message) {
            return NextResponse.json({ error: 'recipientId ve message zorunludur' }, { status: 400 });
        }

        // Alıcının telefon numarasını al
        const { data: recipient } = await supabase
            .from('profiles')
            .select('id, phone, full_name')
            .eq('id', recipientId)
            .single();

        const result = await sendNotification({
            recipientId,
            recipientPhone: recipient?.phone ?? undefined,
            message,
            type,
            metadata: { ...metadata, recipientName: recipient?.full_name },
        });

        if (!result.success && result.channel !== 'mock') {
            return NextResponse.json({ error: 'Bildirim gönderilemedi', details: result.error }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            channel: result.channel,
            notificationId: result.notificationId,
        });
    } catch (e) {
        console.error('[notify/sms]', e);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
