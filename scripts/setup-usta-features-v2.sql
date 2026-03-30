-- ============================================================
-- Usta (Technician) Features – v2
-- Yeni tablolar: usta_service_areas, usta_services
-- technician_stats'a is_available eklenir
-- ============================================================

-- ─── 1. technician_stats – müsaitlik sütunu ────────────────
ALTER TABLE public.technician_stats
ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT FALSE;

-- ─── 2. usta_services ──────────────────────────────────────
-- Ustanın yapabildiği işler (Boya, Tesisat, vb.)
CREATE TABLE IF NOT EXISTS public.usta_services (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usta_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_category TEXT NOT NULL,          -- Örn: 'Boya', 'Tesisat', 'Elektrik'
    title            TEXT,                   -- Ustanın özel başlığı (opsiyonel)
    description      TEXT,
    hourly_rate      NUMERIC(10,2),          -- Saatlik ücret tahmini (opsiyonel)
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(usta_id, service_category)        -- Aynı kategoriden birden fazla kayıt olmasın
);

ALTER TABLE public.usta_services ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (müşteriler usta profillerini görmeli)
CREATE POLICY "Herkes usta_services okuyabilir"
    ON public.usta_services FOR SELECT
    USING (true);

-- Sadece ustanın kendisi yönetebilir
CREATE POLICY "Usta kendi hizmetlerini ekleyebilir"
    ON public.usta_services FOR INSERT
    WITH CHECK (auth.uid() = usta_id);

CREATE POLICY "Usta kendi hizmetlerini güncelleyebilir"
    ON public.usta_services FOR UPDATE
    USING (auth.uid() = usta_id);

CREATE POLICY "Usta kendi hizmetlerini silebilir"
    ON public.usta_services FOR DELETE
    USING (auth.uid() = usta_id);

-- updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usta_services_updated_at ON public.usta_services;
CREATE TRIGGER trg_usta_services_updated_at
    BEFORE UPDATE ON public.usta_services
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─── 3. usta_service_areas ─────────────────────────────────
-- Ustanın hizmet verdiği bölgeler (ilçe / posta kodu bazında)
-- Bu tablo sayesinde Tuzla'daki ustaya Silivri'den iş düşmez.
CREATE TABLE IF NOT EXISTS public.usta_service_areas (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usta_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    city       TEXT NOT NULL,               -- Şehir: 'İstanbul'
    district   TEXT NOT NULL,              -- İlçe:  'Tuzla'
    zip_code   TEXT,                       -- Posta kodu (opsiyonel, detaylı filtreleme için)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(usta_id, city, district)         -- Aynı bölge iki kez eklenemesin
);

ALTER TABLE public.usta_service_areas ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (iş eşleştirme için gerekli)
CREATE POLICY "Herkes usta_service_areas okuyabilir"
    ON public.usta_service_areas FOR SELECT
    USING (true);

-- Sadece ustanın kendisi yönetebilir
CREATE POLICY "Usta kendi hizmet bölgelerini yönetebilir"
    ON public.usta_service_areas FOR ALL
    USING (auth.uid() = usta_id)
    WITH CHECK (auth.uid() = usta_id);


-- ─── 4. service_requests – status değerlerine 'usta_atandi' ve 'completed' ekle ─
-- (Eğer status sütununda CHECK constraint varsa aşağıdaki bloğu güncelle)
-- Supabase genellikle TEXT kullandığı için ek constraint gerekmez;
-- ancak mevcut bir ENUM varsa şu şekilde güncelleyin:
-- ALTER TYPE service_request_status ADD VALUE IF NOT EXISTS 'usta_atandi';
-- ALTER TYPE service_request_status ADD VALUE IF NOT EXISTS 'completed';
