import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {item.href ? (
              <Link
                to={item.href}
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--editorial-text-secondary)' }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--editorial-text-primary)' }}
                aria-current="page"
              >
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <ChevronRight
                className="h-4 w-4"
                style={{ color: 'var(--editorial-text-secondary)' }}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
