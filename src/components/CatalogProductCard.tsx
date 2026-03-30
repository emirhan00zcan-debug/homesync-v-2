"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store';
import { ShoppingCart, Check, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { trackProductView } from '@/lib/tracking';

export default function CatalogProductCard({ product }: { product: Product }) {
    const addToCart = useCartStore((state) => state.addToCart);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        addToCart({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            vendorId: product.store?.id
        }, product.isInstallationIncluded || false);

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const imageUrl = product.imageUrl || (product as any).image_url;

    return (
        <Link
            href={`/product/${product.slug}`}
            className="group block h-full"
            onClick={() => trackProductView({
                id: product.id,
                category: product.category || 'General',
                price: product.price,
                name: product.name
            })}
        >
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative">
                
                {/* Installation Badge */}
                {product.isInstallationIncluded && (
                    <div className="absolute top-3 left-3 z-10 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                        Usta Hizmeti
                    </div>
                )}
                
                {/* Image Section */}
                <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center p-4">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
                            <span className="text-gray-400 text-xs">Görsel Yok</span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {product.manufacturer || 'HomeSync'}
                            </span>
                            <div className="flex items-center gap-1 text-amber-500">
                                <Star size={12} className="fill-current" />
                                <span className="text-xs font-bold text-gray-700">4.8</span>
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                            {product.name}
                        </h3>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-gray-900">
                                {product.price.toLocaleString('tr-TR')} ₺
                            </span>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                                isAdded 
                                    ? 'bg-green-500 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-900 hover:text-white'
                            }`}
                            title="Sepete Ekle"
                        >
                            <AnimatePresence mode="wait">
                                {isAdded ? (
                                    <motion.div
                                        key="added"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                    >
                                        <Check size={18} strokeWidth={3} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="cart"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                    >
                                        <ShoppingCart size={18} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
