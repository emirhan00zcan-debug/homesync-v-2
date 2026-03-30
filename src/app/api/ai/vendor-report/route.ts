import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/ai/gemini';
import knowledge from '@/lib/ai/knowledge.json';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stats = await req.json();

        // Prepare prompt
        const prompt = `
            Sen HomeSync satıcılarına tavsiye veren bir finansal danışman yapay zekasın. 
            Satıcı Adı: ${stats.fullName || 'Satıcı'}
            Ürün Sayısı: ${stats.productCount}
            Sipariş Sayısı: ${stats.orderCount}
            Brüt Gelir: ₺${stats.grossRevenue.toLocaleString('tr-TR')}
            
            Lütfen satıcıya performansıyla ilgili, durumu analiz eden, tavsiye veren, cesaretlendirici 'Yapay Zeka Performans Analizi' oluştur. 'Bu ay satışların arttı/düştü' gibi yorumlar yapabilirsin (sipariş sayısına ve gelire bakarak mantıklı varsayımlarda bulun).
            Ayrıca mağazasını büyütmesi için kısa, eyleme geçirilebilir bir "Aksiyon Önerisi" sun (örneğin daha fazla ürün ekleme, kampanyalara katılma vs.).
            
            Dil: Türkçe
            Ton: Premium, motive edici, veri odaklı.
            Format: Markdown olmamalı. 1 paragraf özet, ardından "Aksiyon Önerisi:" diyerek 1 cümlelik pratik tavsiye şeklinde kısa ve doğrudan olmalı. (Maksimum 3-4 cümle).
        `;

        const report = await generateContent(prompt, JSON.stringify(knowledge));

        return NextResponse.json({ report });
    } catch (error: any) {
        console.error('Vendor AI Report API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
