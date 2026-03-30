import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Star, MessageCircleOff } from 'lucide-react';

export default async function TechnicianReviewsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'usta') redirect('/dashboard');

    const { data: reviews } = await supabase
        .from('usta_reviews')
        .select('*, profiles!usta_reviews_customer_id_fkey(full_name)')
        .eq('usta_id', user.id)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

    const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

    const ratingCounts = [5, 4, 3, 2, 1].map(n => ({
        star: n,
        count: reviews?.filter(r => r.rating === n).length ?? 0,
    }));

    return (
        <div className="space-y-8">
            <div>
                <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Değerlendirmeler</p>
                <h1 className="text-4xl font-black text-white tracking-tighter">Yorumlarım</h1>
            </div>

            {reviews && reviews.length > 0 ? (
                <>
                    {/* Rating summary */}
                    <div className="p-6 rounded-2xl border flex flex-col sm:flex-row items-center gap-6"
                        style={{ background: 'rgba(255,191,0,0.06)', borderColor: 'rgba(255,191,0,0.2)' }}>
                        <div className="text-center shrink-0">
                            <p className="text-6xl font-black text-white">{avgRating.toFixed(1)}</p>
                            <div className="flex items-center justify-center gap-1 mt-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/15'}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-white/40 mt-1">{reviews.length} değerlendirme</p>
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                            {ratingCounts.map(({ star, count }) => (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-[10px] text-white/40 w-4 text-right">{star}</span>
                                    <Star size={10} className="text-yellow-400 fill-yellow-400 shrink-0" />
                                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-yellow-400"
                                            style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-white/30 w-4">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Review list */}
                    <div className="space-y-3">
                        {reviews.map(review => (
                            <div
                                key={review.id}
                                className="p-5 rounded-2xl border border-white/8 hover:border-white/15 transition-all"
                                style={{ background: 'rgba(255,255,255,0.02)' }}
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                        <p className="font-bold text-white text-sm">
                                            {(review.profiles as any)?.full_name ?? 'Anonim'}
                                        </p>
                                        <p className="text-xs text-white/30 mt-0.5">
                                            {new Date(review.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                size={13}
                                                className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/15'}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-white/60 leading-relaxed">{review.comment}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <MessageCircleOff size={56} className="text-white/10 mb-4" />
                    <p className="text-white/40 font-bold text-lg">Henüz yorum almadınız</p>
                    <p className="text-white/20 text-sm mt-2">İlk işinizi tamamladığınızda müşteriler değerlendirme bırakabilir.</p>
                </div>
            )}
        </div>
    );
}
