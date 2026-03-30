"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Hammer, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import { Master } from '@/types';

interface MasterCardProps {
    master: Master;
}

const MasterCard: React.FC<MasterCardProps> = ({ master }) => {
    return (
        <Link href={`/ustalar/${master.id}`} className="group relative">
            <motion.div
                layout
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -15, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
                className="glass-ultra rounded-[40px] border border-current/10 p-8 transition-all duration-500 hover:border-radiant-amber hover:shadow-glow-soft bg-current/5 overflow-hidden"
            >
                {/* Anti-Gravity Glow Effect */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-radiant-amber/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="flex flex-col items-center text-center">
                    {/* Avatar Container */}
                    <div className="relative mb-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden glass border-2 border-current/10 p-1 group-hover:border-radiant-amber transition-colors duration-500">
                            {master.avatar_url ? (
                                <img src={master.avatar_url} alt={master.full_name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full bg-background/50 flex items-center justify-center rounded-full">
                                    <User size={32} className="text-foreground/20" />
                                </div>
                            )}
                        </div>
                        
                        {master.is_verified && (
                            <div className="absolute -right-1 bottom-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-background shadow-lg">
                                <ShieldCheck size={16} className="text-white" />
                            </div>
                        )}
                    </div>

                    <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-radiant-amber transition-colors mb-2">
                        {master.full_name}
                    </h3>

                    {/* Expertise Tag */}
                    <div className="px-4 py-1 rounded-full bg-current/5 border border-current/10 mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60">
                            {master.stats?.expertise_areas || 'Uzman Tekniker'}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-8 w-full border-t border-current/10 pt-6 mb-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-radiant-amber mb-1">
                                <Star size={14} fill="currentColor" />
                                <span className="text-lg font-black italic">
                                    {master.stats?.toplam_puan ? (master.stats.toplam_puan).toFixed(1) : '5.0'}
                                </span>
                            </div>
                            <p className="text-[8px] font-bold uppercase tracking-widest text-foreground/40">Puan</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-foreground mb-1">
                                <Hammer size={14} className="opacity-40" />
                                <span className="text-lg font-black italic">
                                    {master.stats?.tamamlanan_is_sayisi || 0}
                                </span>
                            </div>
                            <p className="text-[8px] font-bold uppercase tracking-widest text-foreground/40">İş Tamamlama</p>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-radiant-amber opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        Profili İncele
                        <ArrowRight size={14} />
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default MasterCard;
