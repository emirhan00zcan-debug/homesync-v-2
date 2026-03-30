'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CustomerServiceRequestsClient({ customerId }: { customerId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [serviceType, setServiceType] = useState('Aydınlatma Kurulumu');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('service_requests')
                .insert({
                    customer_id: customerId,
                    service_type: serviceType,
                    description: description,
                    status: 'yeni'
                });

            if (error) throw error;
            alert('İş talebiniz başarıyla oluşturuldu! Anında ustalara iletildi (Realtime Test)');
            setDescription('');
            router.refresh();
        } catch (error: any) {
            console.error('Error creating request:', error);
            alert('Talep oluşturulurken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-black text-white mb-6">Yeni İş Talebi Oluştur (Test)</h1>
            <p className="text-white/50 mb-8">Bu formdan oluşturulan talepler anında Usta paneline (WebSocket ile) düşecektir.</p>

            <form onSubmit={handleSubmit} className="space-y-6 glass p-8 rounded-3xl border border-white/10">
                <div>
                    <label className="block text-sm font-bold text-white/70 mb-2">Hizmet Türü</label>
                    <select
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-radiant-amber"
                    >
                        <option value="Aydınlatma Kurulumu">Aydınlatma Kurulumu</option>
                        <option value="Akıllı Ev Entegrasyonu">Akıllı Ev Entegrasyonu</option>
                        <option value="Ürün Montajı">Ürün Montajı</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-white/70 mb-2">Detay (İsteğe Bağlı)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Örn: Avize montajı yapılacak, yüksek tavan..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-radiant-amber h-32"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-radiant-amber text-cosmic-blue font-black tracking-widest uppercase rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                    {loading ? 'Gönderiliyor...' : 'Talebi Gönder'}
                </button>
            </form>
        </div>
    );
}
