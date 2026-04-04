"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { ProductCanvas, type ProductCanvasMode } from "./ProductCanvas";

interface PublicAuthShellProps {
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  visualMode?: ProductCanvasMode;
  visualEyebrow: string;
  visualTitle: string;
  visualDescription: string;
  visualPoints: string[];
}

export function PublicAuthShell({
  header,
  children,
  footer,
  visualMode = "auth",
  visualEyebrow,
  visualTitle,
  visualDescription,
  visualPoints,
}: PublicAuthShellProps) {
  return (
    <div className="grid min-h-[100dvh] bg-background lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
      <section className="relative flex items-center px-6 py-10 md:px-10 lg:px-14">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(15,93,134,0.08),transparent_38%),linear-gradient(to_bottom,rgba(255,255,255,0.75),rgba(255,255,255,0))]" />
        <div className="mx-auto w-full max-w-[430px]">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm font-semibold tracking-[-0.03em] text-on-surface transition-colors hover:text-primary"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-outline-variant bg-white text-lg font-headline font-semibold">
              S
            </span>
            StrataDash
          </Link>

          <div className="public-shadow mt-10 rounded-[32px] border border-white/80 bg-white/92 p-8 backdrop-blur-sm md:p-10">
            {header}
            <div className="mt-8">{children}</div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5 text-[11px] font-label uppercase tracking-[0.24em] text-on-surface-variant">
            {footer}
          </div>
        </div>
      </section>

      <section className="relative hidden overflow-hidden border-l border-outline-variant/70 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:42px_42px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,93,134,0.15),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(15,93,134,0.12),transparent_28%)]" />

        <div className="relative z-10 grid w-full gap-10 px-12 py-14 xl:grid-cols-[0.78fr_1.22fr] xl:items-center xl:px-16">
          <div className="max-w-md">
            <p className="public-kicker text-primary">{visualEyebrow}</p>
            <h2 className="mt-4 font-headline text-5xl font-semibold tracking-[-0.05em] text-on-surface">
              {visualTitle}
            </h2>
            <p className="mt-6 text-lg leading-8 text-on-surface-variant">
              {visualDescription}
            </p>
            <div className="mt-8 space-y-3">
              {visualPoints.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-white/70 px-4 py-4"
                >
                  <ArrowUpRight
                    size={16}
                    className="mt-1 text-primary"
                    weight="bold"
                  />
                  <span className="text-sm leading-6 text-on-surface">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <ProductCanvas mode={visualMode} />
        </div>
      </section>
    </div>
  );
}
