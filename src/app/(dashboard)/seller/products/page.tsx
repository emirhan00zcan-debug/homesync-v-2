"use client";

import React from 'react';

export default function SellerProductsPage() {
    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white">Ürünlerim</h1>
                    <p className="text-sm font-bold text-white/40 uppercase tracking-widest mt-1">Envanter Yönetimi</p>
                </div>
            </header>

            <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center h-[400px]">
                <p className="text-white/60 mb-4">Henüz hiç ürün eklemediniz.</p>
                <button className="px-6 py-3 bg-radiant-amber text-cosmic-blue font-bold rounded-2xl hover:scale-[1.02] transition-transform">
                    Yeni Ürün Ekle
                </button>
            </div>
        </div>
    );
}
