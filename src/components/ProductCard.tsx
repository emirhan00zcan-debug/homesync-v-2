import React, { useState } from 'react';
import { ShoppingCart, Zap, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import Link from 'next/link';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const [adding, setAdding] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        setAdding(true);
        // Sepete ekleme fonksiyonun buraya bağlanacak
        setTimeout(() => setAdding(false), 1000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="w-full glass-premium bg-white/[0.02] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl group mb-6 transition-all duration-500 hover:border-radiant-amber/30 hover:bg-white/[0.05]"
        >
            {/* Görsel Alanı - Aura Style */}
            <div className="relative aspect-video bg-white/5 flex items-center justify-center overflow-hidden">
                {/* Alt Kısımdaki Karanlık Geçiş */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10 opacity-80" />
                
                {/* Hareketli Arka Plan Işığı */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute w-32 h-32 bg-radiant-amber/10 blur-[50px] rounded-full"
                />

                <img
                    src={product.imageUrl ?? '/placeholder-product.png'}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Badge: HomeSync Özel Seri */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    <span className="flex items-center gap-1 bg-radiant-amber text-cosmic-blue px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,191,0,0.5)] border border-white/20">
                        <Zap size={8} className="fill-current" /> HOMESYNC EXCLUSIVE
                    </span>
                </div>

                <div className="absolute bottom-4 left-6 z-20">
                    <h5 className="text-white/40 font-black text-[9px] uppercase tracking-[0.4em] mb-1">
                        HOMESYNC
                    </h5>
                    <p className="text-radiant-amber font-black text-lg tracking-tighter drop-shadow-glow-sm">
                        {product.price.toLocaleString('tr-TR')} ₺
                    </p>
                </div>
            </div>

            {/* Alt Detay ve Butonlar */}
            <div className="p-6">
                <h3 className="text-white font-black text-xs uppercase tracking-[0.15em] mb-5 line-clamp-1 group-hover:text-radiant-amber transition-colors">
                    {product.name}
                </h3>
                
                <div className="flex gap-3">
                    <Link
                        href={`/product/${product.id}`}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white/50 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-center transition-all border border-white/5 backdrop-blur-xl"
                    >
                        KEŞFET
                    </Link>
                    
                    <button 
                        onClick={handleAddToCart}
                        disabled={adding}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-glow-sm ${
                            adding 
                            ? 'bg-green-500 text-white scale-90' 
                            : 'bg-radiant-amber text-cosmic-blue hover:shadow-glow hover:scale-105'
                        }`}
                    >
                        {adding ? (
                            <Plus size={18} className="animate-ping" />
                        ) : (
                            <ShoppingCart size={18} />
                        )}
                    </button>
                </div>
            </div>

            {/* Hover Işık Efekti */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-radiant-amber/5 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
    );
};
export default ProductCard;