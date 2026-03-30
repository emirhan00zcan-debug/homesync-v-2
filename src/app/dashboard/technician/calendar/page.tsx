"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Plus, Trash2, Clock, CheckCircle } from 'lucide-react';

const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

type Availability = {
    id: string;
    day_of_week: number | null;
    start_time: string | null;
    end_time: string | null;
    is_available: boolean;
    specific_date: string | null;
};

const supabase = createClient();

export default function TechnicianCalendarPage() {
    const { user } = useAuth();
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [saving, setSaving] = useState(false);
    const [newSlot, setNewSlot] = useState({ day_of_week: 1, start_time: '09:00', end_time: '18:00' });

    const fetchAvailability = useCallback(async (mounted = true) => {
        if (!user) return;
        const { data } = await supabase
            .from('usta_availability')
            .select('*')
            .eq('usta_id', user.id)
            .is('specific_date', null)
            .order('day_of_week', { ascending: true });
        if (mounted) setAvailability(data ?? []);
    }, [user]);

    useEffect(() => {
        let mounted = true;
        fetchAvailability(mounted);
        return () => { mounted = false; };
    }, [fetchAvailability]);

    const addSlot = async () => {
        if (!user) return;
        setSaving(true);
        await supabase.from('usta_availability').insert({
            usta_id: user.id,
            day_of_week: newSlot.day_of_week,
            start_time: newSlot.start_time,
            end_time: newSlot.end_time,
            is_available: true,
        });
        fetchAvailability();
        setSaving(false);
    };

    const removeSlot = async (id: string) => {
        await supabase.from('usta_availability').delete().eq('id', id);
        setAvailability(prev => prev.filter(a => a.id !== id));
    };

    const toggleSlot = async (id: string, current: boolean) => {
        await supabase.from('usta_availability').update({ is_available: !current }).eq('id', id);
        setAvailability(prev => prev.map(a => a.id === id ? { ...a, is_available: !current } : a));
    };

    // Group by day
    const grouped = availability.reduce<Record<number, Availability[]>>((acc, a) => {
        if (a.day_of_week === null) return acc;
        if (!acc[a.day_of_week]) acc[a.day_of_week] = [];
        acc[a.day_of_week].push(a);
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Takvim & Müsaitlik</p>
                <h1 className="text-4xl font-black text-white tracking-tighter">Çalışma Takvimim</h1>
            </motion.div>

            {/* Add new slot */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl border"
                style={{ background: 'rgba(255,191,0,0.04)', borderColor: 'rgba(255,191,0,0.2)' }}
            >
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-amber-400 mb-4 flex items-center gap-2">
                    <Plus size={12} /> Yeni Zaman Dilimi Ekle
                </h2>
                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest block mb-1">Gün</label>
                        <select
                            value={newSlot.day_of_week}
                            onChange={e => setNewSlot(p => ({ ...p, day_of_week: Number(e.target.value) }))}
                            className="px-3 py-2.5 rounded-xl text-sm text-white font-medium border border-white/10 bg-white/5 focus:outline-none focus:border-amber-400/50"
                        >
                            {DAYS.map((day, i) => <option key={i} value={i} className="bg-[#0A192F]">{day}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest block mb-1">Başlangıç</label>
                        <input
                            type="time"
                            value={newSlot.start_time}
                            onChange={e => setNewSlot(p => ({ ...p, start_time: e.target.value }))}
                            className="px-3 py-2.5 rounded-xl text-sm text-white font-medium border border-white/10 bg-white/5 focus:outline-none focus:border-amber-400/50"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest block mb-1">Bitiş</label>
                        <input
                            type="time"
                            value={newSlot.end_time}
                            onChange={e => setNewSlot(p => ({ ...p, end_time: e.target.value }))}
                            className="px-3 py-2.5 rounded-xl text-sm text-white font-medium border border-white/10 bg-white/5 focus:outline-none focus:border-amber-400/50"
                        />
                    </div>
                    <button
                        onClick={addSlot}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #FFBF00, #f59e0b)' }}
                    >
                        {saving ? 'Kaydediliyor...' : '+ Ekle'}
                    </button>
                </div>
            </motion.div>

            {/* Weekly grid */}
            <div className="space-y-4">
                {availability.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Calendar size={48} className="text-white/10 mb-3" />
                        <p className="text-white/40 font-bold">Henüz müsaitlik eklenmedi</p>
                        <p className="text-white/20 text-sm mt-1">Yukarıdan çalışma saatlerinizi ekleyin</p>
                    </div>
                ) : (
                    DAYS.map((day, i) => {
                        const slots = grouped[i];
                        if (!slots?.length) return null;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="p-4 rounded-2xl border"
                                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
                            >
                                <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-3">{day}</p>
                                <div className="space-y-2">
                                    {slots.map(slot => (
                                        <div key={slot.id} className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleSlot(slot.id, slot.is_available)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${slot.is_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/10 text-red-400'}`}
                                            >
                                                {slot.is_available ? <CheckCircle size={14} /> : <Clock size={14} />}
                                            </button>
                                            <span className="text-sm text-white font-medium flex-1">
                                                {slot.start_time?.slice(0, 5)} — {slot.end_time?.slice(0, 5)}
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${slot.is_available ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                                                {slot.is_available ? 'Müsait' : 'Kapalı'}
                                            </span>
                                            <button onClick={() => removeSlot(slot.id)} className="text-white/20 hover:text-red-400 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
