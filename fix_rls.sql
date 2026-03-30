DROP POLICY IF EXISTS "Users can insert their own activity" ON "public"."user_activity";
CREATE POLICY "Users can insert their own activity" ON "public"."user_activity" FOR INSERT TO public WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Users can view their own activity" ON "public"."user_activity";
CREATE POLICY "Users can view their own activity" ON "public"."user_activity" FOR SELECT TO public USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "admins_all_notifications" ON "public"."notifications";
CREATE POLICY "admins_all_notifications" ON "public"."notifications" FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));
DROP POLICY IF EXISTS "own_notifications" ON "public"."notifications";
CREATE POLICY "own_notifications" ON "public"."notifications" FOR SELECT TO public USING ((recipient_id = (select auth.uid())));
DROP POLICY IF EXISTS "Super admin manages commissions" ON "public"."vendor_commissions";
CREATE POLICY "Super admin manages commissions" ON "public"."vendor_commissions" FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.role = 'super_admin'::text)))));
DROP POLICY IF EXISTS "Vendor reads own commissions" ON "public"."vendor_commissions";
CREATE POLICY "Vendor reads own commissions" ON "public"."vendor_commissions" FOR SELECT TO public USING ((vendor_id = (select auth.uid())));
DROP POLICY IF EXISTS "Vendor sees own order items" ON "public"."order_items";
CREATE POLICY "Vendor sees own order items" ON "public"."order_items" FOR SELECT TO public USING ((vendor_id = (select auth.uid())));
DROP POLICY IF EXISTS "Vendors view store order items" ON "public"."order_items";
CREATE POLICY "Vendors view store order items" ON "public"."order_items" FOR SELECT TO public USING ((product_id IN ( SELECT p.id
   FROM (products p
     JOIN stores s ON ((p.store_id = s.id)))
  WHERE (s.owner_id = (select auth.uid())))));
