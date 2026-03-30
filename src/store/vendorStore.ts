/**
 * ─── Vendor Zustand Store ────────────────────────────────────────────────────
 * Global, persistent vendor/store state that syncs with StoreContext.
 * Accessible outside of the React tree (e.g., server actions, utilities).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from './authStore';

// ─── Types ───────────────────────────────────────────────────────────────────

export type VendorStoreData = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    is_active: boolean;
};

type VendorState = {
    store: VendorStoreData | null;
    storeId: string | null;
    isHydrated: boolean;
    isStoreLoading: boolean;
    hasStore: boolean;
};

type VendorActions = {
    setStore: (store: VendorStoreData) => void;
    clearStore: () => void;
    setHydrated: () => void;
    refreshStore: () => Promise<void>;
};

export type VendorStore = VendorState & VendorActions;

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState: VendorState = {
    store: null,
    storeId: null,
    isHydrated: false,
    isStoreLoading: true,
    hasStore: false,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useVendorStore = create<VendorStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setStore: (store) =>
                set({
                    store,
                    storeId: store.id,
                    hasStore: !!store,
                }),

            clearStore: () =>
                set({
                    store: null,
                    storeId: null,
                    hasStore: false,
                }),

            setHydrated: () => set({ isHydrated: true }),

            refreshStore: async () => {
                const { user } = useAuthStore.getState();
                
                if (!user || user.role !== 'VENDOR') {
                    get().clearStore();
                    set({ isStoreLoading: false });
                    return;
                }

                set({ isStoreLoading: true });
                const supabase = createClient();

                try {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('store_id')
                        .eq('id', user.id)
                        .single();

                    if (profileError || !profile?.store_id) {
                        get().clearStore();
                        set({ isStoreLoading: false });
                        return;
                    }

                    const { data: storeData, error: storeError } = await supabase
                        .from('stores')
                        .select('id, name, slug, description, logo_url, is_active')
                        .eq('id', profile.store_id)
                        .single();

                    if (storeError || !storeData) {
                        get().clearStore();
                    } else {
                        get().setStore(storeData);
                    }
                } catch (err) {
                    console.error('[VendorStore] Failed to fetch store:', err);
                    get().clearStore();
                } finally {
                    set({ isStoreLoading: false });
                }
            }
        }),
        {
            name: 'vendor-store',
            storage: createJSONStorage(() =>
                typeof window !== 'undefined' ? sessionStorage : {
                    getItem: () => null,
                    setItem: () => { },
                    removeItem: () => { },
                }
            ),
            // Only persist the store data, not the isHydrated or loading flag
            partialize: (state) => ({ store: state.store, storeId: state.storeId, hasStore: state.hasStore }),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            },
        }
    )
);

// ─── Selectors (stable references) ───────────────────────────────────────────

export const selectStore = (state: VendorStore) => state.store;
export const selectStoreId = (state: VendorStore) => state.storeId;
export const selectIsHydrated = (state: VendorStore) => state.isHydrated;

// ─── Dev Helper (exposes store in browser console during development) ─────────

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // @ts-expect-error – Development-only debug exposure
    window.__ZUSTAND_VENDOR_STORE__ = useVendorStore;
}
