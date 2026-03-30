// Transparent passthrough — the parent dashboard/layout.tsx renders CraftsmanLayout for TECHNICIAN role.
export default function UstaLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
