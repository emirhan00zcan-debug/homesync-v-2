// Transparent passthrough — parent dashboard/layout.tsx renders AdminSidebar for ADMIN role.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
