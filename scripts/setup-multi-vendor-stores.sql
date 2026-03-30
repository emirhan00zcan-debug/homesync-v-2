-- =============================================================
-- Multi-Vendor Marketplace: Store & Product Schema Update
-- =============================================================

-- 1. Enhance STORES table
-- Ensure it exists and has the new columns
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT, -- New column for store branding
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Update PRODUCTS table
-- Add store_id to link products directly to stores
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL;

-- 3. Data Migration
-- If products have vendor_id, and profiles have store_id, link them.
UPDATE public.products p
SET store_id = prof.store_id
FROM public.profiles prof
WHERE p.vendor_id = prof.id
AND prof.store_id IS NOT NULL
AND p.store_id IS NULL;

-- 4. RLS Update for STORES
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Reading stores: Everyone can see active stores
DROP POLICY IF EXISTS "Anyone can view active stores" ON public.stores;
CREATE POLICY "Anyone can view active stores"
ON public.stores FOR SELECT
USING (is_active = true OR auth.uid() = owner_id OR (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role IN ('ADMIN', 'admin', 'super_admin', 'SUPER_ADMIN')
    )
));

-- Managing store: Only owner or admin
DROP POLICY IF EXISTS "Owners can update their stores" ON public.stores;
CREATE POLICY "Owners can update their stores"
ON public.stores FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Admin control: All actions
DROP POLICY IF EXISTS "Admins can manage all stores" ON public.stores;
CREATE POLICY "Admins can manage all stores"
ON public.stores FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role IN ('ADMIN', 'admin', 'super_admin', 'SUPER_ADMIN')
    )
);

-- 5. RLS Update for PRODUCTS (incorporating store_id)
-- Ensure vendors can only add products to their own store
DROP POLICY IF EXISTS "Vendors can insert products to their store" ON public.products;
CREATE POLICY "Vendors can insert products to their store"
ON public.products FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = store_id
          AND stores.owner_id = auth.uid()
    )
);

-- Ensure vendors can only update/delete products in their own store
DROP POLICY IF EXISTS "Vendors can manage their store products" ON public.products;
CREATE POLICY "Vendors can manage their store products"
ON public.products FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = store_id
          AND stores.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = store_id
          AND stores.owner_id = auth.uid()
    )
);
