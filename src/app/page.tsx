import React from "react";
import { createAdminClient } from '@/lib/supabase/admin';
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  const supabase = createAdminClient();

  // Fetch real products from Supabase (using service role to bypass RLS for public product listing)
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(8);

  // Fetch active and verified stores
  const { data: stores } = await supabase
    .from('stores')
    .select('*')
    .eq('is_active', true)
    .eq('is_verified', true)
    .limit(3);

  // Fetch featured masters
  const { data: mastersData } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      avatar_url,
      role,
      is_verified,
      stats:technician_stats (
        toplam_puan,
        tamamlanan_is_sayisi,
        expertise_areas
      )
    `)
    .eq('role', 'usta')
    .eq('status', 'active')
    .order('is_verified', { ascending: false })
    .limit(4);

  // Normalize masters data (handling the array from the join)
  const masters = (mastersData || []).map(m => ({
    ...m,
    stats: Array.isArray(m.stats) ? m.stats[0] : m.stats
  }));

  if (error) {
    console.error("Error fetching products:", error);
  }

  return (
    <HomeClient 
      initialProducts={products || []} 
      stores={stores || []} 
      masters={masters as any[]} 
    />
  );
}
