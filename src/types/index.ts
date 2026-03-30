export interface Review {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date | string;
    user: {
        name: string | null;
    };
}

export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    category?: string;
    imageUrl?: string;
    manufacturer?: string;
    lumens?: number;
    wattage?: number;
    material?: string;
    isInstallationIncluded?: boolean;
    features?: { label: string; value: string }[];
    likeCount?: number;
    averageRating?: number;
    viewCount?: number;
    reviews?: Review[];
    store?: {
        id: string;
        name: string;
        slug: string;
    };
}

export interface ShippingInfo {
    fullName: string;
    phone: string;
    email: string;
    city: string;
    address: string;
}

export interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    shipping_name: string;
    shipping_phone: string;
    shipping_email: string;
    shipping_city: string;
    shipping_address: string;
    status: 'PAID' | 'PENDING' | 'CANCELLED' | 'SHIPPED';
    createdAt: Date | string;
}

export interface OrderItem {
    id?: string;
    orderId?: string;
    productId: string;
    quantity: number;
    price: number;
}

export interface Master {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
    stats?: {
        toplam_puan: number;
        tamamlanan_is_sayisi: number;
        expertise_areas?: string;
    };
    is_verified?: boolean;
}
