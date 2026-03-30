import React from 'react';
import StoreCard from '@/components/StoreCard';
import StoreMap from '@/components/StoreMap';
import { Store } from 'lucide-react';

const STORES_DATA = [
    {
        name: "HomeSync Flagship Store",
        address: "Levent Mah. Büyükdere Cad. No: 123, 34330 Beşiktaş/İstanbul",
        phone: "+90 (212) 555 01 23"
    },
    {
        name: "HomeSync Experience Center",
        address: "Bağdat Cad. No: 456, 34740 Kadıköy/İstanbul",
        phone: "+90 (216) 555 01 89"
    }
];

export default function StoresPage() {
    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20 px-6 relative overflow-hidden">
            
            {/* Ambient Ambient Glows */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-radiant-amber/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cosmic-blue/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto">
                <header className="mb-16 text-center">
                    <div className="w-16 h-16 mx-auto bg-cosmic-blue/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-anti-gravity">
                        <Store className="w-8 h-8 text-radiant-amber" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black font-display tracking-tighter mb-6">
                        DENEYİM MERKEZLERİ
                    </h1>
                    <p className="text-lg text-foreground/60 max-w-2xl mx-auto font-medium">
                        Işığın tasarımla buluştuğu noktaları yakından inceleyin. 
                        Sertifikalı mühendislerimiz eşliğinde ürünlerimizi deneyimlemek için mağazalarımızı ziyaret edin.
                    </p>
                </header>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-1/3 flex flex-col gap-6">
                        {STORES_DATA.map((store, i) => (
                            <StoreCard key={i} {...store} />
                        ))}
                    </div>
                    <div className="w-full lg:w-2/3 sticky top-32">
                        <StoreMap />
                    </div>
                </div>
            </div>
        </main>
    );
}
