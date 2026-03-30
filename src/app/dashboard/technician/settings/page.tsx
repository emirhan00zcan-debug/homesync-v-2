"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Settings, ToggleLeft, ToggleRight, Save, Loader2, User, Mail, Phone, Users, Calendar } from 'lucide-react';

interface Profile {
    full_name: string;
    phone: string;
    bio: string;
    is_available: boolean;
    gender: string;
    birth_date: string;
}

export default function TechnicianSettingsPage() {
    const { user } = useAuth();
    const supabase = createClient();
    const { success, error } = useToast();

    const [profile, setProfile] = useState<Profile>({
        full_name: '',
        phone: '',
        bio: '',
        is_available: true,
        gender: '',
        birth_date: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        async function load() {
            const { data } = await supabase
                .from('profiles')
                .select('full_name, phone, bio, is_available, gender, birth_date')
                .eq('id', user!.id)
                .single();
            if (data) {
                setProfile({
                    full_name: data.full_name ?? '',
                    phone: data.phone ?? '',
                    bio: data.bio ?? '',
                    is_available: data.is_available ?? true,
                    gender: data.gender ?? '',
                    birth_date: data.birth_date ?? '',
                });
            }
            setLoading(false);
        }
        load();
    }, [user?.id]);

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        const { error: err } = await supabase
            .from('profiles')
            .update({
                full_name: profile.full_name,
                phone: profile.phone,
                bio: profile.bio,
                is_available: profile.is_available,
                gender: profile.gender || null,
                birth_date: profile.birth_date || null,
            })
            .eq('id', user.id);

        if (err) error('Güncellenemedi: ' + err.message);
        else success('Profil güncellendi!');
        setSaving(false);
    };

    const inputClass = `w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm
        placeholder:text-white/20 focus:outline-none focus:border-orange-400/50 focus:bg-white/8 transition-all duration-300`;

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-2xl mx-auto">
            {/* Header */}
            <div>
                <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest mb-1">Hesap Yönetimi</p>
                <h1 className="text-2xl font-black text-white">Ayarlar</h1>
                <p className="text-sm text-white/40 mt-1">Müsaitlik durumunu ve profil bilgilerini yönet.</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-12 rounded-xl animate-pulse bg-white/5" />
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Availability Toggle */}
                    <div className="rounded-3xl border border-white/10 p-6"
                        style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-white">Müsaitlik Durumu</p>
                                <p className="text-xs text-white/40 mt-0.5">
                                    {profile.is_available ? '✅ Yeni görev kabul ediyorsun' : '⏸️ Şu an görev almıyorsun'}
                                </p>
                            </div>
                            <button
                                onClick={() => setProfile((p) => ({ ...p, is_available: !p.is_available }))}
                                className="transition-all duration-300 hover:scale-110"
                            >
                                {profile.is_available
                                    ? <ToggleRight size={44} className="text-orange-400" />
                                    : <ToggleLeft size={44} className="text-white/20" />
                                }
                            </button>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="rounded-3xl border border-white/10 p-6 space-y-4"
                        style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                            <User size={13} /> Profil Bilgileri
                        </h3>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Ad Soyad</label>
                            <div className="relative">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                <input
                                    className={`${inputClass} pl-9`}
                                    value={profile.full_name}
                                    onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                                    placeholder="Ad Soyad"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">E-posta</label>
                            <div className="relative">
                                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                <input
                                    className={`${inputClass} pl-9 opacity-50 cursor-not-allowed`}
                                    value={user?.email || ''}
                                    disabled
                                    placeholder="E-posta"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Telefon</label>
                            <div className="relative">
                                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                <input
                                    className={`${inputClass} pl-9`}
                                    value={profile.phone}
                                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                                    placeholder="+90 5__ ___ __ __"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Cinsiyet</label>
                            <div className="relative">
                                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 z-10 pointer-events-none" />
                                <select
                                    className={`${inputClass} pl-9 appearance-none cursor-pointer`}
                                    value={profile.gender}
                                    onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}
                                >
                                    <option value="" className="bg-[#0A192F]">Belirtmek İstemiyorum</option>
                                    <option value="MALE" className="bg-[#0A192F]">Erkek</option>
                                    <option value="FEMALE" className="bg-[#0A192F]">Kadın</option>
                                    <option value="OTHER" className="bg-[#0A192F]">Diğer</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Doğum Tarihi</label>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 z-10 pointer-events-none" />
                                <input
                                    type="date"
                                    className={`${inputClass} pl-9 [color-scheme:dark]`}
                                    value={profile.birth_date}
                                    onChange={(e) => setProfile((p) => ({ ...p, birth_date: e.target.value }))}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Hakkımda / Uzmanlık</label>
                            <textarea
                                className={`${inputClass} resize-none min-h-[100px]`}
                                value={profile.bio}
                                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                                placeholder="Uzmanlık alanlarını ve deneyimlerini kısaca anlat..."
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Save */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] disabled:opacity-70"
                        style={{ background: 'linear-gradient(135deg, #FFBF00, #f59e0b)', color: '#0A192F' }}
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>
            )}
        </div>
    );
}
