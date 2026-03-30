/**
 * ─── Zustand Stores — Barrel Export ─────────────────────────────────────────
 * Import stores from this file for a clean single-source import path:
 *   import { useVendorStore } from '@/store';
 */
export { useVendorStore, selectStore, selectStoreId, selectIsHydrated } from './vendorStore';
export { useCartStore, useCartCount, useCartTotal } from './cartStore';
export { useAuthStore } from './authStore';
export type { CartItem, CartStore } from './cartStore';
export type { User } from './authStore';
export type { VendorStore, VendorStoreData } from './vendorStore';
