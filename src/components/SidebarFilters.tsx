"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react';

interface SidebarFiltersProps {
    isMobileOpen: boolean;
    setIsMobileOpen: (isOpen: boolean) => void;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({ isMobileOpen, setIsMobileOpen }) => {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        categories: true,
        price: true,
        usage: true,
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const categories = ['Avizeler', 'Masa Lambaları', 'Lambaderler', 'Aplikler', 'Akıllı Ampuller'];
    const usageAreas = ['Salon', 'Yatak Odası', 'Mutfak', 'Banyo', 'Dış Mekan'];

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Categories */}
            <div className="border-b border-gray-200 pb-4">
                <button 
                    onClick={() => toggleSection('categories')}
                    className="flex w-full items-center justify-between py-2 text-sm font-bold text-gray-900"
                >
                    Kategoriler
                    {openSections['categories'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openSections['categories'] && (
                    <div className="mt-2 space-y-2">
                        {categories.map(cat => (
                            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-cosmic-blue focus:ring-cosmic-blue" />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900">{cat}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Range */}
            <div className="border-b border-gray-200 pb-4">
                <button 
                    onClick={() => toggleSection('price')}
                    className="flex w-full items-center justify-between py-2 text-sm font-bold text-gray-900"
                >
                    Fiyat Aralığı
                    {openSections['price'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openSections['price'] && (
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <input type="number" placeholder="Min" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cosmic-blue focus:outline-none focus:ring-1 focus:ring-cosmic-blue" />
                            <span className="text-gray-500">-</span>
                            <input type="number" placeholder="Max" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cosmic-blue focus:outline-none focus:ring-1 focus:ring-cosmic-blue" />
                        </div>
                        <button className="w-full rounded-md bg-gray-100 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 transition-colors">
                            Uygula
                        </button>
                    </div>
                )}
            </div>

            {/* Usage Area */}
            <div className="border-b border-gray-200 pb-4">
                <button 
                    onClick={() => toggleSection('usage')}
                    className="flex w-full items-center justify-between py-2 text-sm font-bold text-gray-900"
                >
                    Kullanım Alanı
                    {openSections['usage'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openSections['usage'] && (
                    <div className="mt-2 space-y-2">
                        {usageAreas.map(area => (
                            <label key={area} className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-cosmic-blue focus:ring-cosmic-blue" />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900">{area}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-72 shrink-0 pr-8">
                <div className="sticky top-24">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Filter size={20} />
                        Filtreler
                    </h2>
                    <FilterContent />
                </div>
            </div>

            {/* Mobile Drawer Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile Drawer (Bottom) */}
            <div className={`fixed inset-x-0 bottom-0 z-50 h-[85vh] bg-white rounded-t-2xl shadow-xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
                isMobileOpen ? 'translate-y-0' : 'translate-y-full'
            }`}>
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 shrink-0">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Filter size={20} />
                        Filtreler
                    </h2>
                    <button 
                        onClick={() => setIsMobileOpen(false)}
                        className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                    <FilterContent />
                </div>
                
                {/* Mobile Apply Button */}
                <div className="border-t border-gray-200 bg-white p-4 shrink-0 mb-4">
                    <button 
                        onClick={() => setIsMobileOpen(false)}
                        className="w-full rounded-md bg-cosmic-blue py-3 text-sm font-medium text-white shadow-sm hover:bg-cosmic-blue/90"
                    >
                        Sonuçları Göster
                    </button>
                </div>
            </div>
        </>
    );
};

export default SidebarFilters;
