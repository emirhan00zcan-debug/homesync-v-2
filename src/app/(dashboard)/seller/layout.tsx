// Transparent passthrough — the parent dashboard/layout.tsx renders VendorSidebar for VENDOR role.
export default function SellerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
