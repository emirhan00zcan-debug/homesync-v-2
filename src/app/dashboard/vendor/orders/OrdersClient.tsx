'use client';

import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, Search, RotateCw, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

type OrderStatus = 'yeni' | 'hazirlaniyor' | 'kargoda' | 'teslim_edildi' | 'iptal';

export interface OrderItemType {
    id: string;
    quantity: number;
    unit_price: number;
    vendor_earning: number;
    created_at: string;
    orders: {
        id: string;
        status: OrderStatus | string;
        created_at: string;
        tracking_number: string | null;
        user_id: string;
        profiles?: {
            full_name: string | null;
        };
    };
    products: {
        name: string;
        category: string;
    };
}

const TABS = [
    { id: 'all', label: 'Tümü', icon: Package },
    { id: 'yeni', label: 'Yeni', icon: Clock },
    { id: 'hazirlaniyor', label: 'Hazırlanıyor', icon: RotateCw },
    { id: 'kargoda', label: 'Kargoya Verildi', icon: Truck },
    { id: 'teslim_edildi', label: 'Teslim Edildi', icon: CheckCircle },
];

export default function OrdersClient({ initialItems }: { initialItems: OrderItemType[] }) {
    const router = useRouter();
    const [items, setItems] = useState<OrderItemType[]>(initialItems);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
    // Keep state in sync with server updates (realtime fetch trigger)
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    useEffect(() => {
        const channel = supabase
            .channel('vendor-orders')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'order_items' },
                (payload) => {
                    console.log('New order item!', payload);
                    router.refresh();
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('Updated order!', payload);
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router]);
    const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

    const filteredItems = items.filter(item => {
        const order = item.orders;
        const normalizedStatus = (order?.status?.toLowerCase() || 'yeni') as string;

        // Tab filtering
        if (activeTab !== 'all') {
            if (activeTab === 'yeni' && normalizedStatus !== 'yeni' && normalizedStatus !== 'pending') return false;
            if (activeTab !== 'yeni' && normalizedStatus !== activeTab) return false;
        }

        // Search filtering (product name, customer name, order id)
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            const productName = item.products?.name?.toLowerCase() || '';
            const customerName = order?.profiles?.full_name?.toLowerCase() || '';
            const orderId = order?.id?.toLowerCase() || '';

            if (!productName.includes(searchLower) &&
                !customerName.includes(searchLower) &&
                !orderId.includes(searchLower)) {
                return false;
            }
        }

        return true;
    });

    const handleUpdateStatus = async (orderId: string, itemId: string, newStatus: OrderStatus) => {
        try {
            setLoadingIds(prev => new Set(prev).add(itemId));
            const trackingNumber = trackingInputs[itemId] || null;

            if (newStatus === 'kargoda' && !trackingNumber) {
                alert('Lütfen kargo takip numarası giriniz.');
                return;
            }

            const updateData: any = { status: newStatus };
            if (trackingNumber) {
                updateData.tracking_number = trackingNumber;
            }

            const { error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId);

            if (error) throw error;

            // Optimistic update
            setItems(prevItems =>
                prevItems.map(item => {
                    if (item.id === itemId) {
                        return {
                            ...item,
                            orders: {
                                ...item.orders,
                                status: newStatus,
                                tracking_number: trackingNumber || item.orders.tracking_number
                            }
                        };
                    }
                    return item;
                })
            );

        } catch (error) {
            console.error('Error updating status:', error);
            alert('Durum güncellenirken bir hata oluştu');
        } finally {
            setLoadingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const s = status?.toLowerCase() || 'yeni';
        const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
            yeni: { label: 'Yeni', color: '#fff', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
            pending: { label: 'Yeni', color: '#fff', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
            hazirlaniyor: { label: 'Hazırlanıyor', color: '#FFBF00', bg: 'rgba(255,191,0,0.1)', border: 'rgba(255,191,0,0.2)' },
            kargoda: { label: 'Kargoda', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' },
            teslim_edildi: { label: 'Teslim Edildi', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
            iptal: { label: 'İptal', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
            cancelled: { label: 'İptal', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
        };
        const badge = map[s] || { label: s, color: '#fff', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
        return (
            <span className="inline-flex px-3 py-1.5 rounded-[10px] text-[9px] font-black uppercase tracking-[0.2em] border"
                style={{ color: badge.color, background: badge.bg, borderColor: badge.border }}>
                {badge.label}
            </span>
        );
    };

    return (
        <div className="space-y-8">
            {/* Controls */}
            <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center p-2">
                {/* Tabs */}
                <div className="flex overflow-x-auto w-full xl:w-auto scrollbar-hide gap-3 pb-2 xl:pb-0">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 px-5 py-3 rounded-[16px] text-[11px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap border
                                    ${isActive
                                        ? 'bg-radiant-amber text-cosmic-blue border-radiant-amber shadow-glow transform scale-[1.02]'
                                        : 'glass bg-white/[0.02] text-white/50 border-white/5 hover:bg-white/[0.05] hover:text-white'
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                                {tab.id !== 'all' && (
                                    <span style={{
                                        background: isActive ? 'rgba(10,25,47,0.15)' : 'rgba(255,255,255,0.05)',
                                        color: isActive ? '#0A192F' : 'rgba(255,255,255,0.4)'
                                    }} className="ml-1.5 px-2 py-0.5 rounded-md text-[9px]">
                                        {items.filter(i => {
                                            const s = (i.orders?.status?.toLowerCase() || 'yeni');
                                            if (tab.id === 'yeni') return s === 'yeni' || s === 'pending';
                                            return s === tab.id;
                                        }).length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="relative w-full xl:w-72 shrink-0 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-radiant-amber transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Müşteri, ürün veya sipariş no..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full glass bg-white/[0.02] border border-white/5 group-hover:border-white/10 rounded-2xl py-3 pl-11 pr-4 text-[11px] font-black tracking-widest text-white placeholder-white/30 focus:outline-none focus:border-radiant-amber/50 transition-all"
                    />
                </div>
            </div>

            {/* Orders List */}
            <div className="flex flex-col gap-6">
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-6 glass rounded-[32px] border border-white/5 bg-white/[0.01]">
                        <Package className="text-white/10 mb-6 drop-shadow-glow" size={48} />
                        <p className="text-xl font-black text-white tracking-tight mb-2">Sipariş Bulunamadı</p>
                        <p className="text-white/40 text-sm font-medium">Bu görünümde kriterinize uygun herhangi bir sipariş yok.</p>
                    </div>
                ) : (
                    filteredItems.map(item => {
                        const order = item.orders;
                        const product = item.products;
                        const currentStatus = order?.status?.toLowerCase() || 'yeni';
                        const isKargoda = currentStatus === 'kargoda';
                        const isTeslimEdildi = currentStatus === 'teslim_edildi';
                        const isIptal = currentStatus === 'iptal' || currentStatus === 'cancelled';
                        const isLoading = loadingIds.has(item.id);

                        return (
                            <div key={item.id} className="p-6 md:p-8 rounded-[28px] border border-white/5 glass bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.03] transition-all duration-500 overflow-hidden relative group">
                                {/* Ambient Accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-radiant-amber/5 blur-[80px] group-hover:bg-radiant-amber/10 transition-colors pointer-events-none" />

                                {/* Top Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6 mb-6 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 group-hover:bg-radiant-amber/10 group-hover:border-radiant-amber/30 group-hover:text-radiant-amber transition-all">
                                            <Package size={22} className="text-white/50 group-hover:text-radiant-amber transition-colors" />
                                        </div>
                                        <div>
                                            {order?.id && (
                                                <p className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase mb-1">
                                                    Sipariş No: #{order.id.split('-')[0]}
                                                </p>
                                            )}
                                            {order?.profiles?.full_name && (
                                                <p className="text-sm font-black text-white flex items-center gap-2">
                                                    <User size={14} className="text-radiant-amber" />
                                                    {order.profiles.full_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        {order?.created_at && (
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-black mb-1">Tarih</p>
                                                <p className="text-xs font-bold text-white/70">
                                                    {new Date(order.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        )}
                                        <StatusBadge status={currentStatus} />
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
                                    {/* Product Info */}
                                    <div className="flex-1 space-y-3 min-w-0">
                                        <p className="text-[9px] text-white/40 uppercase tracking-[0.3em] font-black mb-2">Ürün Detayları</p>
                                        <div className="glass rounded-[20px] p-5 border border-white/5 bg-white/[0.01]">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    {product?.name && (
                                                        <p className="font-black text-sm text-white">{product.name}</p>
                                                    )}
                                                    {product?.category && (
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-radiant-amber mt-1">
                                                            {product.category}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-lg font-black text-white tracking-tight">
                                                        {(Number(item.unit_price) * Number(item.quantity)).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                                                        {item.quantity} Adet Satıldı
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions & Tracking */}
                                    <div className="w-full lg:w-80 space-y-4 shrink-0">
                                        {!isTeslimEdildi && !isIptal && (
                                            <>
                                                {/* Only hazirlaniyor status needs or allows tracking input ideally */}
                                                {(currentStatus === 'hazirlaniyor' || isKargoda) && (
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] text-white/40 uppercase tracking-[0.3em] font-black ml-1">Kargo Takip No</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Örn: TR-1234567890"
                                                            value={trackingInputs[item.id] !== undefined ? trackingInputs[item.id] : (order?.tracking_number || '')}
                                                            onChange={(e) => setTrackingInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                            className="w-full glass bg-white/[0.02] border border-white/10 rounded-2xl py-3 px-4 text-[11px] font-black tracking-widest text-white placeholder-white/20 focus:outline-none focus:border-radiant-amber/50 transition-colors"
                                                            disabled={isKargoda || isLoading}
                                                        />
                                                    </div>
                                                )}

                                                <div className="pt-2">
                                                    {(currentStatus === 'yeni' || currentStatus === 'pending') ? (
                                                        <button
                                                            onClick={() => handleUpdateStatus(order.id, item.id, 'hazirlaniyor')}
                                                            disabled={isLoading}
                                                            className="w-full py-3.5 glass bg-white/[0.02] hover:bg-radiant-amber/10 hover:border-radiant-amber/30 text-white hover:text-radiant-amber border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-50"
                                                        >
                                                            {isLoading ? 'İşleniyor...' : 'Siparişi Hazırla'}
                                                        </button>
                                                    ) : currentStatus === 'hazirlaniyor' ? (
                                                        <button
                                                            onClick={() => handleUpdateStatus(order.id, item.id, 'kargoda')}
                                                            disabled={isLoading}
                                                            className="w-full flex gap-3 justify-center items-center py-3.5 bg-radiant-amber text-cosmic-blue shadow-glow rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                                                        >
                                                            <Truck size={16} />
                                                            {isLoading ? 'İşleniyor...' : 'Kargoya Verildi Olarak İşaretle'}
                                                        </button>
                                                    ) : isKargoda ? (
                                                        <button
                                                            disabled
                                                            className="w-full flex gap-3 justify-center items-center py-3.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl text-[11px] font-black uppercase tracking-widest opacity-60 cursor-not-allowed"
                                                        >
                                                            <CheckCircle size={16} />
                                                            Kargo Gönderildi
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </>
                                        )}

                                        {(isTeslimEdildi || isIptal) && (
                                            <div className="h-full flex items-center justify-center p-5 glass bg-white/[0.01] rounded-[20px] border border-white/5">
                                                {isTeslimEdildi ? (
                                                    <div className="text-center text-emerald-400">
                                                        <CheckCircle className="mx-auto mb-3 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]" size={28} />
                                                        <p className="text-[11px] font-black uppercase tracking-widest">Sipariş Tamamlandı</p>
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-red-400">
                                                        <Search className="mx-auto mb-3" size={28} />
                                                        <p className="text-[11px] font-black uppercase tracking-widest">Sipariş İptal Edildi</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
