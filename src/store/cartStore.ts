import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CartItem = {
    id: string;
    slug: string;
    name: string;
    price: number;
    quantity: number;
    includeAssembly: boolean;
    vendorId?: string;
};

type CartState = {
    cart: CartItem[];
    activeDiscount: number;
    isHydrated: boolean;
};

type CartActions = {
    addToCart: (product: Omit<CartItem, 'quantity' | 'includeAssembly'>, includeAssembly: boolean) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    applyDiscount: (percentage: number) => void;
    toggleAssembly: (id: string, value: boolean) => void;
    setHydrated: () => void;
};

export type CartStore = CartState & CartActions;

const initialState: CartState = {
    cart: [],
    activeDiscount: 0,
    isHydrated: false,
};

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            addToCart: (product, includeAssembly) => {
                set((state) => {
                    const existingItem = state.cart.find((item) => item.id === product.id);
                    if (existingItem) {
                        return {
                            cart: state.cart.map((item) =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + 1, includeAssembly }
                                    : item
                            ),
                        };
                    }
                    return {
                        cart: [
                            ...state.cart,
                            {
                                id: product.id,
                                slug: product.slug,
                                name: product.name,
                                price: product.price,
                                quantity: 1,
                                includeAssembly,
                                vendorId: product.vendorId,
                            },
                        ],
                    };
                });
            },

            removeFromCart: (id) => {
                set((state) => ({
                    cart: state.cart.filter((item) => item.id !== id),
                }));
            },

            updateQuantity: (id, quantity) => {
                set((state) => ({
                    cart: state.cart.map((item) =>
                        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
                    ),
                }));
            },

            clearCart: () => {
                set({ cart: [], activeDiscount: 0 });
            },

            applyDiscount: (percentage) => {
                set({ activeDiscount: percentage });
            },

            toggleAssembly: (id, value) => {
                set((state) => ({
                    cart: state.cart.map((item) =>
                        item.id === id ? { ...item, includeAssembly: value } : item
                    ),
                }));
            },

            setHydrated: () => set({ isHydrated: true }),
        }),
        {
            name: 'homesync_cart',
            storage: createJSONStorage(() =>
                typeof window !== 'undefined' ? localStorage : {
                    getItem: () => null,
                    setItem: () => { },
                    removeItem: () => { },
                }
            ),
            partialize: (state) => ({ cart: state.cart, activeDiscount: state.activeDiscount }),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            },
        }
    )
);

// Derived state hooks to replace Context's variables
export const useCartCount = () => useCartStore((state) => state.cart.reduce((count, item) => count + item.quantity, 0));
export const useCartTotal = () => useCartStore((state) => {
    const total = state.cart.reduce((sum, item) => {
        const assemblyPrice = item.includeAssembly ? 1250 : 0;
        return sum + (item.price + assemblyPrice) * item.quantity;
    }, 0);
    return total * (1 - state.activeDiscount / 100);
});
