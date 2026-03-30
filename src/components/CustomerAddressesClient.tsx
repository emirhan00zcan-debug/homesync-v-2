"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Trash2, Home, Building2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Address {
    id: string;
    title: string;
    address: string;
    city: string;
    created_at: string;
}

interface CustomerAddressesClientProps {
    initialAddresses: Address[];
    userId: string;
}

export default function CustomerAddressesClient({ initialAddresses, userId }: CustomerAddressesClientProps) {
    const supabase = createClient();
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        city: '',
        address: ''
    });

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: submitError } = await supabase
                .from('addresses')
                .insert([
                    {
                        user_id: userId,
                        title: formData.title,
                        city: formData.city,
                        address: formData.address
                    }
                ])
                .select();

            if (submitError) throw submitError;

            if (data && data.length > 0) {
                setAddresses([data[0], ...addresses]);
                setIsAdding(false);
                setFormData({ title: '', city: '', address: '' });
                router.refresh(); // Update server side
            }
        } catch (err: any) {
            console.error("Adres eklenemedi:", err);
            setError(err.message || 'Adres eklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return;

        try {
            const { error: deleteError } = await supabase
                .from('addresses')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setAddresses(addresses.filter(a => a.id !== id));
            router.refresh();
        } catch (err: any) {
            console.error("Adres silinemedi:", err);
            alert('Adres silinirken bir hata oluştu.');
        }
    };

    const getAddressIcon = (title: string) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('iş') || lowerTitle.includes('ofis')) {
            return <Building2 className="text-white/40" size={24} />;
        }
        return <Home className="text-white/40" size={24} />;
    };

    return (
        <div className="p-8 lg:p-12 relative">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <p className="text-radiant-amber text-[10px] font-black uppercase tracking-[0.4em] mb-3">Teslimat & Fatura</p>
                    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Adres Bilgilerim</h1>
                    <p className="text-white/40 text-sm mt-4 tracking-wide max-w-lg">
                        Sipariş teslimatınız için adres bilgilerinizi yönetin. İsteğinize özel farklı isimlerle kaydedebilirsiniz.
                    </p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-radiant-amber text-cosmic-blue font-black rounded-xl hover:shadow-glow transition-all duration-300"
                    >
                        <Plus size={18} />
                        <span className="text-[10px] uppercase tracking-widest">Yeni Adres Ekle</span>
                    </button>
                )}
            </header>

            {isAdding && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-8 rounded-[32px] border border-radiant-amber/30 bg-radiant-amber/[0.02] mb-12"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white">Yeni Adres Ekle</h3>
                        <button onClick={() => setIsAdding(false)} className="text-[10px] uppercase font-bold text-white/40 hover:text-white transition-colors">
                            İptal
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
                            <AlertCircle size={20} />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleAddAddress} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Adres Başlığı</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ev, İş, vb."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white placeholder:text-white/20 focus:outline-none focus:border-radiant-amber focus:ring-1 focus:ring-radiant-amber transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Şehir</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Şehir adı"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white placeholder:text-white/20 focus:outline-none focus:border-radiant-amber focus:ring-1 focus:ring-radiant-amber transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Açık Adres</label>
                            <textarea
                                required
                                rows={3}
                                placeholder="Mahalle, sokak, bina, kapı no..."
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-radiant-amber focus:ring-1 focus:ring-radiant-amber transition-all resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-14 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all duration-300 ${loading
                                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                    : 'bg-radiant-amber text-cosmic-blue hover:shadow-glow'
                                }`}
                        >
                            {loading ? 'Ekleniyor...' : 'Adresi Kaydet'}
                        </button>
                    </form>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.length === 0 && !isAdding ? (
                    <div className="col-span-1 md:col-span-2 glass p-12 rounded-[32px] border border-white/5 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <MapPin className="text-white/20" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Kayıtlı Adresiniz Yok</h3>
                        <p className="text-sm text-white/40">Henüz bir adres eklemediniz. Sipariş oluşturabilmek için adres ekleyin.</p>
                    </div>
                ) : (
                    addresses.map((addr, i) => (
                        <motion.div
                            key={addr.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass p-8 rounded-[32px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group relative overflow-hidden"
                        >
                            {/* Ambient Glow on Hover */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-radiant-amber/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-full" />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                                            {getAddressIcon(addr.title)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white tracking-wide">{addr.title}</h3>
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{addr.city}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteAddress(addr.id, e)}
                                        className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-50 hover:opacity-100"
                                        title="Adresi Sil"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p className="text-white/60 text-sm leading-relaxed min-h-[60px]">{addr.address}</p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
