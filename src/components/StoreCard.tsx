import React from 'react';
import { MapPin, Phone } from 'lucide-react';

interface StoreCardProps {
    name: string;
    address: string;
    phone: string;
    onClick?: () => void;
}

export default function StoreCard({ name, address, phone, onClick }: StoreCardProps) {
    return (
        <div 
            onClick={onClick}
            className="group cursor-pointer p-8 rounded-[24px] bg-ivory-white/80 dark:bg-white/5 backdrop-blur-md shadow-anti-gravity border border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-all flex flex-col"
        >
            <h3 className="text-2xl font-black mb-4 tracking-tight text-cosmic-blue dark:text-ivory-white">{name}</h3>
            
            <div className="space-y-4 text-cosmic-blue/80 dark:text-ivory-white/80 font-medium text-sm md:text-base">
                <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-radiant-amber shrink-0 mt-1" />
                    <p className="leading-relaxed">{address}</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <Phone className="w-5 h-5 text-radiant-amber shrink-0" />
                    <p className="leading-relaxed">{phone}</p>
                </div>
            </div>
        </div>
    );
}
