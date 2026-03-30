DO $$ BEGIN CREATE TYPE public.document_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
CREATE OR REPLACE FUNCTION public.check_is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'ADMIN', 'super_admin', 'SUPER_ADMIN')
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.handle_profile_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.role = 'alici' AND (NEW.status IS NULL OR NEW.status = 'pending') THEN
    NEW.status := 'active';
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'ADMIN', 'super_admin', 'SUPER_ADMIN')
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'SUPER_ADMIN')
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.is_usta()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('usta', 'USTA', 'technician', 'TECHNICIAN')
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  mapped_role text;
  new_store_id uuid;
  company_name text;
  is_verified_meta boolean;
BEGIN
  -- Extract raw text
  mapped_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'alici'));
  company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'İsimsiz');
  is_verified_meta := COALESCE((NEW.raw_user_meta_data->>'is_identity_verified')::boolean, false);
  
  -- Map to validated roles (Turkish)
  IF mapped_role = 'customer' OR mapped_role = 'alici' THEN
    mapped_role := 'alici';
  ELSIF mapped_role = 'pro' OR mapped_role = 'technician' OR mapped_role = 'usta' THEN
    mapped_role := 'usta';
  ELSIF mapped_role = 'vendor' OR mapped_role = 'satici' THEN
    mapped_role := 'satici';
  ELSIF mapped_role != 'alici' AND mapped_role != 'usta' AND mapped_role != 'satici' AND mapped_role != 'admin' AND mapped_role != 'super_admin' AND mapped_role != 'ADMIN' AND mapped_role != 'SUPER_ADMIN' THEN
    mapped_role := 'alici'; -- Default fallback
  END IF;

  -- Create profile first
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url, 
    email, 
    role, 
    company_name,
    is_identity_verified,
    is_verified,
    verification_status,
    status
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', company_name),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    mapped_role,
    CASE WHEN mapped_role = 'satici' THEN company_name ELSE NULL END,
    is_verified_meta,
    is_verified_meta,
    CASE WHEN is_verified_meta = true THEN 'approved' ELSE 'pending' END,
    CASE WHEN mapped_role = 'alici' THEN 'active' ELSE 'pending' END
  );

  -- Create store for satici (vendor)
  IF mapped_role = 'satici' THEN
    INSERT INTO public.stores (owner_id, name, slug, description, is_active, is_verified) 
    VALUES (
      NEW.id,
      company_name,
       -- basic slug generation removing spaces, keeping alphanum
      REGEXP_REPLACE(LOWER(company_name), '[^a-z0-9]+', '-', 'g') || '-' || SUBSTRING(NEW.id::text, 1, 5),
      'Yeni Mağaza',
      true,
      is_verified_meta
    ) RETURNING id INTO new_store_id;

    -- Update profile with store_id
    UPDATE public.profiles SET store_id = new_store_id WHERE id = NEW.id;
  END IF;
  
  -- Create technician stats for usta
  IF mapped_role = 'usta' THEN
    INSERT INTO public.technician_stats (usta_id, is_available)
    VALUES (NEW.id, false);
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.handle_profile_verification_sync()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update auth.users metadata for the user
  UPDATE auth.users 
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{is_verified}',
    to_jsonb(NEW.is_verified)
  )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.handle_new_technician()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.role = 'TECHNICIAN' OR NEW.role = 'technician' THEN
    INSERT INTO public.technician_stats (usta_id)
    VALUES (NEW.id)
    ON CONFLICT (usta_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.handle_user_verification(p_user_id uuid, p_action text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF p_action = 'approve' THEN
        UPDATE public.profiles
        SET is_verified = true,
            verification_status = 'approved',
            updated_at = timezone('utc'::text, now())
        WHERE id = p_user_id;
    ELSIF p_action = 'reject' THEN
        UPDATE public.profiles
        SET is_verified = false,
            verification_status = 'rejected',
            updated_at = timezone('utc'::text, now())
        WHERE id = p_user_id;
    ELSE
        RAISE EXCEPTION 'Invalid action: %', p_action;
    END IF;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_technician_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE public.technician_stats
    SET toplam_puan = (
        SELECT ROUND(AVG(rating::NUMERIC), 2)
        FROM public.usta_reviews
        WHERE usta_id = NEW.usta_id AND is_visible = true
    ),
    updated_at = now()
    WHERE usta_id = NEW.usta_id;
    RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_technician_stats_on_complete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    commission NUMERIC := 0.15; -- %15 platform komisyonu
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.usta_id IS NOT NULL THEN
        INSERT INTO public.technician_stats (usta_id, tamamlanan_is_sayisi, toplam_kazanc, kesilen_komisyon)
        VALUES (
            NEW.usta_id,
            1,
            COALESCE(NEW.final_price, 0) * (1 - commission),
            COALESCE(NEW.final_price, 0) * commission
        )
        ON CONFLICT (usta_id) DO UPDATE SET
            tamamlanan_is_sayisi = technician_stats.tamamlanan_is_sayisi + 1,
            toplam_kazanc = technician_stats.toplam_kazanc + COALESCE(NEW.final_price, 0) * (1 - commission),
            kesilen_komisyon = technician_stats.kesilen_komisyon + COALESCE(NEW.final_price, 0) * commission,
            updated_at = now();
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE TABLE IF NOT EXISTS public.user_activity (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "activity_type" text NOT NULL,
  "entity_id" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.profiles (
  "id" uuid NOT NULL,
  "updated_at" timestamp with time zone,
  "full_name" text,
  "email" text,
  "avatar_url" text,
  "role" text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['alici'::text, 'usta'::text, 'satici'::text, 'admin'::text, 'super_admin'::text, 'ADMIN'::text, 'SUPER_ADMIN'::text])),
  "commission_rate" numeric DEFAULT 15.00,
  "vendor_status" text CHECK (vendor_status IS NULL OR (vendor_status = ANY (ARRAY['PENDING'::text, 'ACTIVE'::text, 'SUSPENDED'::text]))),
  "company_name" text,
  "store_id" uuid,
  "is_verified" boolean DEFAULT false,
  "verification_status" text DEFAULT 'pending'::text,
  "phone" text,
  "gender" text CHECK (gender = ANY (ARRAY['MALE'::text, 'FEMALE'::text, 'OTHER'::text])),
  "birth_date" date,
  "bio" text,
  "is_available" boolean DEFAULT true,
  "sub_merchant_key" text,
  "sub_merchant_type" text DEFAULT 'PERSONAL'::text,
  "is_identity_verified" boolean DEFAULT false,
  "tc_no" text UNIQUE CHECK (tc_no IS NULL OR tc_no ~ '^[0-9]{11}$'::text),
  "ad" text,
  "soyad" text,
  "dogum_yili" integer,
  "id_verification_attempts" integer DEFAULT 0,
  "last_id_verification_at" timestamp with time zone,
  "status" text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['active'::text, 'pending'::text, 'rejected'::text, 'pending_approval'::text])),
  PRIMARY KEY ("id")
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.products (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "vendor_id" uuid,
  "name" text NOT NULL,
  "description" text,
  "price" numeric NOT NULL DEFAULT 0,
  "stock_count" integer NOT NULL DEFAULT 0,
  "category" text,
  "image_url" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "slug" text UNIQUE,
  "lumens" integer,
  "wattage" integer,
  "material" text,
  "difficulty" text,
  "manufacturer" text,
  "store_id" uuid,
  "view_count" integer DEFAULT 0,
  "like_count" integer DEFAULT 0,
  "status" text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  "is_installation_included" boolean DEFAULT false,
  PRIMARY KEY ("id")
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.orders (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "total_amount" numeric NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'hazirlaniyor'::text CHECK (status = ANY (ARRAY['hazirlaniyor'::text, 'kargoda'::text, 'teslim_edildi'::text, 'iptal'::text])),
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "store_id" uuid,
  "tracking_number" text,
  "payment_id" text,
  "payment_status" text DEFAULT 'pending'::text,
  "payment_transaction_id" text,
  PRIMARY KEY ("id")
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.order_items (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "order_id" uuid NOT NULL,
  "product_id" uuid,
  "vendor_id" uuid,
  "quantity" integer NOT NULL DEFAULT 1,
  "unit_price" numeric NOT NULL DEFAULT 0,
  "commission_rate" numeric DEFAULT 15.00,
  "vendor_earning" numeric GENERATED ALWAYS AS ((unit_price * (quantity)::numeric) * ((1)::numeric - (commission_rate / (100)::numeric))) STORED,
  "created_at" timestamp with time zone DEFAULT now(),
  "payment_transaction_id" text,
  PRIMARY KEY ("id")
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.vendor_commissions (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "vendor_id" uuid NOT NULL,
  "rate" numeric NOT NULL DEFAULT 15.00,
  "changed_by" uuid,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);
ALTER TABLE public.vendor_commissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.stores (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "owner_id" uuid,
  "description" text,
  "logo_url" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "is_verified" boolean DEFAULT false,
  PRIMARY KEY ("id")
);
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.reviews (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "product_id" uuid,
  "user_id" uuid,
  "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "comment" text,
  "photo_url" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.favorites (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "product_id" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.addresses (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "title" text NOT NULL,
  "address" text NOT NULL,
  "city" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.technician_stats (
  "usta_id" uuid NOT NULL,
  "toplam_puan" numeric DEFAULT 0.00,
  "tamamlanan_is_sayisi" integer DEFAULT 0,
  "toplam_kazanc" numeric DEFAULT 0.00,
  "kesilen_komisyon" numeric DEFAULT 0.00,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "expertise_areas" text,
  "is_available" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("usta_id")
);
ALTER TABLE public.technician_stats ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.verification_documents (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "document_url" text NOT NULL,
  "document_type" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "status" text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  "rejection_reason" text,
  "updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("id")
);
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.notifications (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "recipient_id" uuid,
  "recipient_phone" text,
  "type" text NOT NULL DEFAULT 'sms'::text,
  "channel" text NOT NULL DEFAULT 'mock'::text,
  "message" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.service_requests (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "customer_id" uuid NOT NULL,
  "usta_id" uuid,
  "title" text NOT NULL,
  "description" text,
  "category" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])),
  "payment_type" text NOT NULL DEFAULT 'online'::text CHECK (payment_type = ANY (ARRAY['cash'::text, 'online'::text])),
  "price_offered" numeric,
  "final_price" numeric,
  "scheduled_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "address" text,
  "city" text,
  "district" text,
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.usta_availability (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "usta_id" uuid NOT NULL,
  "day_of_week" integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
  "start_time" time without time zone,
  "end_time" time without time zone,
  "is_available" boolean DEFAULT true,
  "specific_date" date,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
ALTER TABLE public.usta_availability ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.usta_service_areas (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "usta_id" uuid NOT NULL,
  "city" text NOT NULL,
  "district" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
ALTER TABLE public.usta_service_areas ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.usta_services (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "usta_id" uuid NOT NULL,
  "category" text NOT NULL,
  "description" text,
  "min_price" numeric,
  "max_price" numeric,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
ALTER TABLE public.usta_services ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.usta_reviews (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "usta_id" uuid NOT NULL,
  "customer_id" uuid NOT NULL,
  "service_request_id" uuid,
  "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "comment" text,
  "is_visible" boolean DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
ALTER TABLE public.usta_reviews ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.shipping (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "order_id" uuid NOT NULL,
  "vendor_id" uuid NOT NULL,
  "tracking_code" text,
  "carrier" text,
  "status" text NOT NULL DEFAULT 'hazirlaniyor'::text CHECK (status = ANY (ARRAY['hazirlaniyor'::text, 'kargoda'::text, 'teslim_edildi'::text])),
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("id")
);
ALTER TABLE public.shipping ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.services (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "usta_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "price" numeric NOT NULL,
  "duration" integer,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("id")
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.appointments (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "usta_id" uuid NOT NULL,
  "customer_id" uuid NOT NULL,
  "service_id" uuid NOT NULL,
  "scheduled_at" timestamp with time zone NOT NULL,
  "status" text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text])),
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("id")
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.service_areas (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "usta_id" uuid NOT NULL,
  "city" text NOT NULL,
  "district" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("id")
);
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.portfolios (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "usta_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "image_url" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("id")
);
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.verification_logs (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "old_status" text,
  "new_status" text NOT NULL,
  "notes" text,
  "changed_by" uuid,
  "changed_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("id")
);
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.service_offers (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "service_request_id" uuid NOT NULL,
  "usta_id" uuid NOT NULL,
  "price_offer" numeric NOT NULL,
  "estimated_arrival" text,
  "notes" text,
  "status" text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])),
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("id")
);
ALTER TABLE public.service_offers ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.technician_documents (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "usta_id" uuid,
  "document_type" text NOT NULL,
  "file_url" text NOT NULL,
  "status" public.document_status DEFAULT 'PENDING'::document_status,
  "rejection_reason" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("id")
);
ALTER TABLE public.technician_documents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN ALTER TABLE public.user_activity ADD CONSTRAINT user_activity_user_id_fkey FOREIGN KEY ("user_id") REFERENCES auth.users ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.usta_reviews ADD CONSTRAINT usta_reviews_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY ("id") REFERENCES auth.users ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.products ADD CONSTRAINT products_vendor_id_fkey FOREIGN KEY ("vendor_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.order_items ADD CONSTRAINT order_items_vendor_id_fkey FOREIGN KEY ("vendor_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.vendor_commissions ADD CONSTRAINT vendor_commissions_vendor_id_fkey FOREIGN KEY ("vendor_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.vendor_commissions ADD CONSTRAINT vendor_commissions_changed_by_fkey FOREIGN KEY ("changed_by") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.profiles ADD CONSTRAINT profiles_store_id_fkey FOREIGN KEY ("store_id") REFERENCES public.stores ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.technician_stats ADD CONSTRAINT technician_stats_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.stores ADD CONSTRAINT stores_owner_id_fkey FOREIGN KEY ("owner_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.notifications ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY ("recipient_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.service_requests ADD CONSTRAINT service_requests_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.usta_availability ADD CONSTRAINT usta_availability_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.usta_service_areas ADD CONSTRAINT usta_service_areas_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.usta_services ADD CONSTRAINT usta_services_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.shipping ADD CONSTRAINT shipping_vendor_id_fkey FOREIGN KEY ("vendor_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.services ADD CONSTRAINT services_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.appointments ADD CONSTRAINT appointments_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.appointments ADD CONSTRAINT appointments_customer_id_fkey FOREIGN KEY ("customer_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.service_areas ADD CONSTRAINT service_areas_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.portfolios ADD CONSTRAINT portfolios_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.verification_logs ADD CONSTRAINT verification_logs_user_id_fkey FOREIGN KEY ("user_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.verification_logs ADD CONSTRAINT verification_logs_changed_by_fkey FOREIGN KEY ("changed_by") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.service_offers ADD CONSTRAINT service_offers_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.technician_documents ADD CONSTRAINT technician_documents_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.products ADD CONSTRAINT products_store_id_fkey FOREIGN KEY ("store_id") REFERENCES public.stores ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.favorites ADD CONSTRAINT favorites_product_id_fkey FOREIGN KEY ("product_id") REFERENCES public.products ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.reviews ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY ("product_id") REFERENCES public.products ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.products ADD CONSTRAINT products_vendor_id_fkey FOREIGN KEY ("vendor_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY ("product_id") REFERENCES public.products ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY ("user_id") REFERENCES auth.users ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.order_items ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY ("order_id") REFERENCES public.orders ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.orders ADD CONSTRAINT orders_store_id_fkey FOREIGN KEY ("store_id") REFERENCES public.stores ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.shipping ADD CONSTRAINT shipping_order_id_fkey FOREIGN KEY ("order_id") REFERENCES public.orders ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.order_items ADD CONSTRAINT order_items_vendor_id_fkey FOREIGN KEY ("vendor_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.order_items ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY ("order_id") REFERENCES public.orders ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY ("product_id") REFERENCES public.products ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.vendor_commissions ADD CONSTRAINT vendor_commissions_vendor_id_fkey FOREIGN KEY ("vendor_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.vendor_commissions ADD CONSTRAINT vendor_commissions_changed_by_fkey FOREIGN KEY ("changed_by") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.stores ADD CONSTRAINT stores_owner_id_fkey FOREIGN KEY ("owner_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.orders ADD CONSTRAINT orders_store_id_fkey FOREIGN KEY ("store_id") REFERENCES public.stores ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.products ADD CONSTRAINT products_store_id_fkey FOREIGN KEY ("store_id") REFERENCES public.stores ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.profiles ADD CONSTRAINT profiles_store_id_fkey FOREIGN KEY ("store_id") REFERENCES public.stores ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.reviews ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY ("user_id") REFERENCES auth.users ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.reviews ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY ("product_id") REFERENCES public.products ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.favorites ADD CONSTRAINT favorites_product_id_fkey FOREIGN KEY ("product_id") REFERENCES public.products ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.favorites ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY ("user_id") REFERENCES auth.users ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.addresses ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY ("user_id") REFERENCES auth.users ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.technician_stats ADD CONSTRAINT technician_stats_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.verification_documents ADD CONSTRAINT verification_documents_user_id_fkey FOREIGN KEY ("user_id") REFERENCES auth.users ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.notifications ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY ("recipient_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.usta_reviews ADD CONSTRAINT usta_reviews_service_request_id_fkey FOREIGN KEY ("service_request_id") REFERENCES public.service_requests ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.service_requests ADD CONSTRAINT service_requests_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.service_requests ADD CONSTRAINT service_requests_customer_id_fkey FOREIGN KEY ("customer_id") REFERENCES auth.users ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.service_offers ADD CONSTRAINT service_offers_service_request_id_fkey FOREIGN KEY ("service_request_id") REFERENCES public.service_requests ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.usta_availability ADD CONSTRAINT usta_availability_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.usta_service_areas ADD CONSTRAINT usta_service_areas_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.usta_services ADD CONSTRAINT usta_services_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.usta_reviews ADD CONSTRAINT usta_reviews_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.usta_reviews ADD CONSTRAINT usta_reviews_service_request_id_fkey FOREIGN KEY ("service_request_id") REFERENCES public.service_requests ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.usta_reviews ADD CONSTRAINT usta_reviews_customer_id_fkey FOREIGN KEY ("customer_id") REFERENCES auth.users ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.shipping ADD CONSTRAINT shipping_order_id_fkey FOREIGN KEY ("order_id") REFERENCES public.orders ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.shipping ADD CONSTRAINT shipping_vendor_id_fkey FOREIGN KEY ("vendor_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.appointments ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY ("service_id") REFERENCES public.services ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.services ADD CONSTRAINT services_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.appointments ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY ("service_id") REFERENCES public.services ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.appointments ADD CONSTRAINT appointments_customer_id_fkey FOREIGN KEY ("customer_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.appointments ADD CONSTRAINT appointments_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.service_areas ADD CONSTRAINT service_areas_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.portfolios ADD CONSTRAINT portfolios_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.verification_logs ADD CONSTRAINT verification_logs_changed_by_fkey FOREIGN KEY ("changed_by") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.verification_logs ADD CONSTRAINT verification_logs_user_id_fkey FOREIGN KEY ("user_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.service_offers ADD CONSTRAINT service_offers_service_request_id_fkey FOREIGN KEY ("service_request_id") REFERENCES public.service_requests ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.service_offers ADD CONSTRAINT service_offers_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE public.technician_documents ADD CONSTRAINT technician_documents_usta_id_fkey FOREIGN KEY ("usta_id") REFERENCES public.profiles ("id"); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert their own activity" ON public.user_activity FOR INSERT TO public WITH CHECK ((auth.uid() = user_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can view their own activity" ON public.user_activity FOR SELECT TO public USING ((auth.uid() = user_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "admins_all_notifications" ON public.notifications FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "own_notifications" ON public.notifications FOR SELECT TO public USING ((recipient_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Super admin manages commissions" ON public.vendor_commissions FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'super_admin'::text))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Vendor reads own commissions" ON public.vendor_commissions FOR SELECT TO public USING ((vendor_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Vendor sees own order items" ON public.order_items FOR SELECT TO public USING ((vendor_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Vendors view store order items" ON public.order_items FOR SELECT TO public USING ((product_id IN ( SELECT p.id
   FROM (products p
     JOIN stores s ON ((p.store_id = s.id)))
  WHERE (s.owner_id = auth.uid())))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "order_items_insert_policy" ON public.order_items FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid()))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "order_items_select_policy" ON public.order_items FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND ((orders.user_id = auth.uid()) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'ADMIN'::text, 'SUPER_ADMIN'::text]))))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "orders_manage_policy_v2" ON public.orders FOR ALL TO authenticated USING (((user_id = auth.uid()) OR (store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = auth.uid()))) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'ADMIN'::text, 'SUPER_ADMIN'::text])))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "orders_select_policy_v2" ON public.orders FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR (store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = auth.uid()))) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'ADMIN'::text, 'SUPER_ADMIN'::text])))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Customers can view shipping records of their orders" ON public.shipping FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = shipping.order_id) AND (orders.user_id = auth.uid()))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Vendors can insert their own shipping records" ON public.shipping FOR INSERT TO public WITH CHECK ((auth.uid() = vendor_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Vendors can update their own shipping records" ON public.shipping FOR UPDATE TO public USING ((auth.uid() = vendor_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Vendors can view their own shipping records" ON public.shipping FOR SELECT TO public USING ((auth.uid() = vendor_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "stores_delete_policy" ON public.stores FOR DELETE TO public USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'ADMIN'::text, 'SUPER_ADMIN'::text]))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "stores_insert_policy" ON public.stores FOR INSERT TO public WITH CHECK (((auth.uid() = owner_id) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'ADMIN'::text, 'SUPER_ADMIN'::text])))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "stores_select_policy" ON public.stores FOR SELECT TO public USING (((is_active = true) OR (auth.uid() = owner_id) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'ADMIN'::text, 'SUPER_ADMIN'::text])))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "stores_update_policy" ON public.stores FOR UPDATE TO public USING (((auth.uid() = owner_id) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'ADMIN'::text, 'SUPER_ADMIN'::text])))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Herkes müsaitlikleri görebilir" ON public.usta_availability FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Usta kendi müsaitliğini yönetir" ON public.usta_availability FOR ALL TO public USING ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Customers can create requests" ON public.service_requests FOR INSERT TO public WITH CHECK ((auth.uid() = customer_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Customers can create service requests" ON public.service_requests FOR INSERT TO public WITH CHECK ((auth.uid() = customer_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Customers can view their own service requests" ON public.service_requests FOR SELECT TO public USING ((auth.uid() = customer_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Customers can view their requests" ON public.service_requests FOR SELECT TO public USING ((auth.uid() = customer_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Müşteri talep oluşturabilir" ON public.service_requests FOR INSERT TO public WITH CHECK ((auth.uid() = customer_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Müşteriler kendi taleplerini görür" ON public.service_requests FOR SELECT TO public USING ((auth.uid() = customer_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Technicians and admins can update service requests" ON public.service_requests FOR UPDATE TO authenticated USING ((is_usta() OR is_admin() OR (auth.uid() = customer_id) OR (auth.uid() = usta_id))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Technicians and admins can view service requests" ON public.service_requests FOR SELECT TO authenticated USING ((is_usta() OR is_admin() OR (auth.uid() = customer_id) OR (auth.uid() = usta_id))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Usta can update assigned service requests" ON public.service_requests FOR UPDATE TO public USING ((auth.uid() = usta_id)) WITH CHECK ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Usta can view assigned service requests" ON public.service_requests FOR SELECT TO public USING ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Usta kendisine atanan talepleri görür" ON public.service_requests FOR SELECT TO public USING ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Usta talepleri güncelleyebilir" ON public.service_requests FOR UPDATE TO public USING ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users insert own reviews" ON public.reviews FOR INSERT TO public WITH CHECK ((auth.uid() = user_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL TO public USING ((auth.uid() = user_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Herkes yorumları görebilir" ON public.usta_reviews FOR SELECT TO public USING ((is_visible = true)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Müşteri yorum yazabilir" ON public.usta_reviews FOR INSERT TO public WITH CHECK ((auth.uid() = customer_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Customers can cancel their appointments" ON public.appointments FOR UPDATE TO public USING (((auth.uid() = customer_id) AND (status = 'pending'::text))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Customers can create appointments" ON public.appointments FOR INSERT TO public WITH CHECK ((auth.uid() = customer_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Customers can view their appointments" ON public.appointments FOR SELECT TO public USING ((auth.uid() = customer_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Technicians can update their appointments" ON public.appointments FOR UPDATE TO public USING ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Technicians can view their appointments" ON public.appointments FOR SELECT TO public USING ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Kullanıcılar belge yükleyebilir" ON public.verification_documents FOR INSERT TO public WITH CHECK ((auth.uid() = user_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Kullanıcılar kendi belgelerini görebilir" ON public.verification_documents FOR SELECT TO public USING ((auth.uid() = user_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Yöneticiler belgeleri güncelleyebilir" ON public.verification_documents FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['ADMIN'::text, 'SUPER_ADMIN'::text, 'admin'::text, 'super_admin'::text])))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Yöneticiler belgeleri okuyabilir" ON public.verification_documents FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['ADMIN'::text, 'SUPER_ADMIN'::text, 'admin'::text, 'super_admin'::text])))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Everyone can view services" ON public.services FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Technicians can delete their own services" ON public.services FOR DELETE TO public USING ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Technicians can insert their own services" ON public.services FOR INSERT TO public WITH CHECK ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Technicians can update their own services" ON public.services FOR UPDATE TO public USING ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "delete_own_addresses" ON public.addresses FOR DELETE TO public USING ((auth.uid() = user_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "insert_own_addresses" ON public.addresses FOR INSERT TO public WITH CHECK ((auth.uid() = user_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "select_own_addresses" ON public.addresses FOR SELECT TO public USING ((auth.uid() = user_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "update_own_addresses" ON public.addresses FOR UPDATE TO public USING ((auth.uid() = user_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Everyone can view service areas" ON public.service_areas FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Technicians can manage their service areas" ON public.service_areas FOR ALL TO public USING ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "profiles_select_policy_v3" ON public.profiles FOR SELECT TO authenticated USING (((auth.uid() = id) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'ADMIN'::text, 'SUPER_ADMIN'::text])))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "profiles_update_policy_v3" ON public.profiles FOR UPDATE TO authenticated USING (((auth.uid() = id) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'ADMIN'::text, 'SUPER_ADMIN'::text])))) WITH CHECK (((auth.uid() = id) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'ADMIN'::text, 'SUPER_ADMIN'::text])))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Everyone can view portfolios" ON public.portfolios FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Technicians can manage their portfolios" ON public.portfolios FOR ALL TO public USING ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage all products" ON public.products FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can view all products" ON public.products FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Adminler her seyi yapabilir products" ON public.products FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['ADMIN'::text, 'admin'::text, 'super_admin'::text, 'SUPER_ADMIN'::text])))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Herkes aktif ürünleri görebilir" ON public.products FOR SELECT TO public USING (((status = 'active'::text) OR (is_active = true))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Herkes urunleri okuyabilir" ON public.products FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public can view active products" ON public.products FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Saticilar kendi urunlerini ekleyebilir" ON public.products FOR INSERT TO public WITH CHECK (((auth.uid() = vendor_id) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['SELLER'::text, 'seller'::text, 'vendor'::text, 'VENDOR'::text, 'TECHNICIAN'::text, 'technician'::text, 'usta'::text, 'USTA'::text]))))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Saticilar sadece kendi urunlerini guncelleyebilir" ON public.products FOR UPDATE TO public USING ((auth.uid() = vendor_id)) WITH CHECK ((auth.uid() = vendor_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Saticilar sadece kendi urunlerini silebilir" ON public.products FOR DELETE TO public USING ((auth.uid() = vendor_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Satıcılar kendi ürünlerini yönetebilir" ON public.products FOR ALL TO public USING ((store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = auth.uid())))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Super admins can update products" ON public.products FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'super_admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'super_admin'::text))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Vendor can delete own products" ON public.products FOR DELETE TO public USING ((vendor_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Vendor can insert own products" ON public.products FOR INSERT TO public WITH CHECK ((vendor_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Vendor can update own products" ON public.products FOR UPDATE TO public USING ((vendor_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Vendor can view own products" ON public.products FOR SELECT TO public USING ((vendor_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Vendors can insert products to their store" ON public.products FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM stores
  WHERE ((stores.id = products.store_id) AND (stores.owner_id = auth.uid()))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Vendors can manage their store products" ON public.products FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM stores
  WHERE ((stores.id = products.store_id) AND (stores.owner_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM stores
  WHERE ((stores.id = products.store_id) AND (stores.owner_id = auth.uid()))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Vendors delete own products" ON public.products FOR DELETE TO public USING ((store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = auth.uid())))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Vendors insert own products" ON public.products FOR INSERT TO public WITH CHECK ((store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = auth.uid())))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Vendors manage own products" ON public.products FOR UPDATE TO public USING ((store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = auth.uid())))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Yöneticiler her seyi yapabilir" ON public.products FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'ADMIN'::text) OR (profiles.role = 'super_admin'::text) OR (profiles.role = 'admin'::text)))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admins can view all logs" ON public.verification_logs FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'ADMIN'::text) OR (profiles.role = 'SUPER_ADMIN'::text) OR (profiles.role = 'admin'::text) OR (profiles.role = 'super_admin'::text)))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can view their own logs" ON public.verification_logs FOR SELECT TO public USING ((auth.uid() = user_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Customers can view offers for their requests" ON public.service_offers FOR SELECT TO public USING (((EXISTS ( SELECT 1
   FROM service_requests
  WHERE ((service_requests.id = service_offers.service_request_id) AND (service_requests.customer_id = auth.uid())))) OR (auth.uid() = usta_id))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Verified technicians can create offers" ON public.service_offers FOR INSERT TO public WITH CHECK (((COALESCE((((auth.jwt() -> 'app_metadata'::text) ->> 'is_verified'::text))::boolean, false) = true) AND (auth.uid() = usta_id))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Adminler tüm belgeleri görebilir ve güncelleyebilir" ON public.technician_documents FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'ADMIN'::text) OR (profiles.role = 'SUPER_ADMIN'::text)))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Ustalar belge yükleyebilir" ON public.technician_documents FOR INSERT TO public WITH CHECK ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Ustalar kendi belgelerini görebilir" ON public.technician_documents FOR SELECT TO public USING ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Herkes technician_stats okuyabilir" ON public.technician_stats FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public can only see approved technician stats" ON public.technician_stats FOR SELECT TO public USING (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = technician_stats.usta_id) AND (profiles.verification_status = 'approved'::text)))) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['ADMIN'::text, 'SUPER_ADMIN'::text, 'admin'::text, 'super_admin'::text]))))))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Herkes hizmetleri görebilir" ON public.usta_services FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Herkes usta_services okuyabilir" ON public.usta_services FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Usta kendi hizmetlerini ekleyebilir" ON public.usta_services FOR INSERT TO public WITH CHECK ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Usta kendi hizmetlerini güncelleyebilir" ON public.usta_services FOR UPDATE TO public USING ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Usta kendi hizmetlerini silebilir" ON public.usta_services FOR DELETE TO public USING ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Usta kendi hizmetlerini yönetir" ON public.usta_services FOR ALL TO public USING ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Herkes hizmet bölgelerini görebilir" ON public.usta_service_areas FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Herkes usta_service_areas okuyabilir" ON public.usta_service_areas FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Usta kendi bölgelerini yönetir" ON public.usta_service_areas FOR ALL TO public USING ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Usta kendi hizmet bölgelerini yönetebilir" ON public.usta_service_areas FOR ALL TO public USING ((auth.uid() = usta_id)) WITH CHECK ((auth.uid() = usta_id)); EXCEPTION WHEN duplicate_object THEN null; END $$;