DROP POLICY IF EXISTS "order_items_insert_policy" ON "public"."order_items";
CREATE POLICY "order_items_insert_policy" ON "public"."order_items" FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = (select auth.uid()))))));
DROP POLICY IF EXISTS "Customers can view shipping records of their orders" ON "public"."shipping";
CREATE POLICY "Customers can view shipping records of their orders" ON "public"."shipping" FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = shipping.order_id) AND (orders.user_id = (select auth.uid()))))));
DROP POLICY IF EXISTS "Vendors can insert their own shipping records" ON "public"."shipping";
CREATE POLICY "Vendors can insert their own shipping records" ON "public"."shipping" FOR INSERT TO public WITH CHECK (((select auth.uid()) = vendor_id));
DROP POLICY IF EXISTS "Vendors can update their own shipping records" ON "public"."shipping";
CREATE POLICY "Vendors can update their own shipping records" ON "public"."shipping" FOR UPDATE TO public USING (((select auth.uid()) = vendor_id));
DROP POLICY IF EXISTS "Vendors can view their own shipping records" ON "public"."shipping";
CREATE POLICY "Vendors can view their own shipping records" ON "public"."shipping" FOR SELECT TO public USING (((select auth.uid()) = vendor_id));
DROP POLICY IF EXISTS "Usta kendi müsaitliğini yönetir" ON "public"."usta_availability";
CREATE POLICY "Usta kendi müsaitliğini yönetir" ON "public"."usta_availability" FOR ALL TO public USING (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Customers can create requests" ON "public"."service_requests";
CREATE POLICY "Customers can create requests" ON "public"."service_requests" FOR INSERT TO public WITH CHECK (((select auth.uid()) = customer_id));
DROP POLICY IF EXISTS "Customers can create service requests" ON "public"."service_requests";
CREATE POLICY "Customers can create service requests" ON "public"."service_requests" FOR INSERT TO public WITH CHECK (((select auth.uid()) = customer_id));
DROP POLICY IF EXISTS "Customers can view their own service requests" ON "public"."service_requests";
CREATE POLICY "Customers can view their own service requests" ON "public"."service_requests" FOR SELECT TO public USING (((select auth.uid()) = customer_id));
DROP POLICY IF EXISTS "Customers can view their requests" ON "public"."service_requests";
CREATE POLICY "Customers can view their requests" ON "public"."service_requests" FOR SELECT TO public USING (((select auth.uid()) = customer_id));
DROP POLICY IF EXISTS "Müşteri talep oluşturabilir" ON "public"."service_requests";
CREATE POLICY "Müşteri talep oluşturabilir" ON "public"."service_requests" FOR INSERT TO public WITH CHECK (((select auth.uid()) = customer_id));
DROP POLICY IF EXISTS "Müşteriler kendi taleplerini görür" ON "public"."service_requests";
CREATE POLICY "Müşteriler kendi taleplerini görür" ON "public"."service_requests" FOR SELECT TO public USING (((select auth.uid()) = customer_id));
DROP POLICY IF EXISTS "Usta can update assigned service requests" ON "public"."service_requests";
CREATE POLICY "Usta can update assigned service requests" ON "public"."service_requests" FOR UPDATE TO public USING (((select auth.uid()) = usta_id)) WITH CHECK (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Usta can view assigned service requests" ON "public"."service_requests";
CREATE POLICY "Usta can view assigned service requests" ON "public"."service_requests" FOR SELECT TO public USING (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Usta kendisine atanan talepleri görür" ON "public"."service_requests";
CREATE POLICY "Usta kendisine atanan talepleri görür" ON "public"."service_requests" FOR SELECT TO public USING (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Usta talepleri güncelleyebilir" ON "public"."service_requests";
CREATE POLICY "Usta talepleri güncelleyebilir" ON "public"."service_requests" FOR UPDATE TO public USING (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Users insert own reviews" ON "public"."reviews";
CREATE POLICY "Users insert own reviews" ON "public"."reviews" FOR INSERT TO public WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Users manage own favorites" ON "public"."favorites";
CREATE POLICY "Users manage own favorites" ON "public"."favorites" FOR ALL TO public USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Müşteri yorum yazabilir" ON "public"."usta_reviews";
CREATE POLICY "Müşteri yorum yazabilir" ON "public"."usta_reviews" FOR INSERT TO public WITH CHECK (((select auth.uid()) = customer_id));
DROP POLICY IF EXISTS "Customers can cancel their appointments" ON "public"."appointments";
CREATE POLICY "Customers can cancel their appointments" ON "public"."appointments" FOR UPDATE TO public USING ((((select auth.uid()) = customer_id) AND (status = 'pending'::text)));
DROP POLICY IF EXISTS "Customers can create appointments" ON "public"."appointments";
CREATE POLICY "Customers can create appointments" ON "public"."appointments" FOR INSERT TO public WITH CHECK (((select auth.uid()) = customer_id));
DROP POLICY IF EXISTS "Customers can view their appointments" ON "public"."appointments";
CREATE POLICY "Customers can view their appointments" ON "public"."appointments" FOR SELECT TO public USING (((select auth.uid()) = customer_id));
DROP POLICY IF EXISTS "Technicians can update their appointments" ON "public"."appointments";
CREATE POLICY "Technicians can update their appointments" ON "public"."appointments" FOR UPDATE TO public USING (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Technicians can view their appointments" ON "public"."appointments";
CREATE POLICY "Technicians can view their appointments" ON "public"."appointments" FOR SELECT TO public USING (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Kullanıcılar belge yükleyebilir" ON "public"."verification_documents";
CREATE POLICY "Kullanıcılar belge yükleyebilir" ON "public"."verification_documents" FOR INSERT TO public WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Kullanıcılar kendi belgelerini görebilir" ON "public"."verification_documents";
CREATE POLICY "Kullanıcılar kendi belgelerini görebilir" ON "public"."verification_documents" FOR SELECT TO public USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Yöneticiler belgeleri güncelleyebilir" ON "public"."verification_documents";
CREATE POLICY "Yöneticiler belgeleri güncelleyebilir" ON "public"."verification_documents" FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.role = ANY (ARRAY['ADMIN'::text, 'SUPER_ADMIN'::text, 'admin'::text, 'super_admin'::text]))))));
DROP POLICY IF EXISTS "Yöneticiler belgeleri okuyabilir" ON "public"."verification_documents";
CREATE POLICY "Yöneticiler belgeleri okuyabilir" ON "public"."verification_documents" FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.role = ANY (ARRAY['ADMIN'::text, 'SUPER_ADMIN'::text, 'admin'::text, 'super_admin'::text]))))));
DROP POLICY IF EXISTS "Technicians can delete their own services" ON "public"."services";
CREATE POLICY "Technicians can delete their own services" ON "public"."services" FOR DELETE TO public USING (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Technicians can insert their own services" ON "public"."services";
CREATE POLICY "Technicians can insert their own services" ON "public"."services" FOR INSERT TO public WITH CHECK (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Technicians can update their own services" ON "public"."services";
CREATE POLICY "Technicians can update their own services" ON "public"."services" FOR UPDATE TO public USING (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "delete_own_addresses" ON "public"."addresses";
CREATE POLICY "delete_own_addresses" ON "public"."addresses" FOR DELETE TO public USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "insert_own_addresses" ON "public"."addresses";
CREATE POLICY "insert_own_addresses" ON "public"."addresses" FOR INSERT TO public WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "select_own_addresses" ON "public"."addresses";
CREATE POLICY "select_own_addresses" ON "public"."addresses" FOR SELECT TO public USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "update_own_addresses" ON "public"."addresses";
CREATE POLICY "update_own_addresses" ON "public"."addresses" FOR UPDATE TO public USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Technicians can manage their service areas" ON "public"."service_areas";
CREATE POLICY "Technicians can manage their service areas" ON "public"."service_areas" FOR ALL TO public USING (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Technicians can manage their portfolios" ON "public"."portfolios";
CREATE POLICY "Technicians can manage their portfolios" ON "public"."portfolios" FOR ALL TO public USING (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Admin can manage all products" ON "public"."products";
CREATE POLICY "Admin can manage all products" ON "public"."products" FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));
DROP POLICY IF EXISTS "Admin can view all products" ON "public"."products";
CREATE POLICY "Admin can view all products" ON "public"."products" FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));
DROP POLICY IF EXISTS "Adminler her seyi yapabilir products" ON "public"."products";
CREATE POLICY "Adminler her seyi yapabilir products" ON "public"."products" FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.role = ANY (ARRAY['ADMIN'::text, 'admin'::text, 'super_admin'::text, 'SUPER_ADMIN'::text]))))));
DROP POLICY IF EXISTS "Saticilar kendi urunlerini ekleyebilir" ON "public"."products";
CREATE POLICY "Saticilar kendi urunlerini ekleyebilir" ON "public"."products" FOR INSERT TO public WITH CHECK ((((select auth.uid()) = vendor_id) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.role = ANY (ARRAY['SELLER'::text, 'seller'::text, 'vendor'::text, 'VENDOR'::text, 'TECHNICIAN'::text, 'technician'::text, 'usta'::text, 'USTA'::text])))))));
DROP POLICY IF EXISTS "Saticilar sadece kendi urunlerini guncelleyebilir" ON "public"."products";
CREATE POLICY "Saticilar sadece kendi urunlerini guncelleyebilir" ON "public"."products" FOR UPDATE TO public USING (((select auth.uid()) = vendor_id)) WITH CHECK (((select auth.uid()) = vendor_id));
DROP POLICY IF EXISTS "Saticilar sadece kendi urunlerini silebilir" ON "public"."products";
CREATE POLICY "Saticilar sadece kendi urunlerini silebilir" ON "public"."products" FOR DELETE TO public USING (((select auth.uid()) = vendor_id));
DROP POLICY IF EXISTS "Satıcılar kendi ürünlerini yönetebilir" ON "public"."products";
CREATE POLICY "Satıcılar kendi ürünlerini yönetebilir" ON "public"."products" FOR ALL TO public USING ((store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = (select auth.uid())))));
DROP POLICY IF EXISTS "Super admins can update products" ON "public"."products";
CREATE POLICY "Super admins can update products" ON "public"."products" FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.role = 'super_admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.role = 'super_admin'::text)))));
DROP POLICY IF EXISTS "Vendor can delete own products" ON "public"."products";
CREATE POLICY "Vendor can delete own products" ON "public"."products" FOR DELETE TO public USING ((vendor_id = (select auth.uid())));
DROP POLICY IF EXISTS "Vendor can insert own products" ON "public"."products";
CREATE POLICY "Vendor can insert own products" ON "public"."products" FOR INSERT TO public WITH CHECK ((vendor_id = (select auth.uid())));
DROP POLICY IF EXISTS "Vendor can update own products" ON "public"."products";
CREATE POLICY "Vendor can update own products" ON "public"."products" FOR UPDATE TO public USING ((vendor_id = (select auth.uid())));
DROP POLICY IF EXISTS "Vendor can view own products" ON "public"."products";
CREATE POLICY "Vendor can view own products" ON "public"."products" FOR SELECT TO public USING ((vendor_id = (select auth.uid())));
DROP POLICY IF EXISTS "Vendors can insert products to their store" ON "public"."products";
CREATE POLICY "Vendors can insert products to their store" ON "public"."products" FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM stores
  WHERE ((stores.id = products.store_id) AND (stores.owner_id = (select auth.uid()))))));
