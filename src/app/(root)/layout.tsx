import type { CSSProperties, ReactNode } from "react";
import {
  Inter,
  JetBrains_Mono,
  Manrope,
  Space_Grotesk,
} from "next/font/google";

const headline = Manrope({
  subsets: ["latin"],
  variable: "--font-public-headline",
  weight: ["600", "700", "800"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-public-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

const label = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-public-label",
  weight: ["500", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-public-mono",
  weight: ["500", "700"],
  display: "swap",
});

const publicTheme = {
  "--color-background": "#faf9fe",
  "--color-foreground": "#1a1b1f",
  "--color-card": "#ffffff",
  "--color-card-foreground": "#1a1b1f",
  "--color-primary": "#1100ac",
  "--color-primary-foreground": "#ffffff",
  "--color-primary-container": "#2419df",
  "--color-on-primary-container": "#adafff",
  "--color-primary-fixed": "#e1e0ff",
  "--color-primary-fixed-dim": "#c0c1ff",
  "--color-secondary": "#4d41de",
  "--color-secondary-foreground": "#ffffff",
  "--color-secondary-container": "#665ef8",
  "--color-on-secondary-container": "#fffbff",
  "--color-secondary-fixed": "#e3dfff",
  "--color-secondary-fixed-dim": "#c3c0ff",
  "--color-tertiary": "#303135",
  "--color-tertiary-foreground": "#ffffff",
  "--color-tertiary-container": "#46474b",
  "--color-on-tertiary-container": "#b6b6ba",
  "--color-tertiary-fixed": "#e3e2e7",
  "--color-tertiary-fixed-dim": "#c6c6cb",
  "--color-on-tertiary-fixed": "#1a1b1f",
  "--color-on-tertiary-fixed-variant": "#46474b",
  "--color-error": "#ba1a1a",
  "--color-on-error": "#ffffff",
  "--color-error-container": "#ffdad6",
  "--color-on-error-container": "#93000a",
  "--color-surface": "#faf9fe",
  "--color-on-surface": "#1a1b1f",
  "--color-on-surface-variant": "#454556",
  "--color-surface-container-lowest": "#ffffff",
  "--color-surface-container-low": "#f4f3f8",
  "--color-surface-container": "#eeedf2",
  "--color-surface-container-high": "#e8e7ec",
  "--color-surface-container-highest": "#e3e2e7",
  "--color-outline": "#767588",
  "--color-outline-variant": "#c6c4d9",
  "--color-inverse-surface": "#2f3034",
  "--color-inverse-on-surface": "#f1f0f5",
  "--color-inverse-primary": "#c0c1ff",
  "--color-surface-tint": "#413ff4",
  "--color-muted": "#eeedf2",
  "--color-muted-foreground": "#767588",
  "--color-border": "#c6c4d9",
  "--color-input": "#c6c4d9",
  "--color-ring": "#1100ac",
} as CSSProperties & Record<string, string>;

export default function RootGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${headline.variable} ${body.variable} ${label.variable} ${mono.variable} min-h-screen bg-background text-foreground antialiased`}
      style={publicTheme}
    >
      {children}
    </div>
  );
}
