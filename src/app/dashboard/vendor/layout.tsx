// Transparent passthrough — parent dashboard/layout.tsx renders VendorSidebar for VENDOR role.
export default function VendorRouteLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
