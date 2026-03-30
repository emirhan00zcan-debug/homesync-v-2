"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MessageCircle } from 'lucide-react';
import ReviewForm from './ReviewForm';
import { useThemeEffect } from '@/context/ThemeContext';

import { Review } from '@/types';

interface ReviewSectionProps {
    productId: string;
    initialReviews: Review[];
}

export default function ReviewSection({ productId, initialReviews }: ReviewSectionProps) {
    const { isLightOn } = useThemeEffect();
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviews] = useState(initialReviews);

    // Filter reviews to ensure we have valid data
    const activeReviews = reviews;

    return (
        <section className="space-y-12">
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40 mb-2">Müşteri Deneyimleri</h3>
                    <p className="text-2xl font-bold tracking-tighter">Topluluk Görüşleri</p>
                </div>
                <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-6 py-3 glass border border-radiant-amber/30 text-radiant-amber text-[10px] font-black uppercase tracking-widest hover:bg-radiant-amber hover:text-cosmic-blue transition-all duration-500 rounded-xl"
                >
                    {showReviewForm ? "Vazgeç" : "Yorum Yap"}
                </button>
            </div>

            <AnimatePresence>
                {showReviewForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <ReviewForm
                            productId={productId}
                            onSuccess={() => {
                                setShowReviewForm(false);
                                // In a real app we'd fetch or use the return from submitReview
                                // For now we'll rely on server revalidation after refresh or just mock update
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {activeReviews.length === 0 ? (
                <div className="py-20 text-center glass rounded-[40px] border border-dashed border-white/5">
                    <MessageCircle className="mx-auto text-white/10 mb-6" size={48} />
                    <p className="text-white/20 font-black uppercase tracking-widest text-[10px]">Henüz yorum yapılmadı. İlk yorumu siz yapın.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeReviews.map((review) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-8 rounded-[40px] border transition-all duration-700 ${isLightOn ? 'bg-black/[0.02] border-black/5' : 'bg-white/[0.02] border-white/5'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center font-bold text-xs uppercase border border-white/10">
                                        {review.user?.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{review.user?.name || 'Anonim Kullanıcı'}</p>
                                        <p className="text-[10px] opacity-40 uppercase tracking-widest font-black">
                                            {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, j) => (
                                        <Zap
                                            key={j}
                                            className={j < review.rating ? 'text-radiant-amber' : 'text-white/10'}
                                            size={12}
                                            fill={j < review.rating ? 'currentColor' : 'none'}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-[14px] leading-relaxed opacity-60 italic tracking-wide">
                                &quot;{review.comment || 'Puan verildi.'}&quot;
                            </p>
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    );
}
