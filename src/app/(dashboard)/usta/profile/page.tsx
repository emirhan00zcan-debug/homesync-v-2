"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    MapPin,
    Tag,
    Star,
    Phone,
    Mail,
    Edit3,
    Check,
    ChevronRight,
    ShieldCheck,
    LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const SERVICE_CATEGORIES = [
    'Aydınlatma Montajı',
    'Akıllı Kamera Kurulumu',
    'Elektrik Tesisatı',
    'Klima Montajı',
    'Anten & Uydu',
    'Akıllı Kilit',
    'Ev Otomasyon',
    'Solar Panel',
];

const SERVICE_DISTRICTS = [
    'Ataşehir', 'Kadıköy', 'Üsküdar', 'Maltepe', 'Kartal',
    'Pendik', 'Tuzla', 'Beşiktaş', 'Şişli', 'Bakırköy', 'Beyoğlu',
];

export default function UstaProfilePage() {
    const { user, logout } = useAuth();

    const [selectedCategories, setSelectedCategories] = useState<string[]>([
        'Aydınlatma Montajı', 'Akıllı Kamera Kurulumu'
    ]);
    const [selectedDistricts, setSelectedDistricts] = useState<string[]>([
        'Ataşehir', 'Kadıköy', 'Üsküdar'
    ]);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
        setSaveStatus('idle');
    };

    const toggleDistrict = (district: string) => {
        setSelectedDistricts(prev =>
            prev.includes(district) ? prev.filter(d => d !== district) : [...prev, district]
        );
        setSaveStatus('idle');
    };

    const handleSave = async () => {
        setSaveStatus('saving');
        // TODO: Supabase update call
        await new Promise(r => setTimeout(r, 800));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    return (
        <div className="p-5 md:p-8 space-y-8 max-w-2xl mx-auto">
            {/* ── Header ──────────────────────────────────────────────── */}
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <p className="text-orange-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-1.5">
                    Hesap Yönetimi
                </p>
                <h1 className="text-3xl font-black text-white">Profilim</h1>
            </motion.header>

            {/* ── Profile Card ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="glass p-6 rounded-3xl border border-white/10 bg-white/5 flex items-center gap-5"
            >
                <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center font-black text-cosmic-blue text-2xl">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-cosmic-blue" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="text-white font-black text-lg truncate">{user?.name || 'Usta Adı'}</h2>
                        <ShieldCheck size={14} className="text-orange-400 shrink-0" />
                    </div>
                    <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
                        <Mail size={11} />
                        <span className="truncate">{user?.email || 'email@example.com'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                        <Star size={11} fill="currentColor" />
                        Sertifikalı Kurulum Uzmanı
                    </div>
                </div>
                <button className="shrink-0 w-9 h-9 glass rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-orange-400/30 transition-all">
                    <Edit3 size={15} />
                </button>
            </motion.div>

            {/* ── Contact Info ─────────────────────────────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
            >
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/30">İletişim Bilgileri</h2>
                <div className="space-y-2">
                    {[
                        { icon: Mail, label: 'E-posta', value: user?.email || '—' },
                        { icon: Phone, label: 'Telefon', value: '— (Ekle)' },
                    ].map((item, i) => (
                        <div key={i} className="glass flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-orange-400/10 flex items-center justify-center">
                                    <item.icon size={15} className="text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{item.label}</p>
                                    <p className="text-white text-sm font-bold">{item.value}</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-white/20" />
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* ── Service Categories ───────────────────────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-3"
            >
                <div className="flex items-center gap-2">
                    <Tag size={13} className="text-white/30" />
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                        Hizmet Kategorilerim
                    </h2>
                    <span className="ml-auto text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-lg">
                        {selectedCategories.length} seçili
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {SERVICE_CATEGORIES.map((cat) => {
                        const active = selectedCategories.includes(cat);
                        return (
                            <button
                                key={cat}
                                onClick={() => toggleCategory(cat)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${active
                                    ? 'bg-orange-400 text-cosmic-blue shadow-sm'
                                    : 'bg-white/5 border border-white/10 text-white/50 hover:border-orange-400/30 hover:text-white'
                                    }`}
                            >
                                {active && <Check size={11} />}
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </motion.section>

            {/* ── Service Districts ────────────────────────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
            >
                <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-white/30" />
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                        Hizmet Verdiğim Bölgeler
                    </h2>
                    <span className="ml-auto text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-lg">
                        {selectedDistricts.length} ilçe
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {SERVICE_DISTRICTS.map((district) => {
                        const active = selectedDistricts.includes(district);
                        return (
                            <button
                                key={district}
                                onClick={() => toggleDistrict(district)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${active
                                    ? 'bg-orange-400/20 border border-orange-400/50 text-orange-400'
                                    : 'bg-white/5 border border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                                    }`}
                            >
                                {active && <Check size={11} />}
                                {district}
                            </button>
                        );
                    })}
                </div>
            </motion.section>

            {/* ── Save Button ──────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="pb-4 space-y-3"
            >
                <button
                    onClick={handleSave}
                    disabled={saveStatus !== 'idle'}
                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${saveStatus === 'saved'
                        ? 'bg-green-400 text-cosmic-blue'
                        : 'bg-orange-400 hover:bg-orange-500 active:scale-[0.98] text-cosmic-blue'
                        }`}
                >
                    {saveStatus === 'saving' && (
                        <div className="w-4 h-4 border-2 border-cosmic-blue border-t-transparent rounded-full animate-spin" />
                    )}
                    {saveStatus === 'saved' && <Check size={16} />}
                    {saveStatus === 'idle' && 'Değişiklikleri Kaydet'}
                    {saveStatus === 'saving' && 'Kaydediliyor...'}
                    {saveStatus === 'saved' && 'Kaydedildi!'}
                </button>

                <button
                    onClick={logout}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm text-red-400 bg-red-400/5 border border-red-400/20 hover:bg-red-400/10 transition-all flex items-center justify-center gap-2"
                >
                    <LogOut size={16} />
                    Çıkış Yap
                </button>
            </motion.div>
        </div>
    );
}