DROP POLICY IF EXISTS "Vendors can manage their store products" ON "public"."products";
CREATE POLICY "Vendors can manage their store products" ON "public"."products" FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM stores
  WHERE ((stores.id = products.store_id) AND (stores.owner_id = (select auth.uid())))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM stores
  WHERE ((stores.id = products.store_id) AND (stores.owner_id = (select auth.uid()))))));
DROP POLICY IF EXISTS "Users can view their own logs" ON "public"."verification_logs";
CREATE POLICY "Users can view their own logs" ON "public"."verification_logs" FOR SELECT TO public USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Vendors delete own products" ON "public"."products";
CREATE POLICY "Vendors delete own products" ON "public"."products" FOR DELETE TO public USING ((store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = (select auth.uid())))));
DROP POLICY IF EXISTS "Vendors insert own products" ON "public"."products";
CREATE POLICY "Vendors insert own products" ON "public"."products" FOR INSERT TO public WITH CHECK ((store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = (select auth.uid())))));
DROP POLICY IF EXISTS "Vendors manage own products" ON "public"."products";
CREATE POLICY "Vendors manage own products" ON "public"."products" FOR UPDATE TO public USING ((store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = (select auth.uid())))));
DROP POLICY IF EXISTS "Yöneticiler her seyi yapabilir" ON "public"."products";
CREATE POLICY "Yöneticiler her seyi yapabilir" ON "public"."products" FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND ((profiles.role = 'ADMIN'::text) OR (profiles.role = 'super_admin'::text) OR (profiles.role = 'admin'::text))))));
DROP POLICY IF EXISTS "Admins can view all logs" ON "public"."verification_logs";
CREATE POLICY "Admins can view all logs" ON "public"."verification_logs" FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND ((profiles.role = 'ADMIN'::text) OR (profiles.role = 'SUPER_ADMIN'::text) OR (profiles.role = 'admin'::text) OR (profiles.role = 'super_admin'::text))))));
DROP POLICY IF EXISTS "Customers can view offers for their requests" ON "public"."service_offers";
CREATE POLICY "Customers can view offers for their requests" ON "public"."service_offers" FOR SELECT TO public USING (((EXISTS ( SELECT 1
   FROM service_requests
  WHERE ((service_requests.id = service_offers.service_request_id) AND (service_requests.customer_id = (select auth.uid()))))) OR ((select auth.uid()) = usta_id)));
