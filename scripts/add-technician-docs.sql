-- technician_documents tablosu ve profiles güncellemeleri

-- 1. profiles tablosuna kimlik doğrulama durumu ekle (eğer yoksa)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_identity_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN is_identity_verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Belge durumları için enum tipi (eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
        CREATE TYPE document_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. technician_documents tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.technician_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usta_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'IDENTITY', 'CERTIFICATE', 'CRIMINAL_RECORD' vb.
    file_url TEXT NOT NULL,
    status document_status DEFAULT 'PENDING',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. RLS Politikaları
ALTER TABLE public.technician_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ustalar kendi belgelerini görebilir" 
ON public.technician_documents FOR SELECT 
USING (auth.uid() = usta_id);

CREATE POLICY "Ustalar belge yükleyebilir" 
ON public.technician_documents FOR INSERT 
WITH CHECK (auth.uid() = usta_id);

CREATE POLICY "Adminler tüm belgeleri görebilir ve güncelleyebilir" 
ON public.technician_documents FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'SUPER_ADMIN')
  )
);
