"use client";

import React from 'react';
import OnboardingTour from '@/components/OnboardingTour';

// Passthrough layout — CraftsmanLayout is applied by the parent
// dashboard/layout.tsx based on the TECHNICIAN role.
export default function TechnicianRouteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <OnboardingTour role="technician" />
        </>
    );
}
