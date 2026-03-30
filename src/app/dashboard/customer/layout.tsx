// Transparent passthrough — parent dashboard/layout.tsx handles the sidebar/shell.
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
