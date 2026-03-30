"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import Image from 'next/image';

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    products: {
        id: string;
        name: string;
        image_url: string;
        category: string;
    } | null;
}

interface CustomerReviewsClientProps {
    reviews: Review[];
}

export default function CustomerReviewsClient({ reviews }: CustomerReviewsClientProps) {
    return (
        <div className="p-8 lg:p-12">
            <header className="mb-12">
                <p className="text-radiant-amber text-[10px] font-black uppercase tracking-[0.4em] mb-3">Geri Bildirimleriniz</p>
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Değerlendirmelerim</h1>
                <p className="text-white/40 text-sm mt-4 tracking-wide max-w-lg">
                    Satın aldığınız ürünler için yaptığınız yorumlar. Fikirleriniz sayesinde HomeSync topluluğu büyüyor.
                </p>
            </header>

            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <div className="glass p-12 rounded-[32px] border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <MessageSquare className="text-white/20" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Henüz değerlendirme yapmadınız</h3>
                        <p className="text-sm text-white/40">Satın aldığınız ürünleri değerlendirerek diğer müşterilere yardımcı olabilirsiniz.</p>
                    </div>
                ) : (
                    reviews.map((review, i) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass p-8 rounded-[32px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col md:flex-row gap-8"
                        >
                            {/* Product Info */}
                            <div className="flex items-start gap-4 md:w-1/3">
                                {review.products?.image_url ? (
                                    <div className="w-20 h-20 relative rounded-2xl overflow-hidden bg-white/5 shrink-0">
                                        <Image
                                            src={review.products.image_url}
                                            alt={review.products.name || 'Product'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 shrink-0">
                                        <Star className="text-white/20" size={24} />
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-white mb-1 line-clamp-2">{review.products?.name}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/5 px-2 py-1 rounded inline-block">
                                        {review.products?.category || 'Kategori Yok'}
                                    </p>
                                </div>
                            </div>

                            {/* Review Content */}
                            <div className="flex-1 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, index) => (
                                            <Star
                                                key={index}
                                                size={16}
                                                className={index < review.rating ? "text-radiant-amber fill-radiant-amber" : "text-white/20"}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">
                                        {new Date(review.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <p className="text-white/80 leading-relaxed text-sm md:text-base">
                                    &quot;{review.comment}&quot;
                                </p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
