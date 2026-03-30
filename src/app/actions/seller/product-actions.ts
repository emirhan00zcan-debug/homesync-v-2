"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { resolveStoreId } from "./utils";

// ─── Types ────────────────────────────────────────────────────────────────────
export type VendorProduct = {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock_count: number;
    category: string;
    image_url: string | null;
    is_active: boolean;
    view_count: number;
    like_count: number;
    created_at: string;
};

export async function createProduct(formData: FormData) {
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Oturum bulunamadı. Lütfen tekrar giriş yapın." };

        const { data: profile } = await supabase
            .from('profiles')
            .select('store_id, role')
            .eq('id', user.id)
            .single();

        const role = profile?.role?.toUpperCase();
        const isTechnician = role === 'TECHNICIAN' || role === 'USTA';
        const isVendor = role === 'VENDOR' || role === 'SELLER';

        if (!isTechnician && !isVendor) {
            return { success: false, error: "Bu işlemi yapma yetkiniz bulunmamaktadır." };
        }

        const storeId = profile?.store_id;
        if (!storeId && isVendor) {
            return { success: false, error: "Mağazanız henüz yapılandırılmamış. Lütfen yönetici ile iletişime geçin." };
        }

        // ── Parse form fields ──────────────────────────────────────────────────
        const name = formData.get("name") as string;
        const price = parseFloat(formData.get("price") as string);
        const lumens = parseInt(formData.get("lumens") as string) || 0;
        const wattage = parseInt(formData.get("wattage") as string) || 0;
        const material = formData.get("material") as string || "Premium Service";
        const difficulty = formData.get("difficulty") as string || "Medium";
        const manufacturer = formData.get("manufacturer") as string || (isTechnician ? "Independent Pro" : "HomeSync Vendor");
        const description = formData.get("description") as string || "";
        const category = formData.get("category") as string || "Service/Product";
        const imageUrl = formData.get("imageUrl") as string;
        const metaDescription = formData.get("meta_description") as string || null;
        const tagsRaw = formData.get("tags") as string || "";
        const tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t !== '');

        // ── Validation ─────────────────────────────────────────────────────────
        if (!name || isNaN(price) || !imageUrl) {
            return {
                success: false,
                error: "Lütfen tüm zorunlu alanları doldurun (Ad, Fiyat, Görsel)."
            };
        }

        const slug = name.toLowerCase().trim().replace(/ /g, "-").replace(/[^\w-]+/g, "") + "-" + Math.random().toString(36).substring(7);

        const { error } = await supabase.from('products').insert({
            name,
            slug,
            price,
            lumens,
            wattage,
            material,
            difficulty,
            manufacturer,
            description,
            category,
            image_url: imageUrl,
            meta_description: metaDescription,
            tags: tags.length > 0 ? tags : null,
            vendor_id: user.id,
            store_id: storeId || null,
            stock_count: isTechnician ? 999 : 10, // Technicians usually provide services, set high stock or infinite
            status: 'pending'     // Admin onayı bekliyor
        });

        if (error) throw error;

        revalidatePath("/katalog");
        revalidatePath("/dashboard/vendor");
        revalidatePath("/dashboard/technician/products");
        return { success: true };
    } catch (error) {
        console.error("Failed to create product via Supabase:", error);
        return { success: false, error: "Ürün oluşturulurken bir sunucu hatası oluştu." };
    }
}

/**
 * Get all products belonging to a store.
 */
export async function getVendorProducts(storeId: string): Promise<VendorProduct[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, price, stock_count, category, image_url, is_active, view_count, like_count, created_at')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

    return data ?? [];
}

/**
 * Get all products belonging to a technician (Usta).
 */
export async function getUstaProducts(vendorId: string): Promise<VendorProduct[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, price, stock_count, category, image_url, is_active, view_count, like_count, created_at')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[vendor-actions] getUstaProducts error:', error);
        return [];
    }

    return data ?? [];
}

// ─── Delete Product ────────────────────────────────────────────────────────────
export async function deleteVendorProduct(productId: string) {
    const supabase = createClient();

    // Verify ownership via store
    const storeId = await resolveStoreId();
    if (!storeId) return { success: false, error: 'Mağaza bulunamadı.' };

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('store_id', storeId); // RLS double-check

    if (error) {
        console.error('[vendor-actions] deleteVendorProduct error:', error);
        return { success: false, error: 'Ürün silinemedi.' };
    }

    revalidatePath("/dashboard/technician/products");
    return { success: true };
}

// ─── Update Product Stock ──────────────────────────────────────────────────────
export async function updateVendorProductStock(productId: string, newStock: number) {
    const supabase = createClient();

    // Verify ownership
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Oturum bulunamadı.' };

    const { error } = await supabase
        .from('products')
        .update({ stock_count: newStock })
        .eq('id', productId)
        .eq('vendor_id', user.id);

    if (error) {
        console.error('[vendor-actions] updateVendorProductStock error:', error);
        return { success: false, error: 'Stok güncellenemedi.' };
    }

    revalidatePath("/dashboard/technician/products");
    return { success: true };
}
