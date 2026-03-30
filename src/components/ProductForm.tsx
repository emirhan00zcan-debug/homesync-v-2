"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tag,
    TurkishLira,
    ImageIcon,
    Zap,
    Type,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ProductFormProps {
    onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
    isSubmitting: boolean;
}

export default function ProductForm({ onSubmit, isSubmitting }: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        imageUrl: '',
        lumens: '',
        difficulty: ''
    });

    const [isValid, setIsValid] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        const { name, price, description, imageUrl, lumens, difficulty } = formData;
        const allFilled = name.trim() !== '' &&
            price.trim() !== '' &&
            description.trim() !== '' &&
            imageUrl.trim() !== '' &&
            lumens.trim() !== '' &&
            difficulty !== '';
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setIsValid(allFilled);

        // Basic detection for preview
        setShowPreview(imageUrl.startsWith('http') && (imageUrl.includes('.') || imageUrl.includes('images.unsplash.com')));
    }, [formData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isValid || isSubmitting) return;

        const data = new FormData(e.currentTarget);
        await onSubmit(data);
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-10">
            {/* Photo Previewer */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="overflow-hidden"
                    >
                        <div className="relative aspect-video rounded-[32px] overflow-hidden border border-white/10 mb-8 glass group">
                            <img
                                src={formData.imageUrl}
                                alt="Ürün Önizleme"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                onError={() => setShowPreview(false)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-cosmic-blue/80 via-transparent to-transparent flex items-end p-8">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Görsel Önizleme Aktif</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Product Name */}
                <div className="space-y-3">
                    <Input
                        label="Ürün Adı"
                        icon={<Type size={12} />}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Ürün Adı Giriniz"
                        className="rounded-full py-5 px-8 h-auto font-bold"
                    />
                </div>

                {/* Sell Price */}
                <div className="space-y-3">
                    <Input
                        label="Satış Fiyatı"
                        icon={<TurkishLira size={12} />}
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        placeholder="Fiyat Değeri Giriniz (Sayı)"
                        className="rounded-full py-5 px-8 h-auto font-bold"
                    />
                </div>

                {/* Image URL */}
                <div className="space-y-3">
                    <Input
                        label="Ürün Fotoğraf Linki"
                        icon={<ImageIcon size={12} />}
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        required
                        placeholder="Görsel URL Bağlantısını Buraya Yapıştırın"
                        className="rounded-full py-5 px-8 h-auto font-bold"
                    />
                </div>

                {/* Lumens */}
                <div className="space-y-3">
                    <Input
                        label="Işık Gücü (Lümen)"
                        icon={<Zap size={12} />}
                        name="lumens"
                        type="number"
                        value={formData.lumens}
                        onChange={handleChange}
                        required
                        placeholder="Lümen Değeri Giriniz (Sayı)"
                        className="rounded-full py-5 px-8 h-auto font-bold"
                    />
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-4 flex items-center gap-2">
                        <Tag size={12} /> Montaj Zorluğu
                    </label>
                    <div className="relative">
                        <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-full py-5 px-8 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-bold appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-cosmic-blue">Zorluk Seçiniz</option>
                            <option value="EASY" className="bg-cosmic-blue">Easy - Kolay</option>
                            <option value="MEDIUM" className="bg-cosmic-blue">Medium - Orta</option>
                            <option value="HARD" className="bg-cosmic-blue">Hard - Zor</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <ArrowRight size={16} className="rotate-90" />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-3 md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-4 flex items-center gap-2">
                        <TextQuote size={12} /> Ürün Açıklaması
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="Ürün Detaylarını Buraya Yazınız"
                        className="w-full bg-white/5 border border-white/10 rounded-[32px] py-6 px-8 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium min-h-[120px]"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
                <Button
                    type="submit"
                    disabled={!isValid}
                    isLoading={isSubmitting}
                    className={`w-full py-8 font-black rounded-full uppercase text-xs tracking-[0.4em] transition-all duration-500 overflow-hidden relative group h-auto ${isValid && !isSubmitting
                        ? 'bg-radiant-amber text-cosmic-blue shadow-glow scale-100 opacity-100'
                        : 'bg-white/5 text-white/20 border border-white/10 scale-95 opacity-50 cursor-not-allowed'
                        }`}
                >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        {!isSubmitting && (
                            <>Ürünü Gönder <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </span>

                    {/* Hover Effect */}
                    {isValid && !isSubmitting && (
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                    )}
                </Button>
            </div>
        </form>
    );
}

const TextQuote = ({ size, className }: { size?: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v3c0 1.25.75 2 2 2h3c0 4-4 6-4 6" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v3c0 1.25.75 2 2 2h3c0 4-4 6-4 6" />
    </svg>
);
