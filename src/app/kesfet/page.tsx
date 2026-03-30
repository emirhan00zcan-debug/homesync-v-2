import React from "react";
import DiscoveryHero from "@/components/discovery/DiscoveryHero";
import DiscoveryGrid from "@/components/discovery/DiscoveryGrid";
import CategoryHighlights from "@/components/discovery/CategoryHighlights";
import Header from "@/components/Header";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = {
    title: "Keşfet | Luxe Design Studio",
    description: "Işığı keşfet, yerçekiminden özgürleş. Geleceğin tasarımları Luxe Design Studio'da.",
};

export default async function DiscoveryPage() {
    const supabase = createAdminClient();

    // Fetch featured products for discovery feed
    const { data: featuredProducts } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Chandeliers') // Just an example of curated discovery
        .limit(6);

    return (
        <main className="min-h-screen bg-deep-space selection:bg-radiant-amber selection:text-deep-space">
            {/* Immersive Header */}
            <Header />

            {/* Hero Section - The Portal */}
            <DiscoveryHero />

            {/* Masonry Visual Feed - The Flow */}
            <DiscoveryGrid />

            {/* Visual Storytelling - The Core */}
            <CategoryHighlights />

            {/* Minimal Footer for Discovery */}
            <footer className="py-24 border-t border-white/5 text-center px-6">
                <p className="opacity-20 text-[10px] font-black tracking-[0.5em] uppercase mb-4">Luxe Design Studio • Keşfet • 2026</p>
                <div className="w-8 h-[1px] bg-radiant-amber mx-auto" />
            </footer>
        </main>
    );
}
