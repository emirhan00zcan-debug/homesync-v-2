"use client";

import React, { useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore, type User } from '@/store/authStore';
export type { User };

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const setUser = useAuthStore(s => s.setUser);
    const setIsLoading = useAuthStore(s => s.setIsLoading);
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        let isMounted = true;

        const normalizeRole = (role: string | undefined): User['role'] => {
            const upper = (role || '').toUpperCase();
            if (upper === 'USTA' || upper === 'TECHNICIAN') return 'TECHNICIAN';
            if (upper === 'SATICI' || upper === 'VENDOR') return 'VENDOR';
            return ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER', 'VENDOR', 'TECHNICIAN'].includes(upper) ? (upper as User['role']) : 'CUSTOMER';
        };

        const mapSupabaseUser = async (sbUser: any) => {
            try {
                const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', sbUser.id).single();
                return {
                    id: sbUser.id,
                    email: sbUser.email || '',
                    name: profile?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Kullanıcı',
                    role: normalizeRole(profile?.role || sbUser.user_metadata?.role)
                };
            } catch (error) {
                return {
                    id: sbUser.id,
                    email: sbUser.email || '',
                    name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Kullanıcı',
                    role: normalizeRole(sbUser.user_metadata?.role)
                };
            }
        };

        const handleAuthStateChange = async (event: string, session: any) => {
            if (!isMounted) return;

            if (session?.user) {
                const currentUser = useAuthStore.getState().user;
                if (currentUser?.id === session.user.id) {
                    setIsLoading(false);
                    return;
                }
                const mappedUser = await mapSupabaseUser(session.user);
                setUser(mappedUser);
            } else {
                setUser(null);
            }

            if (isMounted) setIsLoading(false);
        };

        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            await handleAuthStateChange('INITIAL_SESSION', session);
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            handleAuthStateChange(event, session);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [setUser, setIsLoading, supabase]);

    return <>{children}</>;
};

export const useAuth = () => {
    const user = useAuthStore(s => s.user);
    const isLoading = useAuthStore(s => s.isLoading);
    const logout = useAuthStore(s => s.logout);
    const refreshUser = useAuthStore(s => s.refreshUser);

    return { user, isLoading, logout, refreshUser };
};
