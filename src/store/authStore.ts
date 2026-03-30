import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

export type User = {
    id: string;
    email: string;
    name?: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER' | 'VENDOR' | 'TECHNICIAN';
};

type AuthState = {
    user: User | null;
    isLoading: boolean;
};

type AuthActions = {
    setUser: (user: User | null) => void;
    setIsLoading: (isLoading: boolean) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => {
    const supabase = createClient();

    const normalizeRole = (role: string | undefined): User['role'] => {
        const upper = (role || '').toUpperCase();
        if (upper === 'USTA' || upper === 'TECHNICIAN') return 'TECHNICIAN';
        if (upper === 'SATICI' || upper === 'VENDOR') return 'VENDOR';
        const validRoles: User['role'][] = ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER', 'VENDOR', 'TECHNICIAN'];
        return validRoles.includes(upper as User['role']) ? (upper as User['role']) : 'CUSTOMER';
    };

    const mapSupabaseUser = async (sbUser: SupabaseUser): Promise<User> => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('id', sbUser.id)
                .single();

            return {
                id: sbUser.id,
                email: sbUser.email || '',
                name: profile?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Kullanıcı',
                role: normalizeRole(profile?.role || sbUser.user_metadata?.role)
            };
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return {
                id: sbUser.id,
                email: sbUser.email || '',
                name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Kullanıcı',
                role: normalizeRole(sbUser.user_metadata?.role)
            };
        }
    };

    return {
        user: null,
        isLoading: true,
        setUser: (user) => set({ user }),
        setIsLoading: (isLoading) => set({ isLoading }),

        refreshUser: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const mappedUser = await mapSupabaseUser(session.user);
                set({ user: mappedUser });
            }
        },

        logout: async () => {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                await supabase.auth.signOut();
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                set({ user: null });
                if (typeof window !== 'undefined') {
                    localStorage.clear();
                    window.location.replace('/');
                }
            }
        }
    };
});
