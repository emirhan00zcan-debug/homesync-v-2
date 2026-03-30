import React from 'react';

interface ServiceCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default function ServiceCard({ title, description, icon }: ServiceCardProps) {
    return (
        <div className="flex gap-6 p-6 md:p-8 bg-ivory-white/80 dark:bg-white/5 backdrop-blur-md rounded-[24px] border border-black/10 dark:border-white/10 group">
            <div className="w-14 h-14 text-cosmic-blue dark:text-ivory-white flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div className="flex flex-col justify-center">
                <h4 className="font-bold text-xl mb-2 text-foreground tracking-tight">{title}</h4>
                <p className="text-sm text-foreground/70 font-medium leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
