import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/ai/gemini';
import knowledge from '@/lib/ai/knowledge.json';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user activities
        const { data: activities, error: activityError } = await supabase
            .from('user_activity')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (activityError) {
            console.error('Activity Fetch Error:', activityError);
            return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
        }

        // Fetch product names if needed
        const productIds = activities
            .filter(a => a.activity_type === 'view_product')
            .map(a => a.entity_id);

        let productNames = [];
        if (productIds.length > 0) {
            const { data: products } = await supabase
                .from('products')
                .select('name')
                .in('id', productIds);
            productNames = products?.map(p => p.name) || [];
        }

        // Prepare prompt
        const prompt = `
            Kullanıcı Adı: ${user.user_metadata?.name || 'Değerli Kullanıcımız'}
            Son Aktiviteler: ${activities.map(a => a.activity_type).join(', ')}
            İncelenen Ürünler: ${productNames.join(', ')}
            
            Lütfen bu kullanıcı için kişiselleştirilmiş bir 'Ev Aydınlatma Analizi ve Öneri Raporu' oluştur.
            Rapor şunları içermeli:
            1. Kullanıcının ilgi alanlarına dayalı bir stil tahmini (örneğin: Modern, Klasik, Minimalist).
            2. Mevcut seçimlerine uygun 2-3 adet tamamlayıcı ürün önerisi.
            3. HomeSync hizmetlerinden (örneğin: Sertifikalı Montaj) nasıl faydalanabileceğine dair bir not.
            
            Dil: Türkçe
            Ton: Premium, Profesyonel ve Yardımsever.
            Format: Markdown (başlıklar, listeler kullanarak). 200 kelimeyi geçmesin.
        `;

        const report = await generateContent(prompt, JSON.stringify(knowledge));

        return NextResponse.json({ report });
    } catch (error: any) {
        console.error('Report API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
