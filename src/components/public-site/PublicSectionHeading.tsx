import type { ReactNode } from "react";

interface PublicSectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function PublicSectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: PublicSectionHeadingProps) {
  const isCentered = align === "center";

  return (
    <div
      className={`${isCentered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"} ${className}`}
    >
      {eyebrow ? <p className="public-kicker text-primary">{eyebrow}</p> : null}
      <h2 className="mt-4 font-headline text-4xl font-semibold tracking-[-0.04em] text-on-surface md:text-6xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-[65ch] text-base leading-8 text-on-surface-variant md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
