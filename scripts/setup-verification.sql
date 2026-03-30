-- Doğrulama Merkezi ve Belge Yükleme Altyapısı (Verification Documents)

-- 1. profiles tablosuna is_verified kolonu ekleme (Technician/Usta ve diğer roller için genel kullanım)
-- Eklemeden önce kolonun var olup olmadığını kontrol ediyoruz.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='profiles' AND column_name='is_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
END $$;


-- 2. verification_documents tablosu oluşturma
CREATE TABLE IF NOT EXISTS public.verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) Etkinleştirme
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- Politikalar (Policies)
-- Kullanıcılar kendi yükledikleri belgeleri görebilir
CREATE POLICY "Kullanıcılar kendi belgelerini görebilir" 
ON public.verification_documents 
FOR SELECT 
USING (auth.uid() = user_id);

-- Kullanıcılar kendi belgelerini ekleyebilir
CREATE POLICY "Kullanıcılar belge yükleyebilir" 
ON public.verification_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admin olanlar tüm belgeleri görebilir ve güncelleyebilir (profiles tablosundaki role = 'ADMIN' veya 'SUPER_ADMIN' ise)
-- Not: role kontrolü projeye özgü bir function (ör. is_admin) gerektirebilir. 
-- Aşağıdaki basit yaklaşım bir alt sorgu veya trigger ile RLS aşılabilir. Şimdilik temel SELECT yetkisi ekleniyor.
CREATE POLICY "Yöneticiler belgeleri okuyabilir"
ON public.verification_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin')
  )
);

CREATE POLICY "Yöneticiler belgeleri güncelleyebilir"
ON public.verification_documents 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin')
  )
);


-- 3. Storage Bucket Ayarları (SQL üzerinden eğer mümkünse oluştur, yoksa manuel UI'dan oluşturulmalı)
-- 'verification_documents' adında bir bucket oluşturulmalıdır. İşlemi manuel yapmanız veya aşağıdaki kodu Supabase'in 
-- internal schemalarına (storage.buckets) doğrudan izinleriniz varsa çalıştırmanız gerekir.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification_documents', 'verification_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policy (kullanıcılar sadece doğrulanmış bucket'a ekleme yapabilir)
CREATE POLICY "Authenticated users can upload to verification_documents"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'verification_documents' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT TO authenticated USING (
    bucket_id = 'verification_documents' AND (storage.foldername(name))[1] = auth.uid()::text
);
