"use client";

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Mail,
    Lock,
    Sparkles,
    User,
    Package,
    Hammer,
    ChevronRight,
    ArrowLeft,
    ShieldCheck,
    UserCheck,
    Store,
    CheckCircle,
    Loader2
} from 'lucide-react';
import Link from 'next/link';

const ROLES = {
    CUSTOMER: 'alici',
    VENDOR: 'satici',
    TECHNICIAN: 'usta'
} as const;

type Role = typeof ROLES[keyof typeof ROLES];

function AuthContent() {
    const searchParams = useSearchParams();
    const initialMode = searchParams.get('mode') as 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | null;
    const callbackUrl = searchParams.get('callbackUrl');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [role, setRole] = useState<Role>(ROLES.CUSTOMER);
    const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>(initialMode || 'LOGIN');
    const [isPending, setIsPending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [emailConfirmPending, setEmailConfirmPending] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    // Immediate redirect if session exists
    React.useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.replace(callbackUrl || '/');
            }
        };
        checkSession();
    }, [supabase, router, callbackUrl]);

    const [idData, setIdData] = useState({ ad: '', soyad: '', tc: '', dogum: '' });
    const [idVerified, setIdVerified] = useState(false);
    const [verifyingId, setVerifyingId] = useState(false);

    const handleVerifyId = async () => {
        if (!idData.ad || !idData.soyad || !idData.tc || !idData.dogum) {
            setErrorMsg('Lütfen tüm kimlik bilgilerini doldurun.');
            return;
        }
        setVerifyingId(true);
        setErrorMsg('');
        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tc_no: idData.tc,
                    first_name: idData.ad,
                    last_name: idData.soyad,
                    birth_year: parseInt(idData.dogum)
                })
            });
            const result = await response.json();
            if (result.success) {
                setIdVerified(true);
            } else {
                setErrorMsg(result.message || 'Kimlik doğrulanamadı.');
            }
        } catch (err) {
            setErrorMsg('Doğrulama servisi hatası.');
        } finally {
            setVerifyingId(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setErrorMsg('');

        try {
            if (mode === 'REGISTER') {
                // If the user is a vendor or technician, they MUST be identity verified first
                if (role !== ROLES.CUSTOMER && !idVerified) {
                    setErrorMsg('Devam etmek için önce kimlik bilgilerinizi doğrulamalısınız.');
                    setIsPending(false);
                    return;
                }

                const { data: signUpData, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: role,
                            full_name: role !== ROLES.CUSTOMER ? `${idData.ad} ${idData.soyad}` : (name || email.split('@')[0]),
                            company_name: role === ROLES.VENDOR ? companyName : undefined,
                            is_identity_verified: role !== ROLES.CUSTOMER ? idVerified : false,
                            tc_no: role !== ROLES.CUSTOMER ? idData.tc : undefined,
                            ad: role !== ROLES.CUSTOMER ? idData.ad : undefined,
                            soyad: role !== ROLES.CUSTOMER ? idData.soyad : undefined,
                            dogum_yili: role !== ROLES.CUSTOMER ? parseInt(idData.dogum) : undefined,
                        }
                    }
                });

                if (error) throw error;

                // If email confirmation is required
                // ✅ Güvenli akış: session yoksa her zaman e-posta onayı ekranı göster
                if (!signUpData.session) {
                    setEmailConfirmPending(true);
                    setIsPending(false);
                    return;
                }
            } else if (mode === 'FORGOT_PASSWORD') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
                });

                if (error) throw error;

                setResetEmailSent(true);
                setIsPending(false);
                return;
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;
            }

            let resolvedUrl = callbackUrl || '/';

            // Redirect Vendors and Technicians to specialized onboarding if it's a new registration
            if (mode === 'REGISTER') {
                if (role === ROLES.VENDOR) {
                    resolvedUrl = '/auth/vendor-onboarding';
                } else if (role === ROLES.TECHNICIAN) {
                    resolvedUrl = '/auth/technician-onboarding';
                }
            }

            // Use router.push for immediate transition. 
            // AuthContext will handle the session state update in parallel.
            router.push(resolvedUrl);
            router.refresh(); // Force refresh to update server components with new auth cookie

        } catch (_err) {
            // ✅ ESLint uyumlu: _err ile başlayan değişkenler kullanılmayan parametre olarak işaretlenir
            const message = _err instanceof Error ? _err.message : "Bilinmeyen bir hata oluştu";
            let displayMessage = message;
            if (message === "Invalid login credentials") displayMessage = "Geçersiz e-posta veya şifre kombinasyonu.";
            if (message === "User already registered") displayMessage = "Bu e-posta adresi zaten kayıtlı.";

            setErrorMsg(displayMessage);
            setIsPending(false);
        }
    };

    // Email confirmation pending screen
    if (emailConfirmPending) {
        return (
            <main data-theme="dark" className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-radiant-amber/5 blur-[150px] rounded-full animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full" />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md text-center relative z-10"
                >
                    <div className="glass p-12 rounded-[48px] border border-white/10 shadow-3xl">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="text-green-400" size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-4">Hesabınız Oluşturuldu!</h2>
                        <p className="text-white/50 text-sm mb-2">
                            <span className="text-radiant-amber font-bold">{email}</span> adresine bir doğrulama e-postası gönderdik.
                        </p>
                        <p className="text-white/30 text-xs mb-10">
                            E-postanızı doğruladıktan sonra giriş yapabilirsiniz.
                        </p>
                        <button
                            onClick={() => { setEmailConfirmPending(false); setMode('LOGIN'); }}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-radiant-amber text-cosmic-blue font-black rounded-[24px] hover:scale-[1.02] transition-all shadow-[0_20px_40px_rgba(255,191,0,0.2)] text-xs uppercase tracking-wider"
                        >
                            Giriş Yap
                        </button>
                    </div>
                </motion.div>
            </main>
        );
    }

    // Reset email sent screen
    if (resetEmailSent) {
        return (
            <main data-theme="dark" className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-radiant-amber/5 blur-[150px] rounded-full animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full" />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md text-center relative z-10"
                >
                    <div className="glass p-12 rounded-[48px] border border-white/10 shadow-3xl">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="text-green-400" size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-4">E-posta Gönderildi!</h2>
                        <p className="text-white/50 text-sm mb-2">
                            <span className="text-radiant-amber font-bold">{email}</span> adresine şifre sıfırlama bağlantısı gönderildi.
                        </p>
                        <p className="text-white/30 text-xs mb-10">
                            E-postanızdaki bağlantıya tıklayarak yeni şifrenizi belirleyebilirsiniz. Lütfen spam/gereksiz klasörünü de kontrol etmeyi unutmayın.
                        </p>
                        <button
                            onClick={() => { setResetEmailSent(false); setMode('LOGIN'); }}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-radiant-amber text-cosmic-blue font-black rounded-[24px] hover:scale-[1.02] transition-all shadow-[0_20px_40px_rgba(255,191,0,0.2)] text-xs uppercase tracking-wider"
                        >
                            Giriş Yap
                        </button>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main data-theme="dark" className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambient Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-radiant-amber/5 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-xl relative z-10 flex flex-col items-center">
                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <Link href="/" className="group inline-flex items-center gap-4 mb-6">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/10 group-hover:border-radiant-amber transition-all shadow-xl"
                        >
                            <Sparkles className="text-radiant-amber" size={20} />
                        </motion.div>
                        <div className="flex flex-col text-left">
                            <span className="text-lg font-black tracking-tighter uppercase leading-tight text-white">
                                HomeSync
                            </span>
                            <span className="text-[8px] font-black tracking-[0.4em] text-radiant-amber uppercase mt-1">
                                Anti-Gravity
                            </span>
                        </div>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full glass p-10 rounded-[48px] border border-white/10 shadow-3xl bg-white/[0.01] backdrop-blur-2xl"
                >
                    {/* Role Selector Tabs */}
                    <div className="grid grid-cols-3 gap-3 mb-10 p-2 bg-white/5 rounded-[32px] border border-white/5">
                        {[
                            { id: ROLES.CUSTOMER, label: 'Alıcı', icon: User },
                            { id: ROLES.VENDOR, label: 'Satıcı', icon: Package },
                            { id: ROLES.TECHNICIAN, label: 'Usta', icon: Hammer },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setRole(item.id)}
                                className={`flex flex-col items-center gap-2 py-4 rounded-[24px] transition-all duration-500 relative ${role === item.id
                                    ? 'bg-radiant-amber text-cosmic-blue shadow-glow scale-[1.05] z-10'
                                    : 'text-white/30 hover:text-white/60'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Mode Toggle (Login/Register) */}
                    <div className="flex justify-center gap-8 mb-10">
                        <button
                            onClick={() => setMode('LOGIN')}
                            className={`text-xs font-black uppercase tracking-widest transition-all pb-1 ${mode === 'LOGIN' ? 'text-white border-b-2 border-radiant-amber' : 'text-white/20 hover:text-white/40'}`}
                        >
                            Giriş Yap
                        </button>
                        <button
                            onClick={() => setMode('REGISTER')}
                            className={`text-xs font-black uppercase tracking-widest transition-all pb-1 ${mode === 'REGISTER' ? 'text-white border-b-2 border-radiant-amber' : 'text-white/20 hover:text-white/40'}`}
                        >
                            Kayıt Ol
                        </button>
                        <button
                            onClick={() => setMode('FORGOT_PASSWORD')}
                            className={`text-xs font-black uppercase tracking-widest transition-all pb-1 ${mode === 'FORGOT_PASSWORD' ? 'text-white border-b-2 border-radiant-amber' : 'text-white/20 hover:text-white/40'}`}
                        >
                            Şifremi Unuttum
                        </button>
                    </div>

                    <AnimatePresence>
                        {errorMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 rounded-[24px] bg-red-500/10 border border-red-500/20 text-center"
                            >
                                <p className="text-red-400 text-xs font-bold">{errorMsg}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${role}-${mode}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                {mode === 'REGISTER' && role === ROLES.CUSTOMER && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Ad Soyad</label>
                                        <div className="relative group">
                                            <UserCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-radiant-amber transition-colors" size={20} />
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Adınız Soyadınız"
                                                className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium placeholder:text-white/10"
                                            />
                                        </div>
                                    </div>
                                )}

                                {mode === 'REGISTER' && role !== ROLES.CUSTOMER && (
                                    <div className="space-y-5 p-6 bg-white/[0.03] border border-white/10 rounded-[32px]">
                                        <div className="flex items-center gap-3 mb-2">
                                            <ShieldCheck className="text-radiant-amber" size={20} />
                                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Resmi Kimlik Doğrulama</h3>
                                        </div>
                                        <p className="text-[10px] text-white/30 font-bold uppercase leading-relaxed mb-4">
                                            {role === ROLES.VENDOR ? 'Satıcı' : 'Usta'} hesabı için T.C. Kimlik doğrulaması zorunludur.
                                        </p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Ad</label>
                                                <input
                                                    type="text"
                                                    required
                                                    autoComplete='given-name'
                                                    placeholder="İSİM"
                                                    value={idData.ad}
                                                    onChange={(e) => setIdData({ ...idData, ad: e.target.value.toLocaleUpperCase('tr-TR') })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-radiant-amber/50 transition-colors text-xs"
                                                    disabled={idVerified}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Soyad</label>
                                                <input
                                                    type="text"
                                                    required
                                                    autoComplete='family-name'
                                                    placeholder="SOYİSİM"
                                                    value={idData.soyad}
                                                    onChange={(e) => setIdData({ ...idData, soyad: e.target.value.toLocaleUpperCase('tr-TR') })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-radiant-amber/50 transition-colors text-xs"
                                                    disabled={idVerified}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">T.C. Kimlik No</label>
                                                <input
                                                    type="text"
                                                    required
                                                    maxLength={11}
                                                    placeholder="11 HANE"
                                                    value={idData.tc}
                                                    onChange={(e) => setIdData({ ...idData, tc: e.target.value.replace(/\D/g, '') })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-radiant-amber/50 transition-colors font-mono text-xs tracking-tighter"
                                                    disabled={idVerified}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Doğum Yılı</label>
                                                <input
                                                    type="text"
                                                    required
                                                    maxLength={4}
                                                    placeholder="YYYY"
                                                    value={idData.dogum}
                                                    onChange={(e) => setIdData({ ...idData, dogum: e.target.value.replace(/\D/g, '') })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-radiant-amber/50 transition-colors font-mono text-xs"
                                                    disabled={idVerified}
                                                />
                                            </div>
                                        </div>

                                        {!idVerified ? (
                                            <button
                                                type="button"
                                                onClick={handleVerifyId}
                                                disabled={verifyingId}
                                                className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border border-white/10"
                                            >
                                                {verifyingId ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                                                Kimliği Doğrula
                                            </button>
                                        ) : (
                                            <div className="w-full py-4 bg-emerald-500/20 text-emerald-400 font-black rounded-xl uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border border-emerald-500/20">
                                                <CheckCircle className="text-emerald-400" size={16} />
                                                Doğrulandı
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Company name — only for Vendor + Register */}
                                {mode === 'REGISTER' && role === ROLES.VENDOR && idVerified && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Üretici / Marka Adı</label>
                                        <div className="relative group">
                                            <Store className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-radiant-amber transition-colors" size={20} />
                                            <input
                                                type="text"
                                                required
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                placeholder="Marka / Firma Adınız"
                                                className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium placeholder:text-white/10 text-sm"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">E-posta Adresi</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-radiant-amber transition-colors" size={20} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="ornek@homesync.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium placeholder:text-white/10 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                {mode !== 'FORGOT_PASSWORD' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end ml-4 mr-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Şifre</label>
                                            {mode === 'LOGIN' && (
                                                <button
                                                    type="button"
                                                    onClick={() => setMode('FORGOT_PASSWORD')}
                                                    className="text-[10px] font-bold text-radiant-amber/70 hover:text-radiant-amber transition-colors"
                                                >
                                                    Şifremi Unuttum
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-radiant-amber transition-colors" size={20} />
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium placeholder:text-white/10 text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="pt-2 space-y-3">
                            <button
                                disabled={isPending}
                                className="w-full py-6 bg-radiant-amber text-cosmic-blue font-black rounded-[24px] hover:shadow-glow active:scale-[0.98] transition-all duration-500 uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isPending ? (
                                    <div className="w-5 h-5 border-2 border-cosmic-blue border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {mode === 'LOGIN' ? 'Sisteme Bağlan' : mode === 'REGISTER' ? 'Aramıza Katıl' : 'Sıfırlama Linki Gönder'}
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>

                            {mode !== 'FORGOT_PASSWORD' && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setIsPending(true);
                                        await supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: {
                                                redirectTo: `${window.location.origin}/auth/callback?next=${callbackUrl || '/'}`,
                                            }
                                        });
                                    }}
                                    disabled={isPending}
                                    className="w-full py-4 bg-white/5 border border-white/10 text-white font-black rounded-[24px] hover:bg-white/10 active:scale-[0.98] transition-all duration-500 uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                                        </g>
                                    </svg>
                                    Google ile Devam Et
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Role Disclaimer */}
                    <div className="mt-10 p-5 rounded-[24px] bg-white/[0.02] border border-white/5 flex items-start gap-4">
                        <ShieldCheck className="text-radiant-amber/40 flex-shrink-0 mt-0.5" size={18} />
                        <p className="text-[10px] text-white/30 leading-relaxed font-bold uppercase tracking-wider">
                            {role === ROLES.CUSTOMER && "Alıcı olarak HomeSync'in geniş koleksiyonuna ve yapay zeka destekli tasarımcıya erişin."}
                            {role === ROLES.VENDOR && "Satıcı/Üretici olarak envanterinizi yönetin ve kurumsal müşterilere doğrudan ulaşın."}
                            {role === ROLES.TECHNICIAN && "Sertifikalı usta olarak montaj taleplerini alın ve gelirinizi profesyonelce yönetin."}
                        </p>
                    </div>
                </motion.div>

                {/* Back to Home Link */}
                <Link href="/" className="mt-12 flex items-center gap-2 text-white/20 hover:text-white/60 transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Anasayfaya Dön</span>
                </Link>
            </div>
        </main>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-cosmic-blue flex items-center justify-center"><div className="w-10 h-10 border-4 border-radiant-amber border-t-transparent rounded-full animate-spin" /></div>}>
            <AuthContent />
        </Suspense>
    );
}
