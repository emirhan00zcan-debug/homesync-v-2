"use client";

import React from 'react';
import { PackageSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import CatalogProductCard from './CatalogProductCard';
import Skeleton from './ui/Skeleton';
import Link from 'next/link';

interface CatalogProductGridProps {
    products: Product[];
    isLoading?: boolean;
}

const CatalogProductGrid: React.FC<CatalogProductGridProps> = ({ products, isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
                        <Skeleton className="aspect-square w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/3 rounded" />
                            <Skeleton className="h-5 w-3/4 rounded" />
                        </div>
                        <div className="flex justify-between items-end pt-4">
                            <Skeleton className="h-6 w-1/4 rounded" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="w-full py-24 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <PackageSearch size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ürün Bulunamadı</h3>
                <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed mb-6">
                    Arama kriterlerinize uygun ürün bulamadık. Lütfen farklı anahtar kelimeler veya filtreler deneyin.
                </p>
                <Link href="/katalog" className="px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                    Filtreleri Temizle
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch"
        >
            <AnimatePresence mode="popLayout">
                {products.map((product) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        <CatalogProductCard product={product} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

export default CatalogProductGrid;
