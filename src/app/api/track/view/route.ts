import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/track/view
 * 
 * Kullanıcının bir ürünü görüntülediğini kaydeder ve davranış profilini günceller.
 * 
 * Body: { productId: string, category: string, price: number }
 * 
 * Algoritma:
 * 1. Kategori skorunu +1 artır (JSONB)
 * 2. Fiyat geçmişine ekle, son 20 fiyatı tut
 * 3. avg / min_comfort (%70) / max_comfort (%130) hesapla
 * 4. Son görüntülenenler listesini güncelle (son 20 UUID)
 * 5. user_behavior_profiles tablosuna upsert et
 */
export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId, category, price } = await req.json();

        if (!productId || !category || price === undefined) {
            return NextResponse.json(
                { error: 'productId, category ve price zorunludur' },
                { status: 400 }
            );
        }


        // 1. Mevcut profili çek
        const { data: existingProfile } = await supabase
            .from('user_behavior_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // 2. Kategori skorunu güncelle
        const categoryScores: Record<string, number> = existingProfile?.category_scores ?? {};
        categoryScores[category] = (categoryScores[category] ?? 0) + 1;

        // 3. Fiyat geçmişini güncelle (son 20 ürün)
        let viewedPrices: number[] = existingProfile?.viewed_prices ?? [];
        viewedPrices.push(Number(price));
        if (viewedPrices.length > 20) {
            viewedPrices = viewedPrices.slice(-20); // En eski fiyatı at
        }

        // 4. Fiyat istatistiklerini hesapla
        const avg = viewedPrices.reduce((a, b) => a + b, 0) / viewedPrices.length;
        const minComfortPrice = avg * 0.7;  // Ortalamanın %30 altı
        const maxComfortPrice = avg * 1.3;  // Ortalamanın %30 üstü

        // 5. Son görüntülenenler listesini güncelle (son 20 UUID, tekrarları çıkar)
        let recentlyViewed: string[] = existingProfile?.recently_viewed ?? [];
        recentlyViewed = recentlyViewed.filter((id) => id !== productId); // Tekrar varsa sil
        recentlyViewed.push(productId);
        if (recentlyViewed.length > 20) {
            recentlyViewed = recentlyViewed.slice(-20);
        }

        // 6. Profili upsert et
        const { error: upsertError } = await supabase
            .from('user_behavior_profiles')
            .upsert({
                user_id: user.id,
                category_scores: categoryScores,
                viewed_prices: viewedPrices,
                avg_price: Number(avg.toFixed(2)),
                min_comfort_price: Number(minComfortPrice.toFixed(2)),
                max_comfort_price: Number(maxComfortPrice.toFixed(2)),
                recently_viewed: recentlyViewed,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id',
            });

        if (upsertError) {
            console.error('[track/view] Upsert hatası:', upsertError);
            return NextResponse.json({ error: upsertError.message }, { status: 500 });
        }

        // 7. Ham activity log'a da yaz (mevcut user_activity tablosu)
        await supabase.from('user_activity').insert({
            user_id: user.id,
            activity_type: 'product_view',
            entity_id: productId,
            metadata: { category, price },
        });

        return NextResponse.json({
            success: true,
            profile: {
                categoryScores,
                avgPrice: avg.toFixed(2),
                priceRange: {
                    min: minComfortPrice.toFixed(2),
                    max: maxComfortPrice.toFixed(2),
                },
                recentlyViewedCount: recentlyViewed.length,
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
        console.error('[track/view] Hata:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
