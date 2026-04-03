import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {item.href ? (
            <Link
              href={item.href}
              className="text-[12px] font-medium uppercase tracking-wider text-md3-outline hover:text-md3-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="text-[12px] font-medium uppercase tracking-wider text-md3-primary"
              aria-current="page"
            >
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <span className="material-symbols-outlined text-sm text-md3-outline">
              chevron_right
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
