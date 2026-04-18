"use client";

import type { ReactNode } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";

export const authLabelClass =
  "block font-label text-[11px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant";

export const authInputClass =
  "mt-2 block w-full rounded-[22px] border border-outline-variant/80 bg-white px-4 py-3.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-primary/35 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:opacity-70";

export function AuthNotice({
  tone,
  title,
  children,
}: {
  tone: "error" | "success";
  title: string;
  children: ReactNode;
}) {
  const isError = tone === "error";

  return (
    <div
      className={`rounded-[24px] border px-4 py-4 ${
        isError
          ? "border-error/18 bg-error-container/56 text-error"
          : "border-primary/14 bg-primary/6 text-primary"
      }`}
    >
      <div className="flex items-start gap-3">
        {isError ? (
          <WarningCircle size={18} className="mt-0.5 shrink-0" weight="fill" />
        ) : (
          <CheckCircle size={18} className="mt-0.5 shrink-0" weight="fill" />
        )}
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <div className="mt-1 text-sm leading-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
