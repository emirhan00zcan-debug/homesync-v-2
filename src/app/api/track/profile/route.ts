import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/track/profile
 * 
 * Oturum açmış kullanıcının davranış profilini döner.
 * AI öneri motoru (Aura, Nexus vb.) bu endpoint'i kullanır.
 * 
 * Response:
 * {
 *   categoryScores: { [category: string]: number },
 *   priceRange: { avg: number, min: number, max: number },
 *   recentlyViewed: string[],
 *   topCategories: string[]  // Skor sırasına göre ilk 3
 * }
 */
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile, error } = await supabase
            .from('user_behavior_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = "no rows found" — yeni kullanıcı için normal
            console.error('[track/profile] Profil çekme hatası:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!profile) {
            // Profil henüz oluşmamış (hiç ürün görüntülememiş)
            return NextResponse.json({
                categoryScores: {},
                priceRange: { avg: 0, min: 0, max: 0 },
                recentlyViewed: [],
                topCategories: [],
            });
        }

        // Kategori skorlarını sırala ve en yüksek 3'ü al
        const categoryScores: Record<string, number> = profile.category_scores ?? {};
        const topCategories = Object.entries(categoryScores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([cat]) => cat);

        return NextResponse.json({
            categoryScores,
            priceRange: {
                avg: profile.avg_price,
                min: profile.min_comfort_price,
                max: profile.max_comfort_price,
            },
            recentlyViewed: profile.recently_viewed ?? [],
            topCategories,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
        console.error('[track/profile] Hata:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
