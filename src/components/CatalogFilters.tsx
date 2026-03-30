"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function CatalogFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Local state for fast typing before debounce/push
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    
    // Sync with URL if it changes externally
    useEffect(() => {
        setSearchTerm(searchParams.get('search') || '');
    }, [searchParams]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchTerm(val);
        
        // Debounce actual navigation
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        if (val) {
            params.set('search', val);
        } else {
            params.delete('search');
        }
        
        // Use replace to prevent overwhelming history 
        router.replace(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Ürün ara..." 
                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black w-full text-gray-900 placeholder-gray-400 transition-colors"
                />
            </div>
        </div>
    );
}
