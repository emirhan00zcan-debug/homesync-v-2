"use client";

import React, { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function UserTrackerInner() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const trackActivity = async () => {
            // Determine activity type based on path
            let activityType = null;
            let entityId = null;
            let metadata = {};

            if (pathname.startsWith('/product/')) {
                activityType = 'view_product';
                entityId = pathname.split('/').pop();
            } else if (pathname === '/pro') {
                activityType = 'view_pro_dashboard';
            } else if (pathname.startsWith('/katalog')) {
                const category = searchParams.get('category');
                if (category) {
                    activityType = 'view_category';
                    metadata = { category };
                }
            }

            if (activityType) {
                try {
                    await fetch('/api/track', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            activity_type: activityType,
                            entity_id: entityId,
                            metadata
                        }),
                    });
                } catch (error) {
                    console.error('Failed to track activity:', error);
                }
            }
        };

        trackActivity();
    }, [pathname, searchParams]);

    return null;
}

export default function UserTracker() {
    return (
        <Suspense fallback={null}>
            <UserTrackerInner />
        </Suspense>
    );
}
