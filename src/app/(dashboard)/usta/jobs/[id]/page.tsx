"use client";

import React, { use } from 'react';
import { MapPin, Navigation, Phone, User, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock data (in real app, this would come from an API/Supabase)
const jobData = {
    id: "123",
    customerName: "Ahmet Yılmaz",
    phone: "+90 555 123 45 67",
    address: "Atatürk Mah. İstiklal Cad. No:14 D:5 Ataşehir/İstanbul",
    lat: 40.9876,
    lng: 29.1234,
    date: "Bugün",
    time: "14:30 - 15:30",
    status: "pending",
    products: [
        { name: "Kozmik Sarkıt Avize Kurulumu", qty: 1 },
        { name: "Akıllı LED Panel Montajı", qty: 2 }
    ],
    notes: "Müşteri zili bozuk, geldiğinizde lütfen arayın. Siteye girişte güvenliğe 'Aydınlatma Montajı' için geldiğinizi belirtin."
};

export default function UstaJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // React 19 / Next 15: Unwrap params
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;

    // Google Maps Link with coordinates
    const mapsUrl = `https://maps.google.com/?q=${jobData.lat},${jobData.lng}`;

    return (
        <div className="pb-24 max-w-md mx-auto min-h-screen bg-[#0A192F]">
            {/* Native-Like Header Sticky */}
            <header className="sticky top-0 z-50 bg-[#0A192F]/90 backdrop-blur-md border-b border-white/10 px-4 py-4 flex items-center">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-white/70 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="ml-2 flex flex-col">
                    <h1 className="text-lg font-bold text-white leading-tight">İş Detayı</h1>
                    <span className="text-white/50 text-xs">#{id.substring(0, 8)}</span>
                </div>
            </header>

            <div className="p-4 space-y-6">

                {/* Status & Time */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                    <div className="flex flex-col">
                        <span className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Randevu Zamanı</span>
                        <div className="flex items-center text-white font-medium text-lg">
                            <Clock size={18} className="text-orange-400 mr-2" />
                            {jobData.date}, {jobData.time}
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 shadow-lg">
                    <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider">Müşteri Bilgileri</h2>

                    <div className="flex items-center text-white">
                        <div className="w-12 h-12 rounded-full bg-orange-400/20 flex items-center justify-center mr-4 text-orange-400 shrink-0">
                            <User size={24} />
                        </div>
                        <div>
                            <p className="font-semibold text-lg">{jobData.customerName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-white/5 mt-4 text-sm">
                        <a
                            href={`tel:${jobData.phone.replace(/\s+/g, '')}`}
                            className="flex-1 bg-[#1A2942] hover:bg-[#233554] border border-white/10 transition-colors py-3.5 rounded-xl flex items-center justify-center text-white font-medium"
                        >
                            <Phone size={18} className="mr-2 text-green-400" />
                            Ara
                        </a>
                        <a
                            href={`https://wa.me/${jobData.phone.replace(/[\s+]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-[#1A2942] hover:bg-[#233554] border border-white/10 transition-colors py-3.5 rounded-xl flex items-center justify-center text-white font-medium"
                        >
                            WhatsApp
                        </a>
                    </div>
                </div>

                {/* Address & Navigation (Kritik Özellik) */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 shadow-lg">
                    <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider">Konum Bilgisi</h2>

                    <div className="flex items-start text-white/90 text-[15px] leading-relaxed">
                        <MapPin size={20} className="text-orange-400 mr-3 mt-0.5 shrink-0" />
                        <p>{jobData.address}</p>
                    </div>

                    {/* BIG CTA for Maps */}
                    <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-4 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(249,115,22,0.25)] border border-orange-400/50"
                    >
                        <Navigation size={22} className="mr-2" />
                        Yol Tarifi Al
                    </a>
                </div>

                {/* Job Content / Products */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 shadow-lg">
                    <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider">Alınan Hizmetler & Ürünler</h2>
                    <ul className="space-y-3">
                        {jobData.products.map((p, idx) => (
                            <li key={idx} className="flex justify-between items-center text-white/90 px-1">
                                <span className="text-[15px]">{p.name}</span>
                                <span className="text-orange-400 font-bold bg-orange-400/10 px-2.5 py-0.5 flex items-center justify-center rounded-lg min-w-[36px]">
                                    {p.qty}x
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Notes */}
                {jobData.notes && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
                        <div className="flex items-center mb-2">
                            <h2 className="text-orange-400 text-xs font-bold uppercase tracking-wider">Müşteri Notu</h2>
                        </div>
                        <p className="text-white/80 text-[15px] italic leading-relaxed">{jobData.notes}</p>
                    </div>
                )}

                {/* Action Button - Start Job */}
                <div className="pt-6 pb-2">
                    <button className="w-full bg-white text-[#0A192F] hover:bg-gray-200 active:bg-gray-300 font-black py-4.5 rounded-xl flex items-center justify-center transition-transform active:scale-[0.98] text-[17px] shadow-xl">
                        <CheckCircle size={22} className="mr-2" />
                        İşe Başla
                    </button>
                    <p className="text-center text-white/40 text-[13px] mt-4 mb-2">
                        Müşterinin konumuna ulaştığınızda bu butona basarak süreci başlatın.
                    </p>
                </div>

            </div>
        </div>
    );
}
