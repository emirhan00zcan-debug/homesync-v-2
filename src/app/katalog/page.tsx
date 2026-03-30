"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Home, Package, ShoppingCart, Filter } from 'lucide-react';
import { Product } from '@/types';

// --- ALT BİLEŞENLER ---

const Breadcrumbs = () => (
  <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
    <Link href="/" className="flex items-center gap-1.5 text-foreground/40 hover:text-radiant-amber transition-colors group">
      <Home size={13} className="group-hover:scale-110 transition-transform" />
      <span>Ana Sayfa</span>
    </Link>
    <ChevronRight size={11} className="text-foreground/20" />
    <span className="text-radiant-amber">Katalog</span>
  </nav>
);

const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-8">
    <h4 className="text-[10px] font-black text-ivory-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
      <div className="w-0.5 h-4 bg-radiant-amber rounded-full" />
      {title}
    </h4>
    {children}
  </div>
);

// --- ANA KATALOG KARTI ---

const HomeSyncProductCard: React.FC<{ product: Product }> = ({ product }) => (
  <div className="group relative rounded-2xl overflow-hidden border border-white/5 transition-all duration-500 hover:border-radiant-amber/30 hover:-translate-y-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
    {/* Görsel Alanı */}
    <div className="relative aspect-square flex items-center justify-center overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-radiant-amber/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <Package size={48} className="text-white/10 group-hover:scale-110 group-hover:text-radiant-amber/30 transition-all duration-500" />
    </div>

    {/* İçerik */}
    <div className="p-5 border-t border-white/5">
      <p className="text-[10px] font-black text-radiant-amber uppercase tracking-[0.2em] mb-1.5">{product.category || 'Ürün'}</p>
      <h3 className="text-ivory-white text-sm font-bold mb-4 line-clamp-2 group-hover:text-radiant-amber transition-colors duration-300">
        {product.name}
      </h3>
      
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] block mb-0.5">Fiyat</span>
          <p className="text-ivory-white font-black text-lg">₺{product.price.toLocaleString('tr-TR')}</p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-radiant-amber text-cosmic-blue flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-300 active:scale-95">
          <ShoppingCart size={17} />
        </button>
      </div>
    </div>
  </div>
);

// --- ANA SAYFA ---

export default function KatalogPage() {
  const categories = ['Tavan Lambaları', 'Masa Lambaları', 'Lambaderler', 'Akıllı Sensörler'];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(66); // 0-100 arasında
  const maxPrice = 25000;
  const currentPrice = (priceRange / 100) * maxPrice;

  const productList: Product[] = [
    { id: '1', slug:'aura-x1', name: 'Aura X-1 Smart Chandelier', description:'Premium avize', price:12450, category:'Tavan Lambaları', imageUrl:'https://images.unsplash.com/photo-1557682260-96771b077396?auto=format&fit=crop&w=800&q=80' },
    { id: '2', slug:'nova-table', name: 'Nova Table Lamp', description:'Modern masa lambası', price:8450, category:'Masa Lambaları', imageUrl:'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=800&q=80' },
    { id: '3', slug:'luna-floor', name: 'Luna Floor Lamp', description:'Stil sahibi lambader', price:6450, category:'Lambaderler', imageUrl:'https://images.unsplash.com/photo-1582719478250-f75bfc581c9b?auto=format&fit=crop&w=800&q=80' },
    { id: '4', slug:'sense-pro', name: 'Sense Pro Smart Sensor', description:'Akıllı sensör', price:3250, category:'Akıllı Sensörler', imageUrl:'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80' },
    { id: '5', slug:'celesta-d', name: 'Celesta D-200 Pendant', description:'İnce tasarım tavan avizesi', price:10800, category:'Tavan Lambaları', imageUrl:'https://images.unsplash.com/photo-1543832927-3f12b6d5c9ee?auto=format&fit=crop&w=800&q=80' },
    { id: '6', slug:'aurora-s', name: 'Aurora Smart Lamp', description:'Akıllı LED masa lambası', price:4950, category:'Masa Lambaları', imageUrl:'https://images.unsplash.com/photo-1582719478250-f75bfc581c9b?auto=format&fit=crop&w=800&q=80' },
  ];

  const filteredProducts = productList.filter((product) => {
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category || '');
    const matchPrice = product.price <= currentPrice;
    return matchCategory && matchPrice;
  });

  // Kategori seçimi
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Filtreleri sıfırla
  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange(66);
  };

  // Ürün sayısı dinamik olarak yönetilir
  const productCount = productList.length;

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #020617 0%, #0A192F 50%, #020617 100%)' }}>
      <div className="max-w-[1400px] mx-auto">
        
        <Breadcrumbs />

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* SOL PANEL (FİLTRELER) */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-32">
              <div className="flex items-center gap-3 mb-8">
                <Filter size={16} className="text-radiant-amber" />
                <h2 className="text-[11px] font-black text-ivory-white uppercase tracking-[0.2em]">Filtreler</h2>
              </div>

              <FilterSection title="KATEGORİLER">
                <ul className="space-y-3">
                  {categories.map((cat) => (
                    <li 
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`text-[11px] font-bold cursor-pointer transition-all duration-200 flex items-center gap-3 group uppercase tracking-wide ${
                        selectedCategories.includes(cat)
                          ? 'text-radiant-amber'
                          : 'text-white/40 group-hover:text-ivory-white'
                      }`}
                    >
                      <div 
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                          selectedCategories.includes(cat)
                            ? 'bg-radiant-amber'
                            : 'border border-white/20 group-hover:bg-radiant-amber group-hover:border-radiant-amber'
                        }`}
                      />
                      {cat}
                    </li>
                  ))}
                </ul>
              </FilterSection>

              <FilterSection title="FİYAT ARALIĞI">
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-radiant-amber mb-4"
                />
                <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-widest">
                  <span>₺0</span>
                  <span>₺{Math.round(currentPrice).toLocaleString('tr-TR')}</span>
                </div>
              </FilterSection>

              <button 
                onClick={clearFilters}
                className="w-full py-2.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:border-radiant-amber hover:text-radiant-amber transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                Filtreleri Temizle
              </button>

              {/* Seçili Filtreler Özeti */}
              {(selectedCategories.length > 0 || priceRange !== 66) && (
                <div className="mt-6 p-4 rounded-xl border border-radiant-amber/20" style={{ background: 'rgba(255,191,0,0.05)' }}>
                  <p className="text-[9px] font-black text-radiant-amber uppercase tracking-[0.2em] mb-2">Aktif Filtreler</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((cat) => (
                      <span key={cat} className="text-radiant-amber text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-wide border border-radiant-amber/20" style={{ background: 'rgba(255,191,0,0.08)' }}>
                        {cat}
                      </span>
                    ))}
                    {priceRange !== 66 && (
                      <span className="text-radiant-amber text-[9px] px-2 py-1 rounded-lg font-black border border-radiant-amber/20" style={{ background: 'rgba(255,191,0,0.08)' }}>
                        Max: ₺{Math.round(currentPrice).toLocaleString('tr-TR')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* SAĞ PANEL (ÜRÜN GRİD) */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 pb-6 border-b border-current/10">
               <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase text-foreground">
                Tüm <span className="text-radiant-amber">Koleksiyon</span>
               </h1>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mt-4 sm:mt-0">{productCount} Ürün Bulundu</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <HomeSyncProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full p-12 text-center rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <Package size={40} className="mx-auto mb-4 text-white/10" />
                  <p className="text-white/30 font-black text-[11px] uppercase tracking-[0.2em]">Seçtiğiniz filtrelere uygun ürün bulunamadı.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}