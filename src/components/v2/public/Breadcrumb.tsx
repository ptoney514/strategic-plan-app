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
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 overflow-x-auto pb-1 text-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item, index) => (
        <span
          key={index}
          data-breadcrumb-item
          data-hide-on-mobile={items.length > 2 && index < items.length - 2 ? 'true' : 'false'}
          className={`items-center gap-2 ${
            items.length > 2 && index < items.length - 2 ? 'hidden md:flex' : 'flex'
          }`}
        >
          {item.href ? (
            <Link
              href={item.href}
              className="max-w-[12rem] truncate text-[11px] font-medium uppercase tracking-[0.16em] text-md3-outline transition-colors hover:text-md3-primary sm:max-w-none sm:text-[12px]"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="max-w-[14rem] truncate text-[11px] font-medium uppercase tracking-[0.16em] text-md3-primary sm:max-w-none sm:text-[12px]"
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
