"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Review {
    user: string;
    rating: number;
    comment: string;
    pos: { top: number; left: number };
}

interface ReviewComponentProps {
    reviews: Review[];
}

const ReviewComponent = ({ reviews }: ReviewComponentProps) => {
    return (
        <div className="relative w-full h-[400px] overflow-hidden mt-12 bg-gradient-to-b from-transparent to-white/5 rounded-[40px] p-8">
            <div className="text-center mb-8">
                <h4 className="text-xl font-bold">Müşteri Deneyimi</h4>
                <div className="flex items-center justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={14} className="fill-radiant-amber text-radiant-amber" />
                    ))}
                    <span className="text-xs ml-2 opacity-40">(4.9/5)</span>
                </div>
            </div>

            <div className="relative w-full h-full">
                {reviews.map((review, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: [0, -15, 0],
                            x: [0, 10, 0]
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5
                        }}
                        style={{
                            top: `${review.pos.top}%`,
                            left: `${review.pos.left}%`
                        }}
                        className="absolute glass p-4 md:p-6 rounded-[30px] border border-white/10 shadow-2xl max-w-[250px] cursor-default group hover:z-20 hover:border-radiant-amber/50 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-radiant-amber to-amber-200 flex items-center justify-center text-[10px] text-cosmic-blue font-bold">
                                {review.user[0]}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{review.user}</span>
                        </div>
                        <p className="text-xs md:text-sm leading-relaxed opacity-90 italic">
                            &quot;{review.comment}&quot;
                        </p>

                        <div className="absolute -bottom-2 -right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} size={10} className="fill-radiant-amber text-radiant-amber" />
                            ))}
                        </div>
                    </motion.div>
                ))}

                {/* Decorative Particles */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-radiant-amber/5 blur-[80px] rounded-full pointer-events-none"></div>
            </div>
        </div>
    );
};

export default ReviewComponent;
