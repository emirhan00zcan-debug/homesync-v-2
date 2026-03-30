// This route group is a transparent passthrough.
// The parent dashboard/layout.tsx renders the correct sidebar for every role
// (CUSTOMER → CustomerSidebar, VENDOR → VendorSidebar, TECHNICIAN → CraftsmanLayout, etc.)
// Adding another shell here caused the duplicate sidebar visible in the UI.

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
