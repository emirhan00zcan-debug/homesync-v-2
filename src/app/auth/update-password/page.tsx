"use client";

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, CheckCircle, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

function UpdatePasswordContent() {
    const [password, setPassword] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [success, setSuccess] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setErrorMsg('');

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard/customer'); // Redirect to dashboard or home
            }, 3000);

        } catch (error) {
            const message = error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
            setErrorMsg(message);
        } finally {
            setIsPending(false);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-cosmic-blue flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-radiant-amber/5 blur-[150px] rounded-full animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full" />
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
                        <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-4">Şifreniz Güncellendi!</h2>
                        <p className="text-white/50 text-sm mb-10">
                            Şifreniz başarıyla değiştirildi. Yönlendiriliyorsunuz...
                        </p>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-cosmic-blue flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-radiant-amber/5 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-xl relative z-10 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <Link href="/" className="inline-block mb-6 group">
                        <div className="w-16 h-16 glass rounded-[24px] flex items-center justify-center border border-white/20 group-hover:border-radiant-amber/50 transition-all duration-500 group-hover:shadow-glow">
                            <Sparkles className="text-radiant-amber" size={32} />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">Yeni Şifre <span className="text-radiant-amber">Belirle</span></h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full glass p-10 rounded-[48px] border border-white/10 shadow-3xl bg-white/[0.01] backdrop-blur-2xl"
                >
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
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Yeni Şifre</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-radiant-amber transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    minLength={6}
                                    className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium placeholder:text-white/10"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                disabled={isPending}
                                className="w-full py-6 bg-radiant-amber text-cosmic-blue font-black rounded-[24px] hover:shadow-glow active:scale-[0.98] transition-all duration-500 uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isPending ? (
                                    <div className="w-5 h-5 border-2 border-cosmic-blue border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Şifreyi Güncelle
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </main>
    );
}

export default function UpdatePasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-cosmic-blue flex items-center justify-center"><div className="w-10 h-10 border-4 border-radiant-amber border-t-transparent rounded-full animate-spin" /></div>}>
            <UpdatePasswordContent />
        </Suspense>
    );
}
