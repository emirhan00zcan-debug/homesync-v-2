"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

export type UstaProfile = {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    is_available: boolean;
    specialization: string | null;
    is_verified: boolean;
    created_at: string;
};

export type UstaStats = {
    toplam_kazanc: number;
    tamamlanan_is_sayisi: number;
    toplam_puan: number;
    yorum_sayisi: number;
    kesilen_komisyon: number;
};

export type UstaServiceArea = {
    id: string;
    district: string;
};

export type UstaServiceCategory = {
    id: string;
    category: string;
};

export type WorkingHours = Record<string, { start: string; end: string; active: boolean }>;

export function useUstaProfile() {
    const { user } = useAuth();
    const supabase = createClient();

    const [profile, setProfile] = useState<UstaProfile | null>(null);
    const [stats, setStats] = useState<UstaStats | null>(null);
    const [serviceAreas, setServiceAreas] = useState<string[]>([]);
    const [serviceCategories, setServiceCategories] = useState<string[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        setError(null);

        try {
            // Profile
            const { data: prof, error: profErr } = await supabase
                .from('profiles')
                .select('id, full_name, email, phone, avatar_url, is_available, specialization, is_verified, created_at')
                .eq('id', user.id)
                .single();
            if (profErr) throw profErr;
            setProfile(prof);

            // Stats
            const { data: st } = await supabase
                .from('technician_stats')
                .select('toplam_kazanc, tamamlanan_is_sayisi, toplam_puan, yorum_sayisi, kesilen_komisyon')
                .eq('usta_id', user.id)
                .single();
            setStats(st ? {
                toplam_kazanc: Number(st.toplam_kazanc ?? 0),
                tamamlanan_is_sayisi: st.tamamlanan_is_sayisi ?? 0,
                toplam_puan: Number(st.toplam_puan ?? 0),
                yorum_sayisi: st.yorum_sayisi ?? 0,
                kesilen_komisyon: Number(st.kesilen_komisyon ?? 0),
            } : null);

            // Service areas
            const { data: areas } = await supabase
                .from('usta_service_areas')
                .select('district')
                .eq('usta_id', user.id);
            setServiceAreas((areas ?? []).map((a: { district: string }) => a.district));

            // Service categories
            const { data: cats } = await supabase
                .from('usta_services')
                .select('category')
                .eq('usta_id', user.id);
            setServiceCategories((cats ?? []).map((c: { category: string }) => c.category));

            // Job counts
            const { count: pending } = await supabase
                .from('service_requests')
                .select('id', { count: 'exact', head: true })
                .eq('usta_id', user.id)
                .eq('status', 'pending');
            setPendingCount(pending ?? 0);

            const { count: active } = await supabase
                .from('service_requests')
                .select('id', { count: 'exact', head: true })
                .eq('usta_id', user.id)
                .eq('status', 'in_progress');
            setActiveCount(active ?? 0);

        } catch (err) {
            console.error('useUstaProfile error:', err);
            setError('Profil yüklenirken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const updateAvailability = async (isAvailable: boolean) => {
        if (!user?.id) return;
        const { error } = await supabase
            .from('profiles')
            .update({ is_available: isAvailable })
            .eq('id', user.id);
        if (!error) {
            setProfile(prev => prev ? { ...prev, is_available: isAvailable } : prev);
        }
        return error;
    };

    const updateProfile = async (data: Partial<Pick<UstaProfile, 'full_name' | 'phone' | 'specialization'>>) => {
        if (!user?.id) return;
        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', user.id);
        if (!error) {
            setProfile(prev => prev ? { ...prev, ...data } : prev);
        }
        return error;
    };

    const saveServiceAreas = async (districts: string[]) => {
        if (!user?.id) return;
        await supabase.from('usta_service_areas').delete().eq('usta_id', user.id);
        if (districts.length > 0) {
            await supabase.from('usta_service_areas').insert(
                districts.map(district => ({ usta_id: user.id, district }))
            );
        }
        setServiceAreas(districts);
    };

    const saveServiceCategories = async (categories: string[]) => {
        if (!user?.id) return;
        await supabase.from('usta_services').delete().eq('usta_id', user.id);
        if (categories.length > 0) {
            await supabase.from('usta_services').insert(
                categories.map(category => ({ usta_id: user.id, category }))
            );
        }
        setServiceCategories(categories);
    };

    return {
        profile,
        stats,
        serviceAreas,
        serviceCategories,
        pendingCount,
        activeCount,
        isLoading,
        error,
        refetch: fetchAll,
        updateAvailability,
        updateProfile,
        saveServiceAreas,
        saveServiceCategories,
    };
}
