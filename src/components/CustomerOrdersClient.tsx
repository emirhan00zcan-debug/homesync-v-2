"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, PackageOpen, CheckCircle, Clock } from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
    id: string;
    quantity: number;
    unit_price: number;
    products: {
        id: string;
        name: string;
        image_url: string;
    } | null;
}

interface Order {
    id: string;
    total_amount: number;
    status: string;
    payment_status?: string;
    created_at: string;
    order_items: OrderItem[];
}

interface CustomerOrdersClientProps {
    orders: Order[];
}

const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending':
        case 'hazırlanıyor':
            return <Clock className="text-blue-400" size={20} />;
        case 'shipped':
        case 'kargoda':
            return <PackageOpen className="text-radiant-amber" size={20} />;
        case 'delivered':
        case 'teslim edildi':
            return <CheckCircle className="text-green-400" size={20} />;
        default:
            return <Clock className="text-white/40" size={20} />;
    }
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending':
        case 'hazırlanıyor':
            return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        case 'shipped':
        case 'kargoda':
            return 'text-radiant-amber bg-radiant-amber/10 border-radiant-amber/20';
        case 'delivered':
        case 'teslim edildi':
            return 'text-green-400 bg-green-400/10 border-green-400/20';
        default:
            return 'text-white/60 bg-white/10 border-white/20';
    }
};

export default function CustomerOrdersClient({ orders }: CustomerOrdersClientProps) {
    return (
        <div className="p-8 lg:p-12">
            <header className="mb-12">
                <p className="text-radiant-amber text-[10px] font-black uppercase tracking-[0.4em] mb-3">Sipariş Geçmişi</p>
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Siparişlerim</h1>
                <p className="text-white/40 text-sm mt-4 tracking-wide max-w-lg">HomeSync üzerinden verdiğiniz tüm siparişleri ve güncel kargo durumlarını buradan takip edebilirsiniz.</p>
            </header>

            <div className="space-y-6">
                {orders.length === 0 ? (
                    <div className="glass p-12 rounded-[32px] border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <ShoppingBag className="text-white/20" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Henüz siparişiniz bulunmuyor</h3>
                        <p className="text-sm text-white/40">Mağazamızı ziyaret ederek ilk siparişinizi oluşturabilirsiniz.</p>
                    </div>
                ) : (
                    orders.map((order, i) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass p-6 md:p-8 rounded-[32px] border border-white/5 bg-white/[0.02]"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/10">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Sipariş #{order.id.slice(0, 8)}</h3>
                                    <p className="text-xs text-white/40 font-medium uppercase tracking-widest">
                                        {new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Toplam Tutar</p>
                                        <p className="text-xl font-black text-radiant-amber">{order.total_amount.toLocaleString('tr-TR')} ₺</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        <span className="text-[11px] font-black uppercase tracking-widest">{order.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {order.order_items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-6 p-4 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5">
                                        <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-white/5">
                                            {item.products?.image_url ? (
                                                <Image
                                                    src={item.products.image_url}
                                                    alt={item.products.name || 'Product Image'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <PackageOpen className="text-white/20" size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-white mb-1">{item.products?.name || 'Bilinmeyen Ürün'}</p>
                                            <p className="text-xs tracking-wider text-white/40 font-medium">Miktar: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-white">{(item.unit_price * item.quantity).toLocaleString('tr-TR')} ₺</p>
                                            {item.quantity > 1 && (
                                                <p className="text-[10px] text-white/40 mt-1">Birim: {item.unit_price.toLocaleString('tr-TR')} ₺</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full animate-pulse ${order.payment_status === 'paid' ? 'bg-radiant-amber' : order.payment_status === 'approved' ? 'bg-green-400' : 'bg-white/20'}`} />
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                        Ödeme Durumu: <span className="text-white opacity-100">{order.payment_status === 'paid' ? 'GÜVENLİ HAVUZDA' : order.payment_status === 'approved' ? 'USTAYA AKTARILDI' : 'BEKLEMEDE'}</span>
                                    </p>
                                </div>

                                {order.payment_status === 'paid' && (
                                    <button
                                        onClick={async () => {
                                            const { confirmOrderPayment } = await import('@/app/actions/payment-actions');
                                            const res = await confirmOrderPayment(order.id);
                                            if (res.success) {
                                                alert("Ödeme onaylandı ve ustaya aktarıldı.");
                                                window.location.reload();
                                            } else {
                                                alert(res.error);
                                            }
                                        }}
                                        className="px-8 py-4 bg-green-400 text-cosmic-blue font-black rounded-2xl hover:shadow-[0_0_30px_rgba(74,222,128,0.3)] transition-all uppercase text-[10px] tracking-widest flex items-center gap-2"
                                    >
                                        İŞİ ONAYLA VE ÖDEMEYİ AKTAR <CheckCircle size={16} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}

