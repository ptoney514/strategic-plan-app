import type { ReactNode } from "react";

export interface PublicDocumentTocItem {
  label: string;
  href: string;
}

interface PublicDocumentShellProps {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  updatedAt: string;
  toc: PublicDocumentTocItem[];
  heroAside?: ReactNode;
  children: ReactNode;
}

export function PublicDocumentShell({
  eyebrow,
  title,
  description,
  updatedAt,
  toc,
  heroAside,
  children,
}: PublicDocumentShellProps) {
  return (
    <>
      <header className="mx-auto max-w-[1400px] px-6 pb-16 pt-20 md:px-10 lg:pb-20 lg:pt-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)] lg:items-end">
          <div className="max-w-4xl">
            <p className="public-kicker text-primary">{eyebrow}</p>
            <h1 className="mt-4 font-headline text-5xl font-semibold tracking-[-0.05em] text-on-surface md:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-[65ch] text-lg leading-8 text-on-surface-variant">
              {description}
            </p>
            <div className="mt-8 inline-flex items-center rounded-full border border-outline-variant bg-white/80 px-4 py-2 text-[11px] font-label uppercase tracking-[0.24em] text-on-surface-variant">
              Last updated {updatedAt}
            </div>
          </div>

          {heroAside ? (
            <div className="public-panel rounded-[28px] p-6 lg:ml-auto lg:max-w-sm">
              {heroAside}
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-12 px-6 pb-28 md:px-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-18">
        <aside className="hidden lg:block">
          <nav className="sticky top-28 rounded-[28px] border border-outline-variant/80 bg-white/80 p-5 backdrop-blur-sm">
            <p className="public-kicker text-primary/70">On this page</p>
            <div className="mt-5 space-y-1">
              {toc.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block rounded-2xl px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        </aside>

        <article className="space-y-16">{children}</article>
      </main>
    </>
  );
}
