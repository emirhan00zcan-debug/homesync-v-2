"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Tag, Plus, Trash2 } from 'lucide-react';
import { TURKEY_DATA } from '@/lib/turkey-data';

const CATEGORIES = [
    'Aydınlatma Kurulumu',
    'Elektrik Tesisatı',
    'Boya & Badana',
    'Su Tesisatı',
    'Isıtma/Soğutma',
    'Akıllı Ev Sistemleri',
    'Güvenlik Kamerası',
    'Döşeme & Zemin',
    'Mobilya Montajı',
    'Diğer',
];

const supabase = createClient();

interface UstaService {
    id: string;
    usta_id: string;
    category: string;
    min_price: number | null;
    max_price: number | null;
    is_active: boolean;
}

interface UstaServiceArea {
    id: string;
    usta_id: string;
    city: string;
    district: string;
}

export default function TechnicianAreaPage() {
    const { user } = useAuth();
    const [services, setServices] = useState<UstaService[]>([]);
    const [areas, setAreas] = useState<UstaServiceArea[]>([]);
    const [saving, setSaving] = useState(false);
    const [newArea, setNewArea] = useState({ city: '', district: '' });
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [prices, setPrices] = useState({ min: '', max: '' });

    const fetchData = useCallback(async () => {
        if (!user) return;
        const [{ data: svc }, { data: area }] = await Promise.all([
            supabase.from('usta_services').select('*').eq('usta_id', user.id),
            supabase.from('usta_service_areas').select('*').eq('usta_id', user.id).order('city'),
        ]);
        setServices(svc ?? []);
        setAreas(area ?? []);
    }, [user]);

    useEffect(() => {
        if (!user) return;
        let isMounted = true;
        fetchData().finally(() => { if (!isMounted) return; });
        return () => { isMounted = false; };
    }, [fetchData]);

    const addService = async () => {
        if (!user || !selectedCategory) return;
        setSaving(true);
        await supabase.from('usta_services').upsert({
            usta_id: user.id,
            category: selectedCategory,
            min_price: prices.min ? Number(prices.min) : null,
            max_price: prices.max ? Number(prices.max) : null,
            is_active: true,
        }, { onConflict: 'usta_id,category' });
        setSelectedCategory(null);
        setPrices({ min: '', max: '' });
        fetchData();
        setSaving(false);
    };

    const removeService = async (id: string) => {
        await supabase.from('usta_services').delete().eq('id', id);
        setServices(prev => prev.filter(s => s.id !== id));
    };

    const addArea = async () => {
        if (!user || !newArea.city || !newArea.district) return;
        setSaving(true);
        await supabase.from('usta_service_areas').upsert({
            usta_id: user.id,
            city: newArea.city,
            district: newArea.district,
        }, { onConflict: 'usta_id,city,district' });
        setNewArea({ city: '', district: '' });
        fetchData();
        setSaving(false);
    };

    const removeArea = async (id: string) => {
        await supabase.from('usta_service_areas').delete().eq('id', id);
        setAreas(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Hizmet Ayarları</p>
                <h1 className="text-4xl font-black text-white tracking-tighter">Bölge & Kategoriler</h1>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hizmet Kategorileri */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border space-y-4"
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
                >
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-amber-400 flex items-center gap-2">
                        <Tag size={12} /> Hizmet Kategorilerim
                    </h2>

                    {/* Add service */}
                    <div className="space-y-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                        <select
                            value={selectedCategory ?? ''}
                            onChange={e => setSelectedCategory(e.target.value || null)}
                            className="w-full px-3 py-2.5 rounded-xl text-sm text-white border border-white/10 bg-white/5 focus:outline-none focus:border-amber-400/50"
                        >
                            <option value="" className="bg-[#0A192F]">Kategori seçin...</option>
                            {CATEGORIES.filter(c => !services.find(s => s.category === c)).map(c => (
                                <option key={c} value={c} className="bg-[#0A192F]">{c}</option>
                            ))}
                        </select>
                        {selectedCategory && (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min. ₺"
                                    value={prices.min}
                                    onChange={e => setPrices(p => ({ ...p, min: e.target.value }))}
                                    className="flex-1 px-3 py-2 rounded-xl text-sm text-white border border-white/10 bg-white/5 focus:outline-none focus:border-amber-400/50"
                                />
                                <input
                                    type="number"
                                    placeholder="Max. ₺"
                                    value={prices.max}
                                    onChange={e => setPrices(p => ({ ...p, max: e.target.value }))}
                                    className="flex-1 px-3 py-2 rounded-xl text-sm text-white border border-white/10 bg-white/5 focus:outline-none focus:border-amber-400/50"
                                />
                                <button
                                    onClick={addService}
                                    disabled={saving}
                                    className="px-4 py-2 rounded-xl text-sm font-bold text-white shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #FFBF00, #f59e0b)' }}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Service list */}
                    {services.length === 0 ? (
                        <p className="text-white/25 text-sm text-center py-6">Henüz kategori eklenmedi</p>
                    ) : (
                        <div className="space-y-2">
                            {services.map(svc => (
                                <div key={svc.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5">
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white">{svc.category}</p>
                                        {(svc.min_price || svc.max_price) && (
                                            <p className="text-xs text-white/40">
                                                {svc.min_price ? `₺${svc.min_price}` : ''}{svc.min_price && svc.max_price ? ' – ' : ''}{svc.max_price ? `₺${svc.max_price}` : ''}
                                            </p>
                                        )}
                                    </div>
                                    <button onClick={() => removeService(svc.id)} className="text-white/20 hover:text-red-400 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Hizmet Bölgeleri */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 rounded-2xl border space-y-4"
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
                >
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-green-400 flex items-center gap-2">
                        <MapPin size={12} /> Hizmet Bölgelerim
                    </h2>

                    <div className="flex gap-2 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                        <select
                            value={newArea.city}
                            onChange={e => setNewArea({ city: e.target.value, district: '' })}
                            className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white border border-white/10 bg-white/5 focus:outline-none focus:border-green-400/50"
                        >
                            <option value="" className="bg-[#0A192F]">Şehir seçin...</option>
                            {TURKEY_DATA.map(city => (
                                <option key={city.name} value={city.name} className="bg-[#0A192F]">{city.name}</option>
                            ))}
                        </select>
                        <select
                            value={newArea.district}
                            onChange={e => setNewArea(p => ({ ...p, district: e.target.value }))}
                            disabled={!newArea.city}
                            className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white border border-white/10 bg-white/5 focus:outline-none focus:border-green-400/50 disabled:opacity-50"
                        >
                            <option value="" className="bg-[#0A192F]">İlçe seçin...</option>
                            {TURKEY_DATA.find(c => c.name === newArea.city)?.districts.map(district => (
                                <option key={district} value={district} className="bg-[#0A192F]">{district}</option>
                            ))}
                        </select>
                        <button
                            onClick={addArea}
                            disabled={saving || !newArea.city || !newArea.district}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-white shrink-0 disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {/* Area list */}
                    {areas.length === 0 ? (
                        <p className="text-white/25 text-sm text-center py-6">Henüz bölge eklenmedi</p>
                    ) : (
                        <div className="space-y-2">
                            {areas.map(area => (
                                <div key={area.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5">
                                    <MapPin size={13} className="text-green-400 shrink-0" />
                                    <p className="text-sm font-medium text-white flex-1">{area.district}, {area.city}</p>
                                    <button onClick={() => removeArea(area.id)} className="text-white/20 hover:text-red-400 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
