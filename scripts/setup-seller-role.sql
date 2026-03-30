-- =============================================================
-- Satıcı (Seller/Vendor) Rolü ve Products Tablosu RLS Kurulumu
-- Şema: public.profiles (role TEXT), public.products (vendor_id)
-- Mevcut rol değerleri: vendor, super_admin, user, usta (küçük harf)
-- =============================================================

-- 1. profiles.role sütununa CHECK CONSTRAINT ekle
--    Tüm varyantları (büyük/küçük harf) kapsayacak şekilde geniş tutulmuştur.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'ADMIN', 'admin',
    'CUSTOMER', 'customer', 'user',
    'SELLER', 'seller', 'vendor', 'VENDOR',
    'USTA', 'usta', 'technician', 'TECHNICIAN',
    'super_admin', 'SUPER_ADMIN'
  ));

-- =============================================================
-- 2. Products Tablosu RLS Politikaları
--    vendor_id → satıcının profiles.id'si ile eşleşmeli
-- =============================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ── Okuma ────────────────────────────────────────────────────
-- Herkes ürünleri okuyabilir (misafir dahil)
DROP POLICY IF EXISTS "Herkes urunleri okuyabilir" ON public.products;
CREATE POLICY "Herkes urunleri okuyabilir"
ON public.products FOR SELECT
USING (true);

-- ── Ekleme ───────────────────────────────────────────────────
-- Yalnızca SELLER/VENDOR rolündeki kullanıcılar kendi vendor_id'leriyle ekleyebilir
DROP POLICY IF EXISTS "Saticilar kendi urunlerini ekleyebilir" ON public.products;
CREATE POLICY "Saticilar kendi urunlerini ekleyebilir"
ON public.products FOR INSERT
WITH CHECK (
  auth.uid() = vendor_id
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('SELLER', 'seller', 'vendor', 'VENDOR')
  )
);

-- ── Güncelleme ────────────────────────────────────────────────
-- Satıcılar yalnızca kendi (vendor_id) ürünlerini güncelleyebilir
DROP POLICY IF EXISTS "Saticilar sadece kendi urunlerini guncelleyebilir" ON public.products;
CREATE POLICY "Saticilar sadece kendi urunlerini guncelleyebilir"
ON public.products FOR UPDATE
USING    (auth.uid() = vendor_id)
WITH CHECK (auth.uid() = vendor_id);

-- ── Silme ─────────────────────────────────────────────────────
-- Satıcılar yalnızca kendi (vendor_id) ürünlerini silebilir
DROP POLICY IF EXISTS "Saticilar sadece kendi urunlerini silebilir" ON public.products;
CREATE POLICY "Saticilar sadece kendi urunlerini silebilir"
ON public.products FOR DELETE
USING (auth.uid() = vendor_id);

-- ── Admin Bypass ──────────────────────────────────────────────
-- ADMIN / super_admin rolündeki kullanıcılar tüm işlemleri yapabilir
DROP POLICY IF EXISTS "Adminler her seyi yapabilir products" ON public.products;
CREATE POLICY "Adminler her seyi yapabilir products"
ON public.products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'admin', 'super_admin', 'SUPER_ADMIN')
  )
);

-- =============================================================
-- 3. Doğrulama Sorgusu (çalıştırarak politikaları kontrol et)
--    SELECT policyname, cmd FROM pg_policies WHERE tablename = 'products';
-- =============================================================
