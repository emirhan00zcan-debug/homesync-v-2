import { createAdminClient } from '@/lib/supabase/admin';
import CatalogProductGrid from '@/components/CatalogProductGrid';

export default async function ProductListContainer({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const supabase = createAdminClient();
    
    const query = typeof searchParams.search === 'string' ? searchParams.search.toLowerCase() : '';
    const category = typeof searchParams.kategori === 'string' ? searchParams.kategori : 'all';

    let supabaseQuery = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    const { data: products, error } = await supabaseQuery;

    if (error) {
        console.error("Error fetching catalog products:", error);
    }

    const filteredProducts = (products || []).filter(product => {
        const matchesCategory = category === "all" || product.category === category;
        const matchesSearch = !query || 
            product.name.toLowerCase().includes(query) || 
            (product.category && product.category.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
    });

    return (
        <CatalogProductGrid products={filteredProducts} isLoading={false} />
    );
}
