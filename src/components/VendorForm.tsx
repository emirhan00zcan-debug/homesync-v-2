"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Plus,
    Sparkles,
    Zap,
    Trash2,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Hammer,
    Lightbulb,
    DollarSign,
    Layers
} from 'lucide-react';
import { createProduct } from '@/app/actions/seller/product-actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function VendorForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus('IDLE');

        const formData = new FormData(e.currentTarget);
        const result = await createProduct(formData);

        setIsSubmitting(false);
        if (result?.success) {
            setStatus('SUCCESS');
            e.currentTarget.reset();
            // Give user a moment to see the success toast, then call parent
            setTimeout(() => {
                setStatus('IDLE');
                onSuccess?.();
            }, 2000);
        } else {
            setStatus('ERROR');
            setErrorMessage(result?.error || 'Bir hata oluştu.');
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border border-radiant-amber/30 shadow-glow">
                        <Plus className="text-radiant-amber" size={24} />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Yeni Ürün Ekle</h2>
                </div>
                <p className="text-white/40 text-sm max-w-lg leading-relaxed">
                    Koleksiyonunuza yeni bir başyapıt ekleyin. Teknik detayları ve estetik özellikleri profesyonelce belirtin.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left Column: Essential Details */}
                    <div className="space-y-8">
                        <div className="glass p-8 rounded-[40px] border border-white/5 bg-white/[0.01] space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-radiant-amber mb-6">Temel Bilgiler</h3>

                            <Input
                                label="Ürün Adı"
                                name="name"
                                required
                                placeholder="Örn: Aura Kristal Avize"
                                className="rounded-[24px] py-4 h-auto px-6"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Fiyat (₺)"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="24999"
                                    icon={<DollarSign size={16} />}
                                    className="rounded-[24px] py-4 h-auto"
                                />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Montaj Zorluğu</label>
                                    <div className="relative">
                                        <Hammer className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                        <select
                                            name="difficulty"
                                            className="w-full bg-white/5 border border-white/10 rounded-[24px] py-4 pl-12 pr-6 text-white/60 focus:outline-none focus:border-radiant-amber/40 transition-all font-medium appearance-none"
                                        >
                                            <option value="EASY">Kolay</option>
                                            <option value="MEDIUM">Orta</option>
                                            <option value="HARD">Zor</option>
                                            <option value="EXPERT">Uzman</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass p-8 rounded-[40px] border border-white/5 bg-white/[0.01] space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-radiant-amber mb-6">Teknik Detaylar</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Işık Gücü (Lümen)"
                                    name="lumens"
                                    type="number"
                                    required
                                    placeholder="4500"
                                    icon={<Lightbulb size={16} />}
                                    className="rounded-[24px] py-4 h-auto"
                                />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Kategori</label>
                                    <div className="relative">
                                        <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                        <select
                                            name="category"
                                            className="w-full bg-white/5 border border-white/10 rounded-[24px] py-4 pl-12 pr-6 text-white/60 focus:outline-none focus:border-radiant-amber/40 transition-all font-medium appearance-none"
                                        >
                                            <option value="chandeliers">Avize</option>
                                            <option value="smart">Akıllı Aydınlatma</option>
                                            <option value="outdoor">Dış Mekan</option>
                                            <option value="minimalist">Minimalist</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visuals & Description */}
                    <div className="space-y-8">
                        <div className="glass p-8 rounded-[40px] border border-white/5 bg-white/[0.01] h-fit">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-radiant-amber mb-6">Medya & Açıklama</h3>

                            <div className="space-y-6">
                                <div className="aspect-video rounded-[32px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-8 text-center group hover:border-radiant-amber/30 transition-all cursor-pointer relative overflow-hidden">
                                    <Upload className="text-white/20 mb-4 group-hover:text-radiant-amber transition-colors" size={40} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Ürün Görseli Yükle</p>
                                    <p className="text-[8px] text-white/10 mt-2">PNG, JPG veya WebP (Max 5MB)</p>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Ürün Tanımı</label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        placeholder="Ürünün hikayesini ve mimari etkisini anlatın..."
                                        className="w-full bg-white/5 border border-white/10 rounded-[24px] py-4 px-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium placeholder:text-white/5 resize-none custom-scrollbar"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                isLoading={isSubmitting}
                                className="w-full py-6 bg-radiant-amber text-cosmic-blue font-black rounded-[32px] hover:shadow-glow uppercase text-[11px] tracking-[0.4em] gap-3"
                            >
                                {!isSubmitting && (
                                    <>
                                        Ürünü Yayınla <Zap size={20} />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Status Notifications */}
            <AnimatePresence>
                {status !== 'IDLE' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-5 rounded-[24px] flex items-center gap-4 border shadow-2xl z-50 ${status === 'SUCCESS' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-500'
                            }`}
                    >
                        {status === 'SUCCESS' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest">
                                {status === 'SUCCESS' ? 'BAŞARILI' : 'HATA'}
                            </p>
                            <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold mt-1">
                                {status === 'SUCCESS' ? 'Ürün başarıyla kataloğa eklendi.' : errorMessage}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
