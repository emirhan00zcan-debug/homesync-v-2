-- Usta (Technician) Role ve İstatistik Tablosu Kurulumu

-- 1. profiles tablosundaki role enum/check kısıtlamasını güncelleme (Eğer check constraint olarak eklendiyse)
-- Mevcut yapıda profiles.role sütunu TEXT ve ('customer', 'vendor', 'admin', 'super_admin' vb.) gibi değerler alıyordur.
-- Eğer role sütunu enum ise, ALTER TYPE kullanarak enum'a 'technician' eklenmelidir.
-- Çoğu standart Supabase kurulumunda TEXT kullanılır ve CHECK constraint olabilir.
-- Bu örnek, role sütununa 'technician' değerinin girilebileceğini varsayar. Özel bir ENUM varsa lütfen manuel uygulayın.

-- 2. technician_stats tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.technician_stats (
    usta_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    toplam_puan NUMERIC(3,2) DEFAULT 0.00,
    tamamlanan_is_sayisi INTEGER DEFAULT 0,
    toplam_kazanc NUMERIC(15,2) DEFAULT 0.00,
    kesilen_komisyon NUMERIC(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) Etkinleştir
ALTER TABLE public.technician_stats ENABLE ROW LEVEL SECURITY;

-- Politikalar
-- Herkes ustaların istatistiklerini okuyabilir
CREATE POLICY "Herkes technician_stats okuyabilir" 
ON public.technician_stats 
FOR SELECT 
USING (true);

-- Ustalar sadece kendi istatistiklerini güncelleyemez (güvenlik için)
-- Admin paneli veya arkaplan işlemleri (Edge Functions) güncellemeli
-- Fakat şimdilik ustalar kendi kayıtlarını insert edebilir (örneğin trigger ile profile eklendiğinde)

-- Trigger: profiles tablosuna yeni 'technician' eklendiğinde technician_stats tablosuna kayıt at
CREATE OR REPLACE FUNCTION public.handle_new_technician() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'TECHNICIAN' OR NEW.role = 'technician' THEN
    INSERT INTO public.technician_stats (usta_id)
    VALUES (NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı bağla (Eğer daha önce benzer bir trigger yoksa)
DROP TRIGGER IF EXISTS on_technician_created ON public.profiles;
CREATE TRIGGER on_technician_created
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_technician();
