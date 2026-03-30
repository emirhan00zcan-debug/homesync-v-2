'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Mail,
    Lock,
    User,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Hammer,
    Package,
    Store,
    UserCircle
} from 'lucide-react';
import { toTurkishUpperCase } from '@/lib/validation';

type Step = 1 | 2;
type Role = 'alici' | 'usta' | 'satici';

export default function MultiStepRegistration() {
    const router = useRouter();
    const supabase = createClient();

    // Form State
    const [step, setStep] = useState<Step>(1);
    const [isPending, setIsPending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Step 1: Role
    const [role, setRole] = useState<Role | null>(null);

    // Step 2: Basic Info
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        if (!role) {
            setErrorMsg('Lütfen bir rol seçin.');
            return;
        }

        if (!fullName || !email || !password) {
            setErrorMsg('Lütfen tüm alanları doldurun.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg('Şifreler eşleşmiyor.');
            return;
        }

        if (password.length < 6) {
            setErrorMsg('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        setIsPending(true);
        setErrorMsg('');

        try {
            // Split full name for profile
            const nameParts = fullName.trim().split(' ');
            const ad = nameParts[0];
            const soyad = nameParts.slice(1).join(' ');

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: toTurkishUpperCase(fullName),
                        role: role,
                        ad: toTurkishUpperCase(ad),
                        soyad: toTurkishUpperCase(soyad),
                        status: role === 'alici' ? 'active' : 'pending'
                    }
                }
            });

            if (error) throw error;

            let nextPath = '/';
            if (role === 'usta' || role === 'satici') {
                nextPath = '/dogrulama-merkezi';
            }

            router.push(`/auth/callback?next=${nextPath}`);
        } catch (error: any) {
            setErrorMsg(error.message || 'Kayıt sırasında bir hata oluştu.');
        } finally {
            setIsPending(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && !role) {
            setErrorMsg('Lütfen devam etmek için bir rol seçin.');
            return;
        }

        setErrorMsg('');
        setStep(2);
    };

    const prevStep = () => {
        setStep(1);
    };

    return (
        <div className="w-full max-w-xl relative z-10">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-12 relative px-4">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -z-10 mx-10" />
                {[1, 2].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                            ${step >= s ? 'bg-radiant-amber text-cosmic-blue shadow-glow scale-110' : 'bg-white/5 text-white/20'}
                        `}>
                            {step > s ? <CheckCircle2 size={20} /> : <span className="text-xs font-black">{s}</span>}
                        </div>
                        <span className={`text-[10px] uppercase font-black tracking-widest ${step >= s ? 'text-white' : 'text-white/20'}`}>
                            {s === 1 ? 'Rol Seçimi' : 'Kayıt Bilgileri'}
                        </span>
                    </div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-10 rounded-[48px] border border-white/10 shadow-3xl bg-white/[0.01] backdrop-blur-2xl"
            >
                <AnimatePresence mode="wait">
                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 rounded-[24px] bg-red-500/10 border border-red-500/20"
                        >
                            <p className="text-red-400 text-xs font-bold text-center">{errorMsg}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-white uppercase tracking-widest">Nasıl Kaydolmak İstersiniz?</h3>
                                <p className="text-white/30 text-[10px] mt-2 font-bold uppercase tracking-widest italic">İhtiyaçlarınıza uygun rolü seçin</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { id: 'alici', label: 'Alıcı', icon: Package, desc: "Ürün kataloğuna erişin ve güvenle alışveriş yapın." },
                                    { id: 'satici', label: 'Satıcı / Mağaza', icon: Store, desc: "Kendi ürünlerinizi sergileyin ve satışa başlayın." },
                                    { id: 'usta', label: 'Usta / Profesyonel', icon: Hammer, desc: "Montaj ve servis taleplerini karşılayın." },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setRole(item.id as Role)}
                                        className={`
                                            flex items-center gap-6 p-6 rounded-[32px] border transition-all duration-500 text-left group w-full
                                            ${role === item.id
                                                ? 'bg-radiant-amber/10 border-radiant-amber shadow-glow'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}
                                        `}
                                    >
                                        <div className={`
                                            w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-500
                                            ${role === item.id ? 'bg-radiant-amber text-cosmic-blue' : 'bg-white/5 text-white/20 group-hover:text-white/40'}
                                        `}>
                                            <item.icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`text-xs font-black uppercase tracking-widest ${role === item.id ? 'text-radiant-amber' : 'text-white'}`}>
                                                {item.label}
                                            </h4>
                                            <p className="text-[10px] text-white/30 mt-1 font-bold uppercase">{item.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-white uppercase tracking-widest">Kayıt Bilgileri</h3>
                                <p className="text-white/30 text-[10px] mt-2 font-bold uppercase tracking-widest italic">{role === 'alici' ? 'Hızlıca hesabınızı oluşturun' : 'Doğrulama öncesi temel bilgiler'}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Ad Soyad</label>
                                    <div className="relative group">
                                        <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-radiant-amber transition-colors" size={20} />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="ADINIZ SOYADINIZ"
                                            className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium placeholder:text-white/10 uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">E-posta</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-radiant-amber transition-colors" size={20} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="ornek@homesync.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium placeholder:text-white/10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Şifre</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-radiant-amber transition-colors" size={20} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium placeholder:text-white/10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Şifre Tekrar</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-radiant-amber transition-colors" size={20} />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium placeholder:text-white/10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="pt-10 flex items-center justify-between gap-4">
                    {step > 1 && (
                        <button
                            disabled={isPending}
                            onClick={prevStep}
                            className="flex items-center gap-2 px-6 py-4 text-white/30 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Geri</span>
                        </button>
                    )}

                    <button
                        disabled={isPending || (step === 1 && !role)}
                        onClick={step === 2 ? handleRegister : nextStep}
                        className={`
                            ml-auto py-5 px-10 bg-radiant-amber text-cosmic-blue font-black rounded-[48px] hover:shadow-glow active:scale-[0.98] transition-all duration-500 uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-30 disabled:hover:shadow-none
                        `}
                    >
                        {isPending ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                <span>{step === 2 ? 'Kayıdı Tamamla' : 'Devam Et'}</span>
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Support info */}
            <div className="mt-8 text-center">
                <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] leading-relaxed">
                    Tüm bilgileriniz 256-bit AES protokolü ile şifrelenir.<br />
                    Giriş yaparak kullanım koşullarımızı kabul etmiş sayılırsınız.
                </p>
            </div>
        </div>
    );
}
