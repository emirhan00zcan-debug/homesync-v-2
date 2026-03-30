-- profiles tablosu için Admin/Super Admin erişim yetkileri
-- Bu sayede yöneticiler tüm kullanıcıları görebilir ve onaylayabilir.

-- 1. SELECT Yetkisi: Admin ve Super Adminler tüm profilleri görebilmeli
DROP POLICY IF EXISTS "Yöneticiler tüm profilleri görebilir" ON public.profiles;
CREATE POLICY "Yöneticiler tüm profilleri görebilir"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND (p.role = 'super_admin' OR p.role = 'admin' OR p.role = 'ADMIN' OR p.role = 'SUPER_ADMIN')
  )
);

-- 2. UPDATE Yetkisi: Admin ve Super Adminler tüm profilleri güncelleyebilmeli (Onay verilebilmesi için)
DROP POLICY IF EXISTS "Yöneticiler tüm profilleri güncelleyebilir" ON public.profiles;
CREATE POLICY "Yöneticiler tüm profilleri güncelleyebilir"
ON public.profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND (p.role = 'super_admin' OR p.role = 'admin' OR p.role = 'ADMIN' OR p.role = 'SUPER_ADMIN')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND (p.role = 'super_admin' OR p.role = 'admin' OR p.role = 'ADMIN' OR p.role = 'SUPER_ADMIN')
  )
);
