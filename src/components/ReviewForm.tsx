"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, MessageSquare, ShieldCheck } from 'lucide-react';

interface ReviewFormProps {
    productId: string;
    onSuccess?: () => void;
}

import { submitReview } from '@/app/actions/customer/product-interactions';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);

        const result = await submitReview(
            productId,
            rating,
            comment,
            user?.id || 'anonymous' // Fallback for demo
        );

        setIsSubmitting(false);
        if (result.success) {
            setIsSuccess(true);
            if (onSuccess) {
                setTimeout(() => onSuccess(), 2000);
            }
        }
    };

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-8 rounded-[40px] border border-green-400/20 bg-green-400/5 text-center"
            >
                <div className="w-16 h-16 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="text-green-400" size={32} />
                </div>
                <h4 className="text-2xl font-black text-white mb-2">Review Submitted!</h4>
                <p className="text-white/40 text-sm">Thank you for sharing your experience with the community.</p>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="glass p-8 rounded-[40px] border border-white/5 bg-white/[0.02] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <MessageSquare size={120} />
            </div>

            <h4 className="text-2xl font-black text-white mb-8 tracking-tighter">Share Your Experience</h4>

            <div className="space-y-8 relative z-10">
                {/* Star Rating */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Overall Satisfaction</p>
                    <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                className="transition-all duration-300 hover:scale-125 focus:outline-none"
                            >
                                <Star
                                    className={`transition-all duration-300 ${(hover || rating) >= star
                                        ? 'fill-radiant-amber text-radiant-amber filter drop-shadow-[0_0_10px_rgba(255,191,0,0.5)]'
                                        : 'text-white/10'
                                        }`}
                                    size={32}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comment area */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Tell us more</p>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="How did the lighting transform your space?"
                        rows={4}
                        className="w-full bg-black/20 border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-radiant-amber/50 transition-all placeholder:text-white/10 custom-scrollbar resize-none"
                    />
                </div>

                <Button
                    disabled={rating === 0}
                    isLoading={isSubmitting}
                    className="w-full py-5 bg-radiant-amber text-cosmic-blue font-black rounded-2xl hover:shadow-glow disabled:opacity-30 disabled:hover:shadow-none transition-all duration-500 uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95"
                >
                    {!isSubmitting && (
                        <>Post My Review <Send size={16} /></>
                    )}
                </Button>
            </div>
        </form>
    );
}
