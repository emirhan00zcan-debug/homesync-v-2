import React from 'react';
import { Search, Zap, Wrench } from 'lucide-react';
import ServiceHero from '@/components/ServiceHero';
import ServiceCard from '@/components/ServiceCard';
import Timeline from '@/components/Timeline';

const SERVICES_DATA = [
    { 
        title: "Akıllı Keşif", 
        desc: "Mekanınızın ışık ihtiyacını yapay zeka destekli sensörlerimizle analiz ediyoruz.",
        icon: <Search className="w-5 h-5" /> 
    },
    { 
        title: "Kişiselleştirilmiş Tasarım", 
        desc: "Yaşam tarzınıza uygun senaryolar ve armatür yerleşimleri planlıyoruz.", 
        icon: <Zap className="w-5 h-5" /> 
    },
    { 
        title: "Profesyonel Montaj", 
        desc: "Sertifikalı mühendislerimizle kusursuz kurulum sağlıyoruz.", 
        icon: <Wrench className="w-5 h-5" /> 
    },
];

export default function ServicesPage() {
    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20 px-6 relative overflow-hidden flex flex-col items-center">
            
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-radiant-amber/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-cosmic-blue/5 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto w-full">
                
                <ServiceHero 
                    title={
                        <>
                            KUSURSUZ MÜHENDİSLİK, <br />
                            <span className="text-radiant-amber">UZMAN ELLERLE</span> BULUŞUYOR
                        </>
                    }
                    description="Sadece ürün satmıyoruz; yaşam alanlarınızın atmosferini bilimsel veriler ve estetik kaygılarla yeniden kurguluyoruz. Sertifikalı HomeSync uzmanları her adımda yanınızda."
                    imageSrc="https://images.unsplash.com/photo-1540932239986-30128078f3c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    stats={{ value: "15+ YIL", label: "Sektör Deneyimi" }}
                />

                {/* Services Cards List placed physically underneath the left side of the hero */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 w-full mb-32">
                    {SERVICES_DATA.map((s, i) => (
                        <ServiceCard 
                            key={i} 
                            title={s.title} 
                            description={s.desc} 
                            icon={s.icon} 
                        />
                    ))}
                </div>

                <Timeline />
            </div>
        </main>
    );
}
