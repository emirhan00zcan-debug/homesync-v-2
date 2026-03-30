"use client";

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowUpRight, CheckCircle2, Clock, Wallet } from 'lucide-react';

function PaymentsContent() {
    const transactions = [
        { id: "TX-9012", item: "Orion Kristal Avize", date: "22 Feb 2026", amount: "24.999 ₺", status: "Completed" },
        { id: "TX-4451", item: "Kurulum Hizmeti - Beşiktaş", date: "20 Feb 2026", amount: "1.450 ₺", status: "Completed" },
        { id: "TX-8820", item: "Nebula Akıllı Panel (x2)", date: "15 Feb 2026", amount: "17.500 ₺", status: "Processing" },
    ];

    return (
        <div className="p-8 lg:p-12">
            <header className="mb-12">
                <p className="text-radiant-amber text-[10px] font-black uppercase tracking-[0.4em] mb-3">Financial Gateway</p>
                <h1 className="text-5xl font-black text-white tracking-tighter">Ödemelerim</h1>
                <p className="text-white/40 text-sm mt-4 tracking-wide max-w-lg">İşlemlerinizi takip edin, faturalarınızı yönetin ve ödeme yöntemlerinizi güvenle saklayın.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-1 glass p-8 rounded-[48px] border border-blue-500/10 bg-blue-500/[0.02] flex flex-col justify-between h-[280px]">
                    <div className="w-14 h-14 bg-blue-400/10 rounded-2xl flex items-center justify-center">
                        <Wallet className="text-blue-400" size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Toplam Harcama</p>
                        <p className="text-4xl font-black text-white tracking-widest">43.949 ₺</p>
                    </div>
                </div>

                <div className="lg:col-span-2 glass p-8 rounded-[48px] border border-white/5 bg-white/[0.01] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-[1.6] group-hover:rotate-0 transition-all duration-1000">
                        <CreditCard size={180} />
                    </div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-8">Aktif Kart</p>
                            <h3 className="text-2xl font-black text-white mb-2">MasterCard Platinum</h3>
                            <p className="text-white/40 font-mono tracking-widest text-lg">•••• •••• •••• 9201</p>
                        </div>
                        <button className="w-fit text-[10px] font-black uppercase tracking-widest text-radiant-amber border-b border-radiant-amber/30 pb-1 mt-8 hover:text-white transition-colors">
                            Kart Bilgilerini Güncelle
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">İşlem Geçmişi</h4>
                <div className="space-y-4">
                    {transactions.map((tx, i) => (
                        <div key={i} className="glass p-8 rounded-[40px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center gap-8 group">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${tx.status === 'Completed' ? 'bg-green-400/5 border-green-400/10 text-green-400' : 'bg-radiant-amber/5 border-radiant-amber/10 text-radiant-amber'
                                }`}>
                                {tx.status === 'Completed' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                            </div>
                            <div className="flex-1">
                                <h5 className="text-lg font-bold text-white mb-1">{tx.item}</h5>
                                <div className="flex items-center gap-6">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{tx.id}</p>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{tx.date}</p>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-8">
                                <p className="text-xl font-black text-white">{tx.amount}</p>
                                <button className="w-10 h-10 glass rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all hover:border-radiant-amber text-white/20 hover:text-radiant-amber">
                                    <ArrowUpRight size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function PaymentsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white/50">Yükleniyor...</div>}>
            <PaymentsContent />
        </Suspense>
    );
}
