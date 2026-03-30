"use client";

import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, ChevronRight } from 'lucide-react';

export default function UstaJobsPage() {
    return (
        <div className="pb-24 max-w-md mx-auto min-h-screen bg-[#0A192F]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0A192F]/90 backdrop-blur-md border-b border-white/10 px-4 py-5 font-bold">
                <h1 className="text-xl text-white">Görevlerim</h1>
                <p className="text-orange-400 text-xs mt-1 uppercase tracking-wider">Aktif ve Bekleyen İşler</p>
            </header>

            <div className="p-4 space-y-4 mt-2">

                {/* Single Job Card (Mock) */}
                <Link href="/usta/jobs/123" className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-colors active:scale-[0.98]">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-lg">Ahmet Yılmaz</span>
                            <span className="text-white/50 text-sm">Aydınlatma Montajı</span>
                        </div>
                        <span className="px-2.5 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                            Bekliyor
                        </span>
                    </div>

                    <div className="space-y-2 mt-4">
                        <div className="flex items-center text-white/80 text-[14px]">
                            <Clock size={16} className="text-white/40 mr-2 shrink-0" />
                            Bugün, 14:30
                        </div>
                        <div className="flex items-start text-white/80 text-[14px] leading-snug">
                            <MapPin size={16} className="text-white/40 mr-2 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">Atatürk Mah. İstiklal Cad. No:14 D:5 Ataşehir/İstanbul</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-orange-400 font-medium text-[15px]">
                        Detayları Gör
                        <ChevronRight size={18} />
                    </div>
                </Link>

                {/* Empty State Mock */}
                {/* <div className="glass p-8 rounded-3xl border border-orange-400/20 bg-orange-400/[0.02] flex flex-col items-center justify-center text-center h-[200px]">
                    <p className="text-white/60 text-sm">Başka görev bulunmuyor.</p>
                </div> */}

            </div>
        </div>
    );
}
