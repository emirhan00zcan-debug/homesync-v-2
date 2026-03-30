'use client';

import React, { useState } from 'react';
import { maskPhoneNumber, maskAddress, shouldRevealData } from '@/lib/security';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface KVKKMaskProps {
    data: string;
    type: 'phone' | 'address';
    jobStatus?: string;
    className?: string;
}

/**
 * Reusable KVKK Masking Component
 * Automatically masks sensitive data unless jobStatus is 'accepted' or similar.
 */
const KVKKMask: React.FC<KVKKMaskProps> = ({ data, type, jobStatus = 'pending', className = '' }) => {
    const isRevealed = shouldRevealData(jobStatus);
    const [showAnyway, setShowAnyway] = useState(false);

    const maskedValue = type === 'phone' ? maskPhoneNumber(data) : maskAddress(data);
    const displayValue = (isRevealed || showAnyway) ? data : maskedValue;

    return (
        <div className={`p-2 rounded-lg bg-gray-50/50 flex items-center justify-between group transition-all duration-300 border border-transparent hover:border-amber-200/50 ${className}`}>
            <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-full bg-amber-50 text-amber-600">
                    <ShieldCheck size={16} />
                </div>
                <span className={`text-sm tracking-tight ${!isRevealed && !showAnyway ? 'font-mono text-gray-500' : 'text-gray-900 font-medium'}`}>
                    {displayValue}
                </span>
            </div>

            {!isRevealed && (
                <button
                    onClick={() => setShowAnyway(!showAnyway)}
                    className="text-gray-400 hover:text-amber-600 transition-colors p-1"
                    title={showAnyway ? "Maskala" : "Geçici olarak göster (Geliştirici modu)"}
                >
                    {showAnyway ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            )}

            {isRevealed && (
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 flex items-center gap-1">
                    REVEALED
                </span>
            )}
        </div>
    );
};

export default KVKKMask;
