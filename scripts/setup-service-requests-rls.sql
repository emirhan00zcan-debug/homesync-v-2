-- Setup Row Level Security (RLS) for service_requests table
-- Actual columns: id, customer_id, usta_id, title, description, category,
--                 status, payment_type, price_offered, final_price,
--                 scheduled_at, completed_at, address, city, district, notes,
--                 created_at, updated_at

-- Enable RLS on the table if not already enabled
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1: Customers can view their own service requests
CREATE POLICY "Customers can view their own service requests"
ON public.service_requests
FOR SELECT
USING (auth.uid() = customer_id);

-- Policy 2: Assigned usta can view their assigned service requests
CREATE POLICY "Usta can view assigned service requests"
ON public.service_requests
FOR SELECT
USING (auth.uid() = usta_id);

-- Policy 3: Usta can update their assigned service requests (to change status)
CREATE POLICY "Usta can update assigned service requests"
ON public.service_requests
FOR UPDATE
USING (auth.uid() = usta_id)
WITH CHECK (auth.uid() = usta_id);

-- Policy 4: Super Admins can view everything
CREATE POLICY "Super Admins can view all service requests"
ON public.service_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
  )
);

-- Policy 5: Super Admins can update everything
CREATE POLICY "Super Admins can update all service requests"
ON public.service_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
  )
);

-- Policy 6: Super Admins can delete everything
CREATE POLICY "Super Admins can delete all service requests"
ON public.service_requests
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
  )
);

-- Policy 7: Authenticated customers can create service requests
CREATE POLICY "Customers can create service requests"
ON public.service_requests
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- By creating these policies, the real-time subscriptions will automatically
-- filter the payloads so that users only receive events they are authorized to see.