DROP POLICY IF EXISTS "Verified technicians can create offers" ON "public"."service_offers";
CREATE POLICY "Verified technicians can create offers" ON "public"."service_offers" FOR INSERT TO public WITH CHECK (((COALESCE(((((select auth.jwt()) -> 'app_metadata'::text) ->> 'is_verified'::text))::boolean, false) = true) AND ((select auth.uid()) = usta_id)));
DROP POLICY IF EXISTS "Adminler tüm belgeleri görebilir ve güncelleyebilir" ON "public"."technician_documents";
CREATE POLICY "Adminler tüm belgeleri görebilir ve güncelleyebilir" ON "public"."technician_documents" FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND ((profiles.role = 'ADMIN'::text) OR (profiles.role = 'SUPER_ADMIN'::text))))));
DROP POLICY IF EXISTS "Ustalar belge yükleyebilir" ON "public"."technician_documents";
CREATE POLICY "Ustalar belge yükleyebilir" ON "public"."technician_documents" FOR INSERT TO public WITH CHECK (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Ustalar kendi belgelerini görebilir" ON "public"."technician_documents";
CREATE POLICY "Ustalar kendi belgelerini görebilir" ON "public"."technician_documents" FOR SELECT TO public USING (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Technicians and admins can view service requests" ON "public"."service_requests";
CREATE POLICY "Technicians and admins can view service requests" ON "public"."service_requests" FOR SELECT TO authenticated USING ((is_usta() OR is_admin() OR ((select auth.uid()) = customer_id) OR ((select auth.uid()) = usta_id)));
DROP POLICY IF EXISTS "Public can only see approved technician stats" ON "public"."technician_stats";
CREATE POLICY "Public can only see approved technician stats" ON "public"."technician_stats" FOR SELECT TO public USING (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = technician_stats.usta_id) AND (profiles.verification_status = 'approved'::text)))) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.role = ANY (ARRAY['ADMIN'::text, 'SUPER_ADMIN'::text, 'admin'::text, 'super_admin'::text])))))));
DROP POLICY IF EXISTS "Usta kendi hizmetlerini ekleyebilir" ON "public"."usta_services";
CREATE POLICY "Usta kendi hizmetlerini ekleyebilir" ON "public"."usta_services" FOR INSERT TO public WITH CHECK (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Usta kendi hizmetlerini güncelleyebilir" ON "public"."usta_services";
CREATE POLICY "Usta kendi hizmetlerini güncelleyebilir" ON "public"."usta_services" FOR UPDATE TO public USING (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Usta kendi hizmetlerini silebilir" ON "public"."usta_services";
CREATE POLICY "Usta kendi hizmetlerini silebilir" ON "public"."usta_services" FOR DELETE TO public USING (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Usta kendi hizmetlerini yönetir" ON "public"."usta_services";
CREATE POLICY "Usta kendi hizmetlerini yönetir" ON "public"."usta_services" FOR ALL TO public USING (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Usta kendi bölgelerini yönetir" ON "public"."usta_service_areas";
CREATE POLICY "Usta kendi bölgelerini yönetir" ON "public"."usta_service_areas" FOR ALL TO public USING (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Usta kendi hizmet bölgelerini yönetebilir" ON "public"."usta_service_areas";
CREATE POLICY "Usta kendi hizmet bölgelerini yönetebilir" ON "public"."usta_service_areas" FOR ALL TO public USING (((select auth.uid()) = usta_id)) WITH CHECK (((select auth.uid()) = usta_id));
DROP POLICY IF EXISTS "Technicians and admins can update service requests" ON "public"."service_requests";
CREATE POLICY "Technicians and admins can update service requests" ON "public"."service_requests" FOR UPDATE TO authenticated USING ((is_usta() OR is_admin() OR ((select auth.uid()) = customer_id) OR ((select auth.uid()) = usta_id)));