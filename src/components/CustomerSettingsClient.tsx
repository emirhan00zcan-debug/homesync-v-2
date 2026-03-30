"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, ShieldCheck, Save, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface Profile {
    full_name?: string | null;
    phone?: string | null;
    gender?: string | null;
    birth_date?: string | null;
    bio?: string | null;
}

export default function CustomerSettingsClient({
    user,
    profile: initialProfile,
}: {
    user: any;
    profile?: Profile | null;
}) {
    const [name, setName] = useState(initialProfile?.full_name || user?.user_metadata?.full_name || '');
    const [phone, setPhone] = useState(initialProfile?.phone || user?.user_metadata?.phone || '');
    const [gender, setGender] = useState(initialProfile?.gender || '');
    const [birthDate, setBirthDate] = useState(initialProfile?.birth_date || '');
    const [bio, setBio] = useState(initialProfile?.bio || '');
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState('');
    const { refreshUser } = useAuth();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setMessage('');

        const supabase = createClient();

        try {
            // 1) Update auth user metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: { name, phone, gender, birth_date: birthDate }
            });
            if (authError) throw authError;

            // 2) Update profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: name, phone, gender, birth_date: birthDate || null, bio })
                .eq('id', user.id);
            if (profileError) throw profileError;

            // 3) Refresh AuthContext so navbar shows updated name
            await refreshUser();

            setMessage('Profiliniz başarıyla güncellendi.');
        } catch (error: any) {
            setMessage('Hata: ' + error.message);
        } finally {
            setIsPending(false);
            setTimeout(() => setMessage(''), 4000);
        }
    };

    const inputCls = "w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium placeholder:text-white/10";
    const labelCls = "text-[10px] font-black uppercase tracking-widest text-white/30 ml-4 block mb-2";

    return (
        <div className="p-8 lg:p-12">
            <header className="mb-12">
                <p className="text-radiant-amber text-[10px] font-black uppercase tracking-[0.4em] mb-3">Profil Ayarları</p>
                <h1 className="text-5xl font-black text-white tracking-tighter">Kişisel Bilgiler</h1>
                <p className="text-white/40 text-sm mt-4 tracking-wide max-w-lg">
                    HomeSync deneyiminizi kişiselleştirin ve hesap tercihlerinizi yönetin.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass p-8 rounded-[40px] border border-white/5 bg-white/[0.02]">
                        <form onSubmit={handleSave} className="space-y-6">

                            {/* Name & Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelCls}>Ad Soyad</label>
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-radiant-amber transition-colors" size={20} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Adınız ve Soyadınız"
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>E-posta Adresi</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 transition-colors" size={20} />
                                        <input
                                            type="email"
                                            value={user?.email}
                                            disabled
                                            className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white/50 cursor-not-allowed font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Phone & Gender */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelCls}>Telefon Numarası</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-radiant-amber transition-colors" size={20} />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+90 (5__) ___ __ __"
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Cinsiyet</label>
                                    <div className="relative group">
                                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-radiant-amber transition-colors z-10 pointer-events-none" size={20} />
                                        <select
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-[#0A192F]">Belirtmek İstemiyorum</option>
                                            <option value="MALE" className="bg-[#0A192F]">Erkek</option>
                                            <option value="FEMALE" className="bg-[#0A192F]">Kadın</option>
                                            <option value="OTHER" className="bg-[#0A192F]">Diğer</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Birthdate */}
                            <div>
                                <label className={labelCls}>Doğum Tarihi</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-radiant-amber transition-colors z-10 pointer-events-none" size={20} />
                                    <input
                                        type="date"
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className={labelCls}>Hakkımda (İsteğe Bağlı)</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    placeholder="Kendinizi kısaca tanıtın..."
                                    className="w-full bg-white/5 border border-white/10 rounded-[32px] py-5 px-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium placeholder:text-white/10 resize-none"
                                />
                            </div>

                            {/* Message */}
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-center ${message.includes('Hata') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}
                                >
                                    {message}
                                </motion.div>
                            )}

                            <div className="pt-4 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-8 py-5 bg-radiant-amber text-cosmic-blue font-black rounded-[24px] hover:shadow-glow active:scale-[0.98] transition-all duration-500 uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isPending ? (
                                        <div className="w-5 h-5 border-2 border-cosmic-blue border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Değişiklikleri Kaydet
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Security Card */}
                <div className="space-y-6">
                    <div className="glass p-8 rounded-[40px] border border-radiant-amber/10 bg-radiant-amber/[0.02] flex flex-col justify-center items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-radiant-amber/10 flex items-center justify-center mb-6">
                            <ShieldCheck className="text-radiant-amber" size={40} />
                        </div>
                        <h5 className="text-xl font-bold text-white mb-2">Güvenli Hesap</h5>
                        <p className="text-sm text-white/40 leading-relaxed italic mb-4">
                            Hesabınız HomeSync güvenlik standartları ile korunmaktadır.
                        </p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/20">
                            Son giriş: {new Date(user?.last_sign_in_at).toLocaleDateString('tr-TR')}
                        </p>
                    </div>

                    {/* Account Info */}
                    <div className="glass p-6 rounded-[40px] border border-white/5 bg-white/[0.02] space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Hesap Bilgileri</p>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-white/30 font-medium">Rol</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-radiant-amber bg-radiant-amber/10 px-3 py-1 rounded-full">Müşteri</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-white/30 font-medium">Üyelik</span>
                            <span className="text-xs text-white/60 font-medium">
                                {new Date(user?.created_at).toLocaleDateString('tr-TR')}
                            </span>
                        </div>
                        {gender && (
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-white/30 font-medium">Cinsiyet</span>
                                <span className="text-xs text-white/60 font-medium">
                                    {gender === 'MALE' ? 'Erkek' : gender === 'FEMALE' ? 'Kadın' : 'Diğer'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
