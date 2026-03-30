"use client";

import React, { useState, useTransition } from 'react';
import { User, Mail, Save, Globe, Store, CheckCircle, AlertCircle, Image as ImageIcon, ShieldCheck, ShieldOff, Phone, Users, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

type StoreData = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    banner_url?: string | null; // ✅ Opsiyonel — server component'tan null gelebilir
    is_active: boolean;
    is_verified: boolean;
} | null;

type ProfileData = {
    full_name: string | null;
    store_id: string | null;
    phone?: string | null;
    gender?: string | null;
    birth_date?: string | null;
} | null;

export default function VendorSettingsClient({
    user,
    profile,
    store,
}: {
    user: any;
    profile: ProfileData;
    store: StoreData;
}) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const { refreshUser } = useAuth();

    // Profile fields
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [gender, setGender] = useState(profile?.gender || '');
    const [birthDate, setBirthDate] = useState(profile?.birth_date || '');

    // Store fields
    const [storeName, setStoreName] = useState(store?.name || '');
    const [storeDescription, setStoreDescription] = useState(store?.description || '');
    const [logoUrl, setLogoUrl] = useState(store?.logo_url || '');
    const [bannerUrl, setBannerUrl] = useState(store?.banner_url || '');
    const [storeSlug, setStoreSlug] = useState(store?.slug || '');

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3500);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: fullName, phone: phone || null, gender: gender || null, birth_date: birthDate || null })
                .eq('id', user.id);

            if (profileError) {
                showMessage('error', 'Profil güncellenirken hata oluştu: ' + profileError.message);
                return;
            }

            await supabase.auth.updateUser({ data: { name: fullName, phone, gender, birth_date: birthDate } });
            await refreshUser();
            showMessage('success', 'Profil bilgileriniz başarıyla güncellendi.');
        });
    };

    const handleSaveStore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!store?.id) return;

        startTransition(async () => {
            const { error } = await supabase
                .from('stores')
                .update({
                    name: storeName,
                    description: storeDescription || null,
                    logo_url: logoUrl || null,
                    banner_url: bannerUrl || null,
                })
                .eq('id', store.id);

            if (error) {
                showMessage('error', 'Mağaza bilgileri güncellenirken hata oluştu: ' + error.message);
            } else {
                showMessage('success', 'Mağaza bilgileriniz başarıyla güncellendi.');
            }
        });
    };

    const handleCreateStore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeName || !storeSlug) {
            showMessage('error', 'Lütfen mağaza adı ve URL bilgisini doldurun.');
            return;
        }

        startTransition(async () => {
            // 1. Create the store
            const { data: newStore, error: storeError } = await supabase
                .from('stores')
                .insert({
                    owner_id: user.id,
                    name: storeName,
                    slug: storeSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                    description: storeDescription || null,
                    logo_url: logoUrl || null,
                    banner_url: bannerUrl || null,
                })
                .select()
                .single();

            if (storeError) {
                showMessage('error', 'Mağaza oluşturulurken hata: ' + storeError.message);
                return;
            }

            // 2. Link store to profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ store_id: newStore.id })
                .eq('id', user.id);

            if (profileError) {
                showMessage('error', 'Profil güncellenirken hata: ' + profileError.message);
            } else {
                showMessage('success', 'Mağazanız başarıyla oluşturuldu! Sayfa yenileniyor...');
                setTimeout(() => window.location.reload(), 1500);
            }
        });
    };

    const generateSlug = (name: string) => {
        const slug = name.toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        setStoreSlug(slug);
    };

    const inputClass = "w-full glass bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-radiant-amber/50 rounded-2xl py-4 px-5 text-white placeholder:text-white/20 focus:outline-none transition-all duration-300 text-sm";
    const labelClass = "block text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2 ml-1";

    return (
        <div className="max-w-3xl mx-auto p-8 lg:p-12 space-y-12">

            {/* Page Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-radiant-amber opacity-80">Satıcı Paneli</p>
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Hesap Ayarları</h1>
                <p className="text-white/40 text-sm mt-3 font-medium">Kişisel bilgilerinizi ve mağaza detaylarınızı buradan yönetin.</p>
            </motion.div>

            {/* Notification Toast */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-bold ${message.type === 'success'
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        : 'border-red-500/20 bg-red-500/10 text-red-400'
                        }`}
                >
                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </motion.div>
            )}

            {/* ─── SECTION 1: Profil Bilgileri ─── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 mb-6 flex items-center gap-3">
                    <User size={14} className="text-radiant-amber" />
                    Kişisel Bilgiler
                    <span className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent ml-2" />
                </h2>
                <form onSubmit={handleSaveProfile} className="glass rounded-[32px] border border-white/5 p-8 space-y-6 bg-white/[0.01]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Ad Soyad</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="Adınız Soyadınız"
                                    className={inputClass + " pl-11"}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>E-posta Adresi</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className={inputClass + " pl-11 opacity-40 cursor-not-allowed"}
                                />
                            </div>
                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-2 ml-1">E-posta adresi değiştirilemez</p>
                        </div>
                        <div>
                            <label className={labelClass}>Telefon Numarası</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+90 (5__) ___ __ __"
                                    className={inputClass + " pl-11"}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Cinsiyet</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 z-10 pointer-events-none" size={16} />
                                <select
                                    value={gender}
                                    onChange={e => setGender(e.target.value)}
                                    className={inputClass + " pl-11 appearance-none cursor-pointer"}
                                >
                                    <option value="" className="bg-[#0A192F]">Belirtmek İstemiyorum</option>
                                    <option value="MALE" className="bg-[#0A192F]">Erkek</option>
                                    <option value="FEMALE" className="bg-[#0A192F]">Kadın</option>
                                    <option value="OTHER" className="bg-[#0A192F]">Diğer</option>
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Doğum Tarihi</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 z-10 pointer-events-none" size={16} />
                                <input
                                    type="date"
                                    value={birthDate}
                                    onChange={e => setBirthDate(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                    className={inputClass + " pl-11 [color-scheme:dark]"}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white transition-all duration-300 disabled:opacity-50"
                        >
                            <Save size={15} />
                            {isPending ? 'Kaydediliyor...' : 'Profili Güncelle'}
                        </button>
                    </div>
                </form>
            </motion.section>

            {/* ─── SECTION 2: Mağaza Bilgileri ─── (only renders if store exists) */}
            {store && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 mb-6 flex items-center gap-3">
                        <Store size={14} className="text-radiant-amber" />
                        Mağaza Bilgileri
                        <span className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent ml-2" />
                    </h2>
                    <form onSubmit={handleSaveStore} className="glass rounded-[32px] border border-white/5 p-8 space-y-6 bg-white/[0.01]">

                        {/* Verification Status — only rendered if status exists */}
                        <div className={`flex items-center gap-4 p-4 rounded-2xl border ${store.is_verified ? 'border-emerald-500/20 bg-emerald-500/[0.05]' : 'border-radiant-amber/20 bg-radiant-amber/[0.05]'}`}>
                            {store.is_verified
                                ? <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                                : <ShieldOff size={20} className="text-radiant-amber shrink-0" />
                            }
                            <div>
                                <p className={`text-xs font-black ${store.is_verified ? 'text-emerald-400' : 'text-radiant-amber'}`}>
                                    {store.is_verified ? 'Mağaza Onaylandı' : 'Onay Bekleniyor'}
                                </p>
                                <p className="text-[10px] text-white/40 font-medium mt-0.5">
                                    {store.is_verified ? 'Mağazanız aktif ve yayında.' : 'Mağazanız henüz yönetici onayı bekliyor.'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Mağaza Adı</label>
                                <input
                                    type="text"
                                    value={storeName}
                                    onChange={e => setStoreName(e.target.value)}
                                    placeholder="Mağazanızın Adı"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Mağaza URL (slug)</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                    <input
                                        type="text"
                                        value={storeSlug}
                                        disabled={!!store}
                                        onChange={e => setStoreSlug(e.target.value)}
                                        placeholder="magaza-adim"
                                        className={inputClass + " pl-11 " + (!!store ? "opacity-40 cursor-not-allowed" : "")}
                                    />
                                </div>
                                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-2 ml-1">
                                    {store ? "Mağaza URL&apos;si değiştirilemez" : "Mağaza URL&apos;si sadece bir kez belirlenebilir"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Afiş (Banner) URL</label>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                        <input
                                            type="url"
                                            value={bannerUrl}
                                            onChange={e => setBannerUrl(e.target.value)}
                                            placeholder="https://..."
                                            className={inputClass + " pl-11"}
                                        />
                                    </div>
                                </div>
                                {bannerUrl && (
                                    <div className="w-24 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                                        <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Mağaza Açıklaması</label>
                            <textarea
                                value={storeDescription}
                                onChange={e => setStoreDescription(e.target.value)}
                                rows={4}
                                placeholder="Mağazanız hakkında müşterilerinize kısa bir açıklama yazın..."
                                className={inputClass + " resize-none"}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Logo URL</label>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                        <input
                                            type="url"
                                            value={logoUrl}
                                            onChange={e => setLogoUrl(e.target.value)}
                                            placeholder="https://..."
                                            className={inputClass + " pl-11"}
                                        />
                                    </div>
                                </div>
                                {/* Logo preview — only shown if URL is entered */}
                                {logoUrl && (
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                                        <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-white/5">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all duration-300 disabled:opacity-50 hover:shadow-glow bg-radiant-amber text-cosmic-blue hover:scale-[1.02]"
                            >
                                <Save size={18} />
                                {isPending ? 'Kaydediliyor...' : 'Mağaza Bilgilerini Kaydet'}
                            </button>
                        </div>
                    </form>
                </motion.section>
            )}

            {/* Prompt when no store exists — allow creation */}
            {!store && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <div className="mb-6">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 flex items-center gap-3">
                            <Store size={14} className="text-radiant-amber" />
                            Mağaza Kurulumu
                            <span className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent ml-2" />
                        </h2>
                        <p className="text-white/40 text-[10px] mt-2 font-medium">Satış yapmaya başlamak için bir mağaza oluşturmanız gerekiyor.</p>
                    </div>

                    <form onSubmit={handleCreateStore} className="glass rounded-[32px] border border-white/5 p-8 space-y-6 bg-white/[0.01]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Mağaza Adı</label>
                                <input
                                    type="text"
                                    value={storeName}
                                    onChange={e => {
                                        setStoreName(e.target.value);
                                        generateSlug(e.target.value);
                                    }}
                                    placeholder="Mağazanızın Adı"
                                    className={inputClass}
                                    required
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Mağaza URL (slug)</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                    <input
                                        type="text"
                                        value={storeSlug}
                                        onChange={e => setStoreSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                        placeholder="magaza-adim"
                                        className={inputClass + " pl-11"}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Mağaza Açıklaması</label>
                            <textarea
                                value={storeDescription}
                                onChange={e => setStoreDescription(e.target.value)}
                                rows={3}
                                placeholder="Mağazanız hakkında kısa bir bilgi..."
                                className={inputClass + " resize-none"}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex items-center gap-3 px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all duration-500 disabled:opacity-50 hover:shadow-glow bg-gradient-to-br from-radiant-amber to-amber-600 text-cosmic-blue hover:scale-[1.05]"
                            >
                                <Store size={20} />
                                {isPending ? 'Oluşturuluyor...' : 'Mağazamı Şimdi Oluştur'}
                            </button>
                        </div>
                    </form>
                </motion.section>
            )}
        </div>
    );
}
