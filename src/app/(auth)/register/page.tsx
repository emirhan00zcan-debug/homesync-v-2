"use client";

import MultiStepRegistration from '@/components/auth/MultiStepRegistration';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
    return (
        <main className="min-h-screen bg-cosmic-blue flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambient Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-radiant-amber/5 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-xl relative z-10 flex flex-col items-center">
                {/* Logo Section */}
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
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">HomeSync <span className="text-radiant-amber">Hub</span></h1>
                    <p className="text-white/30 mt-3 text-xs font-bold uppercase tracking-[0.3em]">Architectural Lighting Ecosystem</p>
                </motion.div>

                <MultiStepRegistration />

                {/* Login Link */}
                <div className="mt-8 text-center">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">
                        Zaten bir hesabınız var mı?{' '}
                        <Link href="/auth?mode=LOGIN" className="text-radiant-amber hover:text-white transition-colors">
                            Giriş Yapın
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
