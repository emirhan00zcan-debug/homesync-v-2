-- ---------------------------------------------------------
-- Role-Based Access Control (RBAC) & New Entities Setup
-- ---------------------------------------------------------

-- 1. Satıcı (Vendor) Tables
-- -------------------------

-- Kargo / Gönderim (Shipping) Tablosu
CREATE TABLE IF NOT EXISTS public.shipping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tracking_code TEXT,
    carrier TEXT,
    status TEXT NOT NULL CHECK (status IN ('hazirlaniyor', 'kargoda', 'teslim_edildi')) DEFAULT 'hazirlaniyor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.shipping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their own shipping records" 
ON public.shipping FOR SELECT 
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can insert their own shipping records" 
ON public.shipping FOR INSERT 
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own shipping records" 
ON public.shipping FOR UPDATE 
USING (auth.uid() = vendor_id);

CREATE POLICY "Customers can view shipping records of their orders" 
ON public.shipping FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = shipping.order_id AND orders.user_id = auth.uid()
    )
);


-- 2. Usta (Technician) Tables
-- ---------------------------

-- Hizmetler (Services)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usta_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    duration INTEGER, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view services" 
ON public.services FOR SELECT 
USING (true);

CREATE POLICY "Technicians can insert their own services" 
ON public.services FOR INSERT 
WITH CHECK (auth.uid() = usta_id);

CREATE POLICY "Technicians can update their own services" 
ON public.services FOR UPDATE 
USING (auth.uid() = usta_id);

CREATE POLICY "Technicians can delete their own services" 
ON public.services FOR DELETE 
USING (auth.uid() = usta_id);


-- Randevular (Appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usta_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians can view their appointments" 
ON public.appointments FOR SELECT 
USING (auth.uid() = usta_id);

CREATE POLICY "Customers can view their appointments" 
ON public.appointments FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create appointments" 
ON public.appointments FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Technicians can update their appointments" 
ON public.appointments FOR UPDATE 
USING (auth.uid() = usta_id);

CREATE POLICY "Customers can cancel their appointments" 
ON public.appointments FOR UPDATE 
USING (auth.uid() = customer_id AND status = 'pending');


-- Hizmet Bölgeleri (Service Areas)
CREATE TABLE IF NOT EXISTS public.service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usta_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(usta_id, city, district)
);

ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view service areas" 
ON public.service_areas FOR SELECT 
USING (true);

CREATE POLICY "Technicians can manage their service areas" 
ON public.service_areas FOR ALL 
USING (auth.uid() = usta_id);


-- Portföyler (Portfolios)
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usta_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view portfolios" 
ON public.portfolios FOR SELECT 
USING (true);

CREATE POLICY "Technicians can manage their portfolios" 
ON public.portfolios FOR ALL 
USING (auth.uid() = usta_id);
