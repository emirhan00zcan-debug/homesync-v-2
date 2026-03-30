"use client";

import React from 'react';

export default function SellerOrdersPage() {
    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white">Siparişlerim</h1>
                    <p className="text-sm font-bold text-white/40 uppercase tracking-widest mt-1">Gelen Siparişleri Yönetin</p>
                </div>
            </header>

            <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center h-[400px]">
                <p className="text-white/60">Henüz siparişiniz bulunmuyor.</p>
            </div>
        </div>
    );
}
