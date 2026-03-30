"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, Info, AlertCircle, Sparkles, Hash } from 'lucide-react';
import { createProduct } from '@/app/actions/seller/product-actions';
import Link from 'next/link';

export default function NewTechnicianProductPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isNovaLoading, setIsNovaLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // AI-populated fields state
    const [form, setForm] = useState({
        name: '',
        category: 'Service',
        description: '',
        meta_description: '',
        tags: ''
    });

    const handleNovaGenerate = async () => {
        if (!form.name) {
            setError('Nova\'nın çalışması için en azından bir isim girmelisiniz.');
            return;
        }

        setIsNovaLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/nova', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    category: form.category,
                    current_description: form.description
                }),
            });

            if (!response.ok) throw new Error('Nova şu an meşgul, lütfen daha sonra tekrar deneyin.');

            const data = await response.json();

            setForm(prev => ({
                ...prev,
                description: data.description,
                meta_description: data.meta_desc,
                tags: data.tags.join(', ')
            }));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsNovaLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await createProduct(formData);

        if (result.success) {
            router.push('/dashboard/technician/products');
        } else {
            setError(result.error || 'Bir hata oluştu.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 lg:p-12 max-w-4xl mx-auto">
            <Link
                href="/dashboard/technician/products"
                className="flex items-center gap-2 text-white/40 hover:text-radiant-amber transition-colors mb-8 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Geri Dön</span>
            </Link>

            <header className="mb-10">
                <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Yeni Ürün / Hizmet Ekle</h1>
                <p className="text-white/30 text-sm">Platformda sergilenecek ürün veya montaj hizmetinizi tanımlayın.</p>
            </header>

            {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Temel Bilgiler */}
                <div className="glass rounded-[40px] border border-white/5 bg-white/[0.02] p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-radiant-amber/10 flex items-center justify-center text-radiant-amber">
                            <Info size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-white">Genel Bilgiler</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">Ürün/Hizmet Adı</label>
                            <input
                                required
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="Örn: Zenith Serisi Akıllı Montaj Hizmeti"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-radiant-amber/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">Kategori</label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-radiant-amber/50 transition-colors appearance-none"
                            >
                                <option value="Service" className="bg-cosmic-blue font-sans">Montaj Hizmeti</option>
                                <option value="Lighting" className="bg-cosmic-blue font-sans">Aydınlatma Ürünü</option>
                                <option value="Smart Home" className="bg-cosmic-blue font-sans">Akıllı Ev Sistemleri</option>
                                <option value="Accessories" className="bg-cosmic-blue font-sans">Aksesuar</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">Fiyat (₺)</label>
                            <input
                                required
                                name="price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-radiant-amber/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">Zorluk Seviyesi</label>
                            <select
                                name="difficulty"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-radiant-amber/50 transition-colors appearance-none"
                            >
                                <option value="Easy" className="bg-cosmic-blue font-sans">Kolay</option>
                                <option value="Medium" className="bg-cosmic-blue font-sans" selected>Orta</option>
                                <option value="Hard" className="bg-cosmic-blue font-sans">Zor (Uzmanlık Gerektirir)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">Açıklama</label>
                            <button
                                type="button"
                                onClick={handleNovaGenerate}
                                disabled={isNovaLoading}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-radiant-amber/10 border border-radiant-amber/20 text-radiant-amber text-[9px] font-black uppercase tracking-widest hover:bg-radiant-amber/20 transition-all disabled:opacity-50"
                            >
                                {isNovaLoading ? (
                                    <div className="w-3 h-3 border-2 border-radiant-amber border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Sparkles size={12} />
                                )}
                                {isNovaLoading ? 'Nova Yazıyor...' : 'Nova ile Yaz'}
                            </button>
                        </div>
                        <textarea
                            name="description"
                            rows={4}
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Müşterilere ürün veya hizmetiniz hakkında detaylı bilgi verin..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-radiant-amber/50 transition-colors resize-none"
                        />
                    </div>
                </div>

                {/* Nova SEO Section */}
                <div className="glass rounded-[40px] border border-white/5 bg-white/[0.02] p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-radiant-amber/10 flex items-center justify-center text-radiant-amber">
                            <Sparkles size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-white">SEO & Meta (Nova)</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">Meta Açıklama</label>
                            <textarea
                                name="meta_description"
                                rows={3}
                                value={form.meta_description}
                                onChange={e => setForm({ ...form, meta_description: e.target.value })}
                                placeholder="SEO için kısa açıklama..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-radiant-amber/50 transition-colors resize-none"
                            />
                            <p className="text-[9px] text-white/20 mt-1 px-2 text-right">{form.meta_description.length}/160</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">Etiketler</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                <input
                                    name="tags"
                                    type="text"
                                    value={form.tags}
                                    onChange={e => setForm({ ...form, tags: e.target.value })}
                                    placeholder="fütüristik, akıllı, montaj..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:border-radiant-amber/50 transition-colors"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2 px-1">
                                {form.tags.split(',').map((tag, i) => tag.trim() && (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] text-white/40 font-black uppercase">
                                        #{tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medya ve Teknik */}
                <div className="glass rounded-[40px] border border-white/5 bg-white/[0.02] p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Upload size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-white">Görsel & Detaylar</h2>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">Görsel URL</label>
                        <input
                            required
                            name="imageUrl"
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-radiant-amber/50 transition-colors"
                        />
                        <p className="text-[10px] text-white/20 mt-1 px-2 italic">Lütfen temsil eden kaliteli bir görsel bağlantısı yapıştırın.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">Watt Değeri (Opsiyonel)</label>
                            <input
                                name="wattage"
                                type="number"
                                placeholder="0"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-radiant-amber/50 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">Lümen Değeri (Opsiyonel)</label>
                            <input
                                name="lumens"
                                type="number"
                                placeholder="0"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-radiant-amber/50 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pb-12">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-4 rounded-2xl border border-white/10 text-white font-black text-sm hover:bg-white/5 transition-all"
                    >
                        Vazgeç
                    </button>
                    <button
                        disabled={isSubmitting || isNovaLoading}
                        type="submit"
                        className="px-10 py-4 rounded-2xl bg-radiant-amber text-cosmic-blue font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-glow flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-cosmic-blue border-t-transparent rounded-full animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Yayına Gönder
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
