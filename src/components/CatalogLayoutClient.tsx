"use client";

import React, { useState } from 'react';
import SidebarFilters from './SidebarFilters';
import CatalogTopBar from './CatalogTopBar';

export default function CatalogLayoutClient({ children }: { children: React.ReactNode }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex gap-8 items-start">
            {/* Left – Sidebar Filters (desktop sticky / mobile drawer) */}
            <SidebarFilters isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

            {/* Right – Top bar + Product Grid */}
            <div className="flex-1 min-w-0">
                <CatalogTopBar onMobileFilterClick={() => setIsMobileOpen(true)} />
                {children}
            </div>
        </div>
    );
}
