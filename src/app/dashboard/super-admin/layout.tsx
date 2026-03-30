// Transparent passthrough — parent dashboard/layout.tsx renders the super-admin shell.
// (SUPER_ADMIN role gets a full-page layout with no sidebar in the parent.)
export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
