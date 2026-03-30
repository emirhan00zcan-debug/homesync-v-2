import React from 'react';
import VendorOnboarding from '@/components/auth/VendorOnboarding';

export const metadata = {
    title: 'Satıcı Kaydı | HomeSync Market',
    description: 'Ticari faaliyetlerinizi belgeleyin ve HomeSync ekosisteminde satışa başlayın.',
};

export default function VendorOnboardingPage() {
    return (
        <main className="min-h-screen bg-[#0A192F] pt-20 pb-12">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase">
                        Vendor <span className="text-radiant-amber">Verification</span>
                    </h1>
                    <p className="text-white/40 uppercase tracking-[0.2em] text-xs font-bold">
                        Satıcı Kayıt ve Güvenlik Onayı
                    </p>
                </div>

                <VendorOnboarding />
            </div>
        </main>
    );
}
