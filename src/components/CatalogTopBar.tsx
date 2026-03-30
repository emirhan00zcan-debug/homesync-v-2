"use client";

import React from 'react';
import { Filter } from 'lucide-react';

interface CatalogTopBarProps {
    productCount?: number;
    onMobileFilterClick?: () => void;
}

const CatalogTopBar: React.FC<CatalogTopBarProps> = ({ productCount = 0, onMobileFilterClick = () => {} }) => {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-gray-200 mb-6 w-full">
            <div className="text-sm text-gray-600 font-medium">
                <span className="font-bold text-gray-900">{productCount}</span> ürün bulundu
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Mobile Filter Toggle */}
                <button 
                    onClick={onMobileFilterClick}
                    className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                    <Filter size={16} />
                    Filtrele
                </button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 flex-1 sm:flex-none">
                    <label htmlFor="sort-select" className="text-sm text-gray-600 hidden sm:block whitespace-nowrap">
                        Sırala:
                    </label>
                    <select 
                        id="sort-select"
                        className="w-full sm:w-auto border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-cosmic-blue focus:border-cosmic-blue bg-white"
                        defaultValue="recommended"
                    >
                        <option value="recommended">Önerilenler</option>
                        <option value="price_asc">En Düşük Fiyat</option>
                        <option value="price_desc">En Yüksek Fiyat</option>
                        <option value="bestsellers">Çok Satanlar</option>
                        <option value="newest">En Yeniler</option>
                        <option value="rating">Değerlendirme</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default CatalogTopBar;
