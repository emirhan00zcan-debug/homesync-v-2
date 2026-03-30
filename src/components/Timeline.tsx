import React from 'react';

interface StepProps {
    step: string;
    title: string;
    description: string;
    index: number;
}

const steps: StepProps[] = [
    { step: "01", title: "KEŞİF", description: "Mekan analizi ve ihtiyaç tespiti.", index: 0 },
    { step: "02", title: "TASARIM", description: "3D modelleme ve senaryo planlama.", index: 1 },
    { step: "03", title: "MONTAJ", description: "Hızlı, temiz ve güvenli kurulum.", index: 2 }
];

export default function Timeline() {
    return (
        <div className="border-t border-black/10 dark:border-white/10 pt-20 mt-32 relative z-10 w-full max-w-7xl mx-auto">
            <h3 className="text-center text-3xl md:text-4xl font-black mb-16 tracking-tighter">
                SÜREÇ NASIL İŞLER?
            </h3>
            
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-px bg-black/20 dark:bg-white/20 -translate-y-1/2 hidden md:block" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                    {steps.map((item) => (
                        <div 
                            key={item.index}
                            className="bg-ivory-white dark:bg-cosmic-dark p-8 md:p-10 rounded-[32px] text-center border border-black/10 dark:border-white/10 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden"
                        >
                            <div className="text-6xl md:text-7xl font-black font-display text-cosmic-blue/20 dark:text-ivory-white/20 mb-6 font-mono">
                                {item.step}
                            </div>
                            <h4 className="font-black text-2xl mb-4 tracking-[0.2em]">{item.title}</h4>
                            <p className="text-sm font-medium text-foreground/70 leading-relaxed max-w-[200px] mx-auto">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
