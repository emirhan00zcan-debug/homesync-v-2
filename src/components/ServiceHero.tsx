import React from 'react';
import Image from 'next/image';

interface ServiceHeroProps {
    title: React.ReactNode;
    description: string;
    imageSrc: string;
    stats?: {
        value: string;
        label: string;
    };
}

export default function ServiceHero({ title, description, imageSrc, stats }: ServiceHeroProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32 relative z-10">
            <div>
                <h2 className="text-5xl md:text-6xl font-bold font-display tracking-tighter leading-[0.9] mb-8 text-foreground">
                    {title}
                </h2>
                <p className="text-lg text-foreground/60 mb-10 leading-relaxed font-medium">
                    {description}
                </p>
                {/* Slot for children if we want to pass Services List here later */}
            </div>
            
            <div className="relative">
                <div className="aspect-[4/5] rounded-[32px] overflow-hidden shadow-anti-gravity border border-black/5 dark:border-white/5 relative bg-ivory-white/50 dark:bg-cosmic-dark/50">
                    <Image 
                        src={imageSrc}
                        alt="Service Hero Image" 
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-cosmic-blue/10 to-transparent pointer-events-none" />
                </div>
                
                {stats && (
                    <div className="absolute -bottom-10 -left-10 bg-radiant-amber p-10 rounded-[32px] shadow-anti-gravity hidden md:block">
                        <div className="text-4xl font-black font-display text-cosmic-blue mb-2">{stats.value}</div>
                        <div className="text-[10px] font-black text-cosmic-blue/70 tracking-[0.2em] uppercase">{stats.label}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
