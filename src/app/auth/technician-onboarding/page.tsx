import React from 'react';
import TechnicianOnboarding from '@/components/auth/TechnicianOnboarding';

export const metadata = {
    title: 'Usta Kaydı | HomeSync Pro',
    description: 'Uzmanlığınızı belgeleyin ve HomeSync ağının bir parçası olun.',
};

export default function TechnicianOnboardingPage() {
    return (
        <main className="min-h-screen bg-cosmic-blue pt-20 pb-12">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
                        PRO <span className="text-radiant-amber">NETWORK</span>
                    </h1>
                    <p className="text-white/40 uppercase tracking-[0.2em] text-xs font-bold">
                        Uzman Kayıt ve Onay Süreci
                    </p>
                </div>

                <TechnicianOnboarding />
            </div>
        </main>
    );
}
