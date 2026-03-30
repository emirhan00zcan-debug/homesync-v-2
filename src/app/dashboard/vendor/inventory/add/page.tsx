"use client";

import React, { useState, useTransition } from 'react';
import { Package, Save, ArrowLeft, Image as ImageIcon, AlertCircle, Sparkles, Hash } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const CATEGORIES = ['Avize', 'LED Şerit', 'Abajur', 'Sconce', 'Spot Işık', 'Akıllı Ampul', 'Endüstriyel', 'Dış Mekan', 'Diğer'];

export default function VendorNewProductPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isNovaLoading, setIsNovaLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stock_count: '',
        category: '',
        image_url: '',
        meta_description: '',
        tags: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNovaGenerate = async () => {
        if (!form.name) {
            setError('Nova\'nın çalışması için en azından bir ürün adı girmelisiniz.');
            return;
        }

        setIsNovaLoading(true);
        setError('');

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setError('');

        if (!form.name || !form.price || !form.stock_count) {
            setError('Ürün adı, fiyat ve stok alanları zorunludur.');
            return;
        }

        startTransition(async () => {
            // Convert tags string to array
            const tagsArray = form.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

            const { error: insertError } = await supabase.from('products').insert({
                vendor_id: user.id,
                name: form.name,
                description: form.description || null,
                price: parseFloat(form.price),
                stock_count: parseInt(form.stock_count),
                category: form.category || null,
                image_url: form.image_url || null,
                meta_description: form.meta_description || null,
                tags: tagsArray.length > 0 ? tagsArray : null,
                is_active: true,
            });

            if (insertError) {
                setError(insertError.message);
            } else {
                setSuccess(true);
                setTimeout(() => router.push('/dashboard/vendor/inventory'), 1500);
            }
        });
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-8 lg:p-12 min-h-[60vh]">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-glow"
                    style={{ background: 'linear-gradient(135deg, rgba(255,191,0,0.2) 0%, transparent 100%)' }}>
                    <Package size={40} className="text-radiant-amber" />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl font-black text-white mb-2 text-center"
                >
                    Ürün Envantere Eklendi!
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/40 text-sm font-medium"
                >
                    Envanter sayfasına yönlendiriliyorsunuz...
                </motion.p>
            </div>
        );
    }

    const fieldClass = "w-full glass bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-radiant-amber/50 rounded-2xl py-4 px-5 text-white placeholder:text-white/20 focus:outline-none transition-all duration-300 text-sm";
    const labelClass = "block text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2 ml-1";

    return (
        <div className="max-w-3xl mx-auto p-8 lg:p-12 space-y-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <button onClick={() => router.back()}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-radiant-amber transition-colors mb-6 group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Geri Dön
                </button>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-radiant-amber opacity-80">Yeni Kayıt</p>
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter flex items-center gap-4">
                    <Package className="text-radiant-amber" size={36} />
                    Ürün Ekle
                </h1>
                <p className="text-white/40 text-sm mt-3 font-medium">Satışa sunmak istediğiniz ürünün detaylarını eksiksiz girin.</p>
            </motion.div>

            {/* Form */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                onSubmit={handleSubmit}
                className="glass rounded-[32px] border border-white/5 p-8 lg:p-10 space-y-8 bg-white/[0.01]"
            >

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <div>
                            <label className={labelClass}>Ürün Adı *</label>
                            <input type="text" name="name" placeholder="örn. Stellar Pendant L-01"
                                value={form.name} onChange={handleChange} className={fieldClass} required />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className={labelClass.replace('mb-2', 'mb-0')}>Açıklama</label>
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
                            <textarea name="description" rows={5} placeholder="Ürün hakkında detaylı bilgi, malzeme detayları..."
                                value={form.description} onChange={handleChange}
                                className={fieldClass + " resize-none"} />
                        </div>

                        <div>
                            <label className={labelClass}>Kategori</label>
                            <select name="category" value={form.category} onChange={handleChange}
                                className={fieldClass + " cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.5)%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[position:calc(100%-20px)_center] bg-no-repeat pr-12"}>
                                <option value="" className="bg-cosmic-blue text-white">Kategori Seçiniz</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat} className="bg-cosmic-blue text-white">{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02]">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
                                <ImageIcon size={14} /> Ürün Görseli
                            </h3>
                            <div>
                                <label className={labelClass}>Görsel URL</label>
                                <input type="url" name="image_url" placeholder="https://..."
                                    value={form.image_url} onChange={handleChange} className={fieldClass} />
                                {form.image_url ? (
                                    <div className="mt-4 aspect-square rounded-2xl overflow-hidden border border-white/10 relative group">
                                        <img src={form.image_url} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    </div>
                                ) : (
                                    <div className="mt-4 aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/20 p-6 text-center">
                                        <ImageIcon size={32} className="mb-3 opacity-50" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Görsel URL&apos;si girin</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Fiyat (₺) *</label>
                                <input type="number" name="price" placeholder="0.00"
                                    value={form.price} onChange={handleChange} className={fieldClass}
                                    min="0" step="0.01" required />
                            </div>
                            <div>
                                <label className={labelClass}>Stok Adedi *</label>
                                <input type="number" name="stock_count" placeholder="0"
                                    value={form.stock_count} onChange={handleChange} className={fieldClass}
                                    min="0" required />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nova SEO Section */}
                <div className="pt-8 border-t border-white/5 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-radiant-amber/10 flex items-center justify-center text-radiant-amber">
                            <Sparkles size={16} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">SEO & Meta (Nova)</h3>
                            <p className="text-[10px] text-white/30 font-medium">Nova tarafından optimize edilen arama motoru verileri.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={labelClass}>Meta Açıklama (160 Karakter)</label>
                            <textarea name="meta_description" rows={3} placeholder="Arama motorlarında görünecek kısa açıklama..."
                                value={form.meta_description} onChange={handleChange}
                                className={fieldClass + " resize-none"} />
                            <p className="text-[9px] text-white/20 mt-2 text-right">{form.meta_description.length}/160</p>
                        </div>
                        <div>
                            <label className={labelClass}>Etiketler (Virgül ile ayırın)</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                <input type="text" name="tags" placeholder="fütüristik, aydınlatma, akıllı..."
                                    value={form.tags} onChange={handleChange} className={fieldClass + " pl-10"} />
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {form.tags.split(',').map((tag, i) => tag.trim() && (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] text-white/40 font-bold uppercase">
                                        #{tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-medium">
                        <AlertCircle size={16} className="shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="pt-6 border-t border-white/5 flex justify-end">
                    <button
                        type="submit"
                        disabled={isPending || isNovaLoading}
                        className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all duration-300 disabled:opacity-50 hover:shadow-glow bg-radiant-amber text-cosmic-blue hover:scale-[1.02]"
                    >
                        <Save size={18} />
                        {isPending ? 'Kaydediliyor...' : 'Ürünü Envantere Ekle'}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
