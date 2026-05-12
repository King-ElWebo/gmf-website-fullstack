import "../../../admin-globals.css";

/**
 * Mietvertrag uses its own minimal layout (no AdminShell sidebar/header)
 * so that the browser print dialog shows only the document itself.
 */
export default function MietvertragLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
