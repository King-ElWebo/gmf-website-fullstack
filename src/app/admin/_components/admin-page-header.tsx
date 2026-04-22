import Link from "next/link";

export default function AdminPageHeader({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: {
        href: string;
        label: string;
    };
}) {
    return (
        <div className="admin-page-header">
            <div>
                <h1 className="admin-page-title">{title}</h1>
                {description ? <p className="admin-page-description">{description}</p> : null}
            </div>

            {action ? (
                <Link href={action.href} className="admin-action-primary w-full sm:w-auto">
                    <span className="text-base leading-none">+</span>
                    <span>{action.label}</span>
                </Link>
            ) : null}
        </div>
    );
}
