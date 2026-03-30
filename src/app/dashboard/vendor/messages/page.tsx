import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MessageSquare, MessageCircleOff, Star } from 'lucide-react';
import Link from 'next/link';

export default async function VendorMessagesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'vendor') redirect('/dashboard');

    // Ürünlerimizin yorumlarını çek (müşteri iletişimi)
    const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('vendor_id', user.id);

    const productIds = products?.map(p => p.id) ?? [];
    let reviews: any[] = [];

    if (productIds.length > 0) {
        const { data } = await supabase
            .from('reviews')
            .select('id, rating, comment, created_at, product_id, products(name), user_id, profiles!reviews_user_id_fkey(full_name)')
            .in('product_id', productIds)
            .order('created_at', { ascending: false })
            .limit(50);
        reviews = data ?? [];
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Müşteri İletişimi</p>
                <h1 className="text-4xl font-black text-white tracking-tighter">Mesajlar & Yorumlar</h1>
            </div>

            {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <MessageCircleOff size={56} className="text-white/10 mb-4" />
                    <p className="text-white/40 font-bold text-lg">Henüz yorum yok</p>
                    <p className="text-white/20 text-sm mt-2">Müşterileriniz yorum bıraktığında burada görünecek.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-2">
                        {reviews.length} Değerlendirme
                    </p>
                    {reviews.map((review) => {
                        const stars = Array.from({ length: 5 });
                        return (
                            <div
                                key={review.id}
                                className="p-5 rounded-2xl border border-white/8 hover:border-white/15 transition-all"
                                style={{ background: 'rgba(255,255,255,0.02)' }}
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                        <p className="font-bold text-white text-sm">
                                            {(review.profiles as any)?.full_name ?? 'Anonim Müşteri'}
                                        </p>
                                        <p className="text-xs text-blue-400/70">
                                            {(review.products as any)?.name ?? 'Bilinmeyen Ürün'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {stars.map((_, i) => (
                                            <Star
                                                key={i}
                                                size={12}
                                                className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/15'}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-white/60 leading-relaxed">{review.comment}</p>
                                )}
                                <p className="text-[10px] text-white/25 mt-3">
                                    {new Date(review.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
