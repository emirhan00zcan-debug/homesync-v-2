
DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.addresses'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_addresses_user_id_fkey' || ' ON public.addresses (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.appointments'::regclass
      AND attnum IN (3);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_appointments_customer_id_fkey' || ' ON public.appointments (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.appointments'::regclass
      AND attnum IN (4);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_appointments_service_id_fkey' || ' ON public.appointments (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.appointments'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_appointments_usta_id_fkey' || ' ON public.appointments (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.favorites'::regclass
      AND attnum IN (3);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_favorites_product_id_fkey' || ' ON public.favorites (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.favorites'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_favorites_user_id_fkey' || ' ON public.favorites (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.notifications'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id_fkey' || ' ON public.notifications (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.order_items'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_order_items_order_id_fkey' || ' ON public.order_items (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.order_items'::regclass
      AND attnum IN (3);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_order_items_product_id_fkey' || ' ON public.order_items (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.order_items'::regclass
      AND attnum IN (4);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_order_items_vendor_id_fkey' || ' ON public.order_items (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.orders'::regclass
      AND attnum IN (7);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_store_id_fkey' || ' ON public.orders (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.orders'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_user_id_fkey' || ' ON public.orders (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.portfolios'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_portfolios_usta_id_fkey' || ' ON public.portfolios (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.products'::regclass
      AND attnum IN (18);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_products_store_id_fkey' || ' ON public.products (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.products'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_products_vendor_id_fkey' || ' ON public.products (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.profiles'::regclass
      AND attnum IN (10);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_store_id_fkey' || ' ON public.profiles (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.reviews'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reviews_product_id_fkey' || ' ON public.reviews (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.reviews'::regclass
      AND attnum IN (3);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reviews_user_id_fkey' || ' ON public.reviews (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.service_areas'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_service_areas_usta_id_fkey' || ' ON public.service_areas (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.service_offers'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_service_offers_service_request_id_fkey' || ' ON public.service_offers (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.service_offers'::regclass
      AND attnum IN (3);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_service_offers_usta_id_fkey' || ' ON public.service_offers (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.service_requests'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_service_requests_customer_id_fkey' || ' ON public.service_requests (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.service_requests'::regclass
      AND attnum IN (3);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_service_requests_usta_id_fkey' || ' ON public.service_requests (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.services'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_services_usta_id_fkey' || ' ON public.services (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.shipping'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_shipping_order_id_fkey' || ' ON public.shipping (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.shipping'::regclass
      AND attnum IN (3);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_shipping_vendor_id_fkey' || ' ON public.shipping (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.stores'::regclass
      AND attnum IN (4);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_stores_owner_id_fkey' || ' ON public.stores (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.technician_documents'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_technician_documents_usta_id_fkey' || ' ON public.technician_documents (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.user_activity'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_user_activity_user_id_fkey' || ' ON public.user_activity (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.usta_availability'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_usta_availability_usta_id_fkey' || ' ON public.usta_availability (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.usta_reviews'::regclass
      AND attnum IN (3);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_usta_reviews_customer_id_fkey' || ' ON public.usta_reviews (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.usta_reviews'::regclass
      AND attnum IN (4);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_usta_reviews_service_request_id_fkey' || ' ON public.usta_reviews (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.usta_reviews'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_usta_reviews_usta_id_fkey' || ' ON public.usta_reviews (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.usta_service_areas'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_usta_service_areas_usta_id_fkey' || ' ON public.usta_service_areas (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.usta_services'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_usta_services_usta_id_fkey' || ' ON public.usta_services (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.vendor_commissions'::regclass
      AND attnum IN (4);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_vendor_commissions_changed_by_fkey' || ' ON public.vendor_commissions (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.vendor_commissions'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_vendor_commissions_vendor_id_fkey' || ' ON public.vendor_commissions (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.verification_documents'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id_fkey' || ' ON public.verification_documents (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.verification_logs'::regclass
      AND attnum IN (6);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_verification_logs_changed_by_fkey' || ' ON public.verification_logs (' || col_names || ')';
END $$;
    

DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = 'public.verification_logs'::regclass
      AND attnum IN (2);
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_verification_logs_user_id_fkey' || ' ON public.verification_logs (' || col_names || ')';
END $$;
    