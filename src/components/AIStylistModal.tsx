"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeEffect } from '@/context/ThemeContext';
import { X, Upload, CheckCircle2, Sparkles, MoveRight, Image as ImageIcon } from 'lucide-react';
import { Product } from '@/types';

interface AIStylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
}

interface AnalysisResult {
    package_name?: string;
    style: string;
    colors: string[];
    recommended_keywords: string[];
    description: string;
}

const AIStylistModal = ({ isOpen, onClose, products }: AIStylistModalProps) => {
    const { isLightOn } = useThemeEffect();
    const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload');
    const [progress, setProgress] = useState(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 'analyzing') {
            interval = setInterval(() => {
                setProgress(prev => {
                    // Stop at 90% while waiting for API, unless it's explicitly set to 100
                    if (prev >= 90 && !analysisResult) {
                        return 90;
                    }
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setStep('result'), 500);
                        return 100;
                    }
                    return prev + 1.5;
                });
            }, 50);
        }
        return () => clearInterval(interval);
    }, [step, analysisResult]);

    const handleFile = async (file: File) => {
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')) {
            if (file.size <= 10 * 1024 * 1024) {
                const imageUrl = URL.createObjectURL(file);
                setSelectedImage(imageUrl);
                setStep('analyzing');
                setProgress(0);
                setError(null);
                setAnalysisResult(null);

                const formData = new FormData();
                formData.append('image', file);

                try {
                    const response = await fetch('/api/ai-stylist', {
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || 'Analiz sırasında hata oluştu.');
                    }

                    if (data.analysis) {
                        setAnalysisResult(data.analysis);
                        setProgress(100);
                    }
                } catch (err: any) {
                    setError(err.message || 'Bilinmeyen bir hata oluştu');
                    setStep('upload'); // Go back to avoid getting stuck
                    alert(err.message || 'Analiz başarısız oldu.');
                }
            } else {
                alert("Dosya boyutu 10MB'dan küçük olmalıdır.");
            }
        } else {
            alert('Lütfen sadece JPG, PNG veya WEBP formatında resim yükleyin.');
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const reset = () => {
        setStep('upload');
        setProgress(0);
        setSelectedImage(null);
        setAnalysisResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    };

    // Derived filtered products
    const recommendedProducts = React.useMemo(() => {
        if (!analysisResult) return products.slice(0, 3);
        
        const keywords = analysisResult.recommended_keywords.map(k => k.toLowerCase());
        const filtered = products.filter(p => {
             const nameLower = p.name.toLowerCase();
             // Simple keyword matching against product name
             return keywords.some(k => nameLower.includes(k) || (p.category?.toLowerCase() || '').includes(k));
        });

        // Fallback if no exact match found
        return filtered.length > 0 ? filtered.slice(0, 3) : products.slice(0, 3);
    }, [products, analysisResult]);

    const totalPrice = recommendedProducts.reduce((sum, p) => sum + p.price, 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={reset}
                        className="absolute inset-0 bg-cosmic-blue/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className={`relative w-full max-w-2xl overflow-hidden rounded-[2rem] border backdrop-blur-2xl shadow-2xl ${isLightOn
                            ? 'bg-white/80 border-black/5 text-cosmic-blue'
                            : 'bg-cosmic-blue/80 border-white/10 text-ivory-white'
                            }`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-8 border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-radiant-amber/20 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-radiant-amber" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-widest">Yapay Zeka Stilisti</h2>
                                    <p className="text-[10px] uppercase tracking-widest opacity-40">Mekan Analizi ve Tasarım</p>
                                </div>
                            </div>
                            <button
                                onClick={reset}
                                className="p-2 rounded-full hover:bg-white/5 transition-colors"
                            >
                                <X className="w-6 h-6 opacity-40" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                            {step === 'upload' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="w-full space-y-8"
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileInput} 
                                        accept="image/jpeg, image/png, image/webp" 
                                        className="hidden" 
                                    />
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`group cursor-pointer border-2 border-dashed rounded-3xl p-12 transition-all duration-500 flex flex-col items-center gap-6 ${
                                            isDragging 
                                                ? 'border-radiant-amber bg-radiant-amber/10 scale-105' 
                                                : isLightOn
                                                    ? 'border-cosmic-blue/10 hover:border-radiant-amber hover:bg-radiant-amber/5'
                                                    : 'border-white/10 hover:border-radiant-amber hover:bg-radiant-amber/5'
                                        }`}
                                    >
                                        <div className="w-20 h-20 rounded-full bg-radiant-amber/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <Upload className={`w-8 h-8 text-radiant-amber transition-transform duration-300 ${isDragging ? 'animate-bounce' : ''}`} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-bold">{isDragging ? 'Fotoğrafı Buraya Bırakın' : 'Odanızın Fotoğrafını Yükleyin'}</h3>
                                            <p className="text-sm opacity-50 max-w-sm mx-auto">Gemini Vision AI, mekanın geometrisini ve stilini analiz ederek en uygun ürünleri önerecek.</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-30">Desteklenen formatlar: JPG, PNG, WEBP • Max 10MB</p>
                                </motion.div>
                            )}

                            {step === 'analyzing' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="w-full space-y-12"
                                >
                                    <div className="relative">
                                        <div className={`w-64 h-40 mx-auto rounded-2xl overflow-hidden relative border border-white/10 bg-center bg-cover bg-no-repeat shadow-xl`} style={{ backgroundImage: selectedImage ? `url(${selectedImage})` : 'none', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                            <motion.div
                                                animate={{ top: ['0%', '100%', '0%'] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="absolute left-0 right-0 h-1 bg-radiant-amber shadow-[0_0_15px_#FFBF00] z-10"
                                            />
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold uppercase tracking-widest animate-pulse">
                                            {progress >= 90 && !analysisResult ? 'Büyük Veri İşleniyor...' : 'Vision AI Analiz Ediyor...'}
                                        </h3>
                                        <div className="w-full max-w-xs mx-auto h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className="h-full bg-radiant-amber shadow-[0_0_10px_#FFBF00] transition-all duration-300"
                                            />
                                        </div>
                                        <p className="text-xs opacity-40 uppercase tracking-widest">
                                            {progress < 30 ? 'Işık parametreleri' : progress < 60 ? 'Mekan geometrisi' : progress < 80 ? 'Stil ve form tespiti' : 'Modeller eşleştiriliyor'}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'result' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full space-y-6"
                                >
                                    {/* AI Package Banner */}
                                    <div className={`p-6 rounded-2xl border-2 border-radiant-amber/30 bg-radiant-amber/5 relative overflow-hidden text-left`}>
                                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-radiant-amber/20 rounded-full blur-2xl"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sparkles className="w-5 h-5 text-radiant-amber" />
                                                <span className="text-xs font-black uppercase tracking-widest text-radiant-amber">
                                                    Yapay Zeka Önerisi
                                                </span>
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">
                                                {analysisResult?.package_name || 'Kozmik Uyum Paketi'}
                                            </h3>
                                            
                                            {analysisResult && (
                                                <div className="space-y-3">
                                                    <div className="flex gap-2 flex-wrap items-center">
                                                        <span className={`text-[10px] uppercase font-bold border px-2 py-1 rounded-md ${isLightOn ? 'border-black/10' : 'border-white/10'}`}>
                                                            STİL: {analysisResult.style}
                                                        </span>
                                                        {analysisResult.colors.map((c, i) => (
                                                            <span key={i} className={`text-[10px] uppercase opacity-70 border px-2 py-1 rounded-md ${isLightOn ? 'border-black/5' : 'border-white/5'}`}>{c}</span>
                                                        ))}
                                                    </div>
                                                    <p className="text-sm opacity-80 leading-relaxed italic border-l-2 border-radiant-amber pl-3">
                                                        "{analysisResult.description}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Package Contents */}
                                    <div className="space-y-4 text-left">
                                        <h4 className="text-xs font-black uppercase tracking-widest opacity-50">Paket İçeriği</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {recommendedProducts.map((product, idx) => (
                                                <div key={product.id} className={`p-4 rounded-xl border transition-all hover:border-radiant-amber flex flex-col justify-between ${isLightOn ? 'bg-black/5 border-black/5' : 'bg-white/5 border-white/5'}`}>
                                                    <div>
                                                        <div className="w-full h-24 mb-3 rounded-lg bg-black/10 flex items-center justify-center overflow-hidden">
                                                            {product.imageUrl ? (
                                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <ImageIcon className="w-8 h-8 opacity-20" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-bold leading-tight line-clamp-2" title={product.name}>{product.name}</p>
                                                    </div>
                                                    <div className="mt-3 flex justify-between items-end">
                                                        <span className="text-[10px] opacity-50 truncate max-w-[50%]">{product.category}</span>
                                                        <span className="text-sm font-black text-radiant-amber">{product.price.toLocaleString('tr-TR')}₺</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {recommendedProducts.length === 0 && (
                                                <p className="text-xs opacity-40 col-span-full">Uygun ürün bulunamadı.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Services Included */}
                                    <div className={`p-4 rounded-xl text-left border ${isLightOn ? 'bg-black/5 border-black/5' : 'bg-white/5 border-white/5'}`}>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3">Pakete Dahil Hizmetler</h4>
                                        <ul className="space-y-2">
                                            <li className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                <span>Sertifikalı Ekiplerle <strong>Kurulum Hizmeti</strong></span>
                                            </li>
                                            <li className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                <span><strong>Türkiye İçi Ücretsiz</strong> Tam Sigortalı Teslimat</span>
                                            </li>
                                            <li className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                <span>2 Yıl <strong>Kapsamlı Garanti</strong> ve Bakım Desteği</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Total and CTA */}
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                                        <div className="text-left w-full md:w-auto">
                                            <p className="text-[10px] uppercase tracking-widest opacity-50">Toplam Paket Tutarı</p>
                                            <p className="text-3xl font-black text-radiant-amber">
                                                {totalPrice.toLocaleString('tr-TR')}₺
                                            </p>
                                        </div>
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <button
                                                onClick={reset}
                                                className={`px-6 py-4 rounded-xl text-sm font-bold tracking-wider transition-all border ${isLightOn ? 'border-black/10 hover:bg-black/5' : 'border-white/10 hover:bg-white/5'} w-full md:w-auto`}
                                            >
                                                YENİDEN DENEYİN
                                            </button>
                                            <button
                                                className="px-8 py-4 bg-radiant-amber text-cosmic-blue rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2 w-full md:w-auto shadow-[0_0_20px_#FFBF0040]"
                                                onClick={() => {
                                                    alert("Tüm ürünler ve kurulum paketi başarıyla sepete eklendi!");
                                                    reset();
                                                }}
                                            >
                                                Paketi Sepete Ekle <MoveRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AIStylistModal;
