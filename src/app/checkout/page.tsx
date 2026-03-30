"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
    MapPin,
    CreditCard,
    Receipt,
    ShieldCheck,
    Zap,
    Lock,
    CheckCircle2
} from 'lucide-react';
import { useThemeEffect } from '@/context/ThemeContext';
import { useCartStore, useCartTotal } from '@/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { createOrder } from '@/app/actions/customer/order-actions';
import { useAuth } from '@/context/AuthContext';
import OrbitManager from '@/components/OrbitManager';

type Step = 'ADDRESS' | 'PAYMENT' | 'SUMMARY';

export default function CheckoutPage() {
    const { isLightOn } = useThemeEffect();
    const cart = useCartStore((s) => s.cart);
    const cartTotal = useCartTotal();
    const clearCart = useCartStore((s) => s.clearCart);
    const activeDiscount = useCartStore((s) => s.activeDiscount);
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<Step>('ADDRESS');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    // Form States
    const [addressData, setAddressData] = useState({
        fullName: '',
        phone: '',
        email: '',
        city: '',
        address: ''
    });

    const [paymentData, setPaymentData] = useState({
        cardHolder: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });

    // Validations
    const isAddressValid = addressData.fullName && addressData.phone && addressData.email && addressData.city && addressData.address;
    const isPaymentValid = paymentData.cardHolder && paymentData.cardNumber.length >= 16 && paymentData.expiry && paymentData.cvv.length >= 3;

    const [iyzicoScript, setIyzicoScript] = useState<string | null>(null);

    const handleCompleteOrder = async () => {
        if (!user) return;
        setIsProcessing(true);

        const orderItems = cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            vendorId: item.vendorId || 'demo-vendor'
        }));

        // 1. Create the order in Supabase
        const result = await createOrder(
            user.id,
            orderItems,
            cartTotal,
            addressData
        );

        if (result.success && result.orderId) {
            // 2. Initialize Iyzico Marketplace Payment
            const { initializeMarketplacePayment } = await import('@/app/actions/payment-actions');
            const paymentResult = await initializeMarketplacePayment(result.orderId, user.id);

            setIsProcessing(false);

            if (paymentResult.success && paymentResult.checkoutFormContent) {
                // 3. Render Iyzico Checkout Form
                setIyzicoScript(paymentResult.checkoutFormContent);
                setCurrentStep('SUMMARY'); // Stay on summary but show the form
            } else {
                alert(paymentResult.error || "Ödeme başlatılamadı.");
            }
        } else {
            setIsProcessing(false);
            alert(result.error);
        }
    };

    if (cart.length === 0 && !isSuccess) {
        return (
            <main className={`min-h-screen pt-32 p-6 flex items-center justify-center ${isLightOn ? 'bg-ivory-white text-cosmic-blue' : 'bg-cosmic-blue text-ivory-white'}`}>
                <div className="text-center">
                    <h2 className="text-2xl font-black mb-6">Sepetiniz boş görünüyor.</h2>
                    <Link href="/katalog" className="text-radiant-amber font-black uppercase tracking-widest text-xs hover:opacity-70">Alışverişe Dön</Link>
                </div>
            </main>
        );
    }

    if (isSuccess) {
        return (
            <main className={`min-h-screen flex items-center justify-center p-6 ${isLightOn ? 'bg-ivory-white text-cosmic-blue' : 'bg-cosmic-blue text-ivory-white'}`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full glass p-12 rounded-[48px] border border-green-400/20 bg-green-400/5 text-center"
                >
                    <div className="w-20 h-20 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="text-green-400" size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Sipariş Alındı!</h2>
                    <p className="text-white/40 text-sm mb-10">Ödemeniz başarıyla onaylandı. Sipariş detaylarınıza panelinizden ulaşabilirsiniz.</p>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 animate-pulse">Ana sayfaya yönlendiriliyorsunuz...</div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className={`relative min-h-screen pt-32 pb-24 px-6 md:px-12 transition-all duration-1000 ${isLightOn ? 'bg-ivory-white text-cosmic-blue' : 'bg-cosmic-blue text-ivory-white'}`}>
            <div className="max-w-6xl mx-auto">

                {/* Progress Tracker */}
                <div className="flex items-center justify-between mb-20 max-w-2xl mx-auto relative">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2 z-0" />

                    <StepItem
                        active={currentStep === 'ADDRESS'}
                        completed={currentStep !== 'ADDRESS'}
                        icon={<MapPin size={18} />}
                        label="Teslimat"
                    />
                    <StepItem
                        active={currentStep === 'PAYMENT'}
                        completed={currentStep === 'SUMMARY'}
                        icon={<CreditCard size={18} />}
                        label="Ödeme"
                    />
                    <StepItem
                        active={currentStep === 'SUMMARY'}
                        completed={false}
                        icon={<Receipt size={18} />}
                        label="Özet"
                    />
                </div>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Left Column: Form Steps */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {currentStep === 'ADDRESS' && (
                                <motion.div
                                    key="address"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-10"
                                >
                                    <h1 className="text-4xl font-black tracking-tighter">Teslimat Adresi</h1>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputGroup label="Ad Soyad" placeholder="Ahmet Yılmaz" value={addressData.fullName} onChange={(v) => setAddressData({ ...addressData, fullName: v })} />
                                        <InputGroup label="E-posta" placeholder="ahmet@homesync.com" type="email" value={addressData.email} onChange={(v) => setAddressData({ ...addressData, email: v })} />
                                        <InputGroup label="Telefon" placeholder="05XX XXX XX XX" type="tel" value={addressData.phone} onChange={(v) => setAddressData({ ...addressData, phone: v })} />
                                        <InputGroup label="Şehir" placeholder="İstanbul" value={addressData.city} onChange={(v) => setAddressData({ ...addressData, city: v })} />
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4 mb-2 block">Açık Adres</label>
                                            <textarea
                                                className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 px-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium placeholder:text-white/5 min-h-[120px]"
                                                placeholder="Sokak, No, Daire..."
                                                value={addressData.address}
                                                onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        disabled={!isAddressValid}
                                        onClick={() => setCurrentStep('PAYMENT')}
                                        className="w-full py-6 bg-radiant-amber text-cosmic-blue font-black rounded-[24px] hover:shadow-glow transition-all flex items-center justify-center gap-3 uppercase text-[11px] tracking-[0.3em] disabled:opacity-30"
                                    >
                                        Ödeme Adımına Geç <ChevronRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {currentStep === 'PAYMENT' && (
                                <motion.div
                                    key="payment"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-10"
                                >
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setCurrentStep('ADDRESS')} className="text-white/20 hover:text-white transition-colors"><ChevronLeft size={24} /></button>
                                        <h1 className="text-4xl font-black tracking-tighter">Ödeme Yöntemi</h1>
                                    </div>

                                    <div className="glass p-8 rounded-[40px] border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent mb-10">
                                        <div className="flex justify-between items-start mb-12">
                                            <div className="w-12 h-12 bg-radiant-amber/10 rounded-xl flex items-center justify-center border border-radiant-amber/20">
                                                <Zap className="text-radiant-amber" size={24} />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-10 h-6 bg-white/10 rounded-md" />
                                                <div className="w-10 h-6 bg-white/10 rounded-md" />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Kart Numarası</label>
                                                <input
                                                    className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-xl font-mono tracking-widest text-white focus:outline-none focus:border-radiant-amber/40"
                                                    placeholder="0000 0000 0000 0000"
                                                    maxLength={16}
                                                    value={paymentData.cardNumber}
                                                    onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <InputGroup label="S.K.T" placeholder="MM/YY" value={paymentData.expiry} onChange={(v) => setPaymentData({ ...paymentData, expiry: v })} />
                                                <InputGroup label="CVV" placeholder="***" type="password" maxLength={3} value={paymentData.cvv} onChange={(v) => setPaymentData({ ...paymentData, cvv: v })} />
                                            </div>
                                            <InputGroup label="Kart Üzerindeki İsim" placeholder="AHMET YILMAZ" value={paymentData.cardHolder} onChange={(v) => setPaymentData({ ...paymentData, cardHolder: v })} />
                                        </div>
                                    </div>

                                    <button
                                        disabled={!isPaymentValid}
                                        onClick={() => setCurrentStep('SUMMARY')}
                                        className="w-full py-6 bg-radiant-amber text-cosmic-blue font-black rounded-[24px] hover:shadow-glow transition-all flex items-center justify-center gap-3 uppercase text-[11px] tracking-[0.3em] disabled:opacity-30"
                                    >
                                        Siparişi Gözden Geçir <ChevronRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {currentStep === 'SUMMARY' && (
                                <motion.div
                                    key="summary"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-10"
                                >
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setCurrentStep('PAYMENT')} className="text-white/20 hover:text-white transition-colors"><ChevronLeft size={24} /></button>
                                        <h1 className="text-4xl font-black tracking-tighter">Sipariş Özeti</h1>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="glass p-8 rounded-[40px] border border-white/10 flex justify-between items-start">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-radiant-amber">
                                                    <MapPin size={14} /> Teslimat Bilgileri
                                                </div>
                                                <div>
                                                    <p className="font-bold">{addressData.fullName}</p>
                                                    <p className="text-sm opacity-40">{addressData.address}</p>
                                                    <p className="text-sm opacity-40">{addressData.city}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setCurrentStep('ADDRESS')} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-radiant-amber transition-colors">Düzenle</button>
                                        </div>

                                        <div className="glass p-8 rounded-[40px] border border-white/10 flex justify-between items-start">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-radiant-amber">
                                                    <CreditCard size={14} /> Ödeme Bilgileri
                                                </div>
                                                <div>
                                                    <p className="font-bold">**** **** **** {paymentData.cardNumber.slice(-4)}</p>
                                                    <p className="text-sm opacity-40 uppercase tracking-widest">{paymentData.cardHolder}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setCurrentStep('PAYMENT')} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-radiant-amber transition-colors">Düzenle</button>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-radiant-amber/10 border border-radiant-amber/20 rounded-[32px] flex items-center gap-6">
                                        <ShieldCheck className="text-radiant-amber" size={32} />
                                        <div className="text-[10px] font-bold uppercase tracking-widest leading-loose">
                                            Siparişi tamamlayarak Kullanım Koşulları ve KVKK metinlerini okuduğunuzu ve onayladığınızı kabul etmiş olursunuz.
                                        </div>
                                    </div>

                                    {iyzicoScript ? (
                                        <div className="space-y-6">
                                            <div className="p-8 glass border border-radiant-amber/30 rounded-[40px] bg-radiant-amber/5">
                                                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                                    <CreditCard className="text-radiant-amber" /> Güvenli Ödeme
                                                </h3>
                                                <div id="iyzipay-checkout-form" className="iyzipay-checkout-form" dangerouslySetInnerHTML={{ __html: iyzicoScript }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            disabled={isProcessing}
                                            onClick={handleCompleteOrder}
                                            className="w-full py-6 bg-radiant-amber text-cosmic-blue font-black rounded-[24px] hover:shadow-glow transition-all flex items-center justify-center gap-3 uppercase text-[11px] tracking-[0.3em] disabled:opacity-50"
                                        >
                                            {isProcessing ? (
                                                <div className="w-5 h-5 border-2 border-cosmic-blue border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>Ödemeyi Onayla ve Bitir <ShieldCheck size={18} /></>
                                            )}
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Mini Cart Summary */}
                    <div className="lg:w-96">
                        <div className="glass p-8 rounded-[48px] border border-white/10 sticky top-32 overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Lock size={120} />
                            </div>

                            <h4 className="text-xs font-black uppercase tracking-[0.4em] opacity-40 mb-8">Siparişiniz</h4>

                            <div className="space-y-6 mb-12 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center border border-white/10 text-[10px] font-black">
                                                {item.quantity}x
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold truncate max-w-[120px]">{item.name}</p>
                                                <p className="text-[10px] opacity-40 uppercase tracking-widest font-black">Premium Seri</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold">{(item.price * item.quantity).toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-8 border-t border-white/5 mb-8">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                                    <span>Ara Toplam</span>
                                    <span>{cartTotal.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-green-400">
                                    <span>Kargo</span>
                                    <span>ÜCRETSİZ</span>
                                </div>
                                <div className="flex justify-between items-end pt-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Toplam</span>
                                    <div className="text-right">
                                        {activeDiscount > 0 && (
                                            <p className="text-xs line-through opacity-40 font-bold mb-1">
                                                {(cartTotal / (1 - activeDiscount / 100)).toLocaleString('tr-TR')} ₺
                                            </p>
                                        )}
                                        <span className="text-3xl font-black text-radiant-amber">{cartTotal.toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                </div>
                                {activeDiscount > 0 && (
                                    <div className="text-[9px] font-black uppercase tracking-widest text-radiant-amber text-right mt-2">
                                        %{activeDiscount} Yerçekimsiz İndirim Uygulandı
                                    </div>
                                )}
                            </div>

                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                                <ShieldCheck className="text-radiant-amber/30 shrink-0" size={20} />
                                <p className="text-[9px] font-bold uppercase tracking-wider text-white/30 leading-relaxed">Verileriniz SSL ile şifrelenir.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <OrbitManager />
        </main>
    );
}

const StepItem = ({ active, completed, icon, label }: { active: boolean, completed: boolean, icon: React.ReactNode, label: string }) => {
    return (
        <div className="flex flex-col items-center gap-4 relative z-10 group">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-700 ${active
                ? 'bg-radiant-amber border-radiant-amber text-cosmic-blue shadow-glow scale-110'
                : completed
                    ? 'bg-green-400 border-green-400 text-cosmic-blue'
                    : 'glass border-white/10 text-white/20'
                }`}>
                {completed ? <CheckCircle2 size={24} /> : icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 ${active ? 'text-radiant-amber' : completed ? 'text-green-400' : 'opacity-20'
                }`}>
                {label}
            </span>
        </div>
    );
};

const InputGroup = ({ label, placeholder, type = 'text', value, onChange, maxLength }: { label: string, placeholder: string, type?: string, value: string, onChange: (v: string) => void, maxLength?: number }) => {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">{label}</label>
            <input
                type={type}
                required
                maxLength={maxLength}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 px-6 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-medium placeholder:text-white/5"
            />
        </div>
    );
};
