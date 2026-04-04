import type { CSSProperties, ReactNode } from "react";
import {
  JetBrains_Mono,
  Manrope,
  Outfit,
  Space_Grotesk,
} from "next/font/google";

const headline = Outfit({
  subsets: ["latin"],
  variable: "--font-public-headline",
  weight: ["600", "700", "800"],
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-public-body",
  weight: ["400", "500", "600", "700"],
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
  "--color-background": "#f4f7f4",
  "--color-foreground": "#0f1722",
  "--color-card": "#ffffff",
  "--color-card-foreground": "#0f1722",
  "--color-primary": "#0f5d86",
  "--color-primary-foreground": "#ffffff",
  "--color-primary-container": "#dcecf4",
  "--color-on-primary-container": "#15445c",
  "--color-primary-fixed": "#e7f2f7",
  "--color-primary-fixed-dim": "#b8d8e7",
  "--color-secondary": "#5d7283",
  "--color-secondary-foreground": "#ffffff",
  "--color-secondary-container": "#e5edf2",
  "--color-on-secondary-container": "#334958",
  "--color-secondary-fixed": "#eef3f6",
  "--color-secondary-fixed-dim": "#d6e2e9",
  "--color-tertiary": "#688699",
  "--color-tertiary-foreground": "#ffffff",
  "--color-tertiary-container": "#e2ecf2",
  "--color-on-tertiary-container": "#2f4a58",
  "--color-tertiary-fixed": "#eef5f8",
  "--color-tertiary-fixed-dim": "#d9e8ef",
  "--color-on-tertiary-fixed": "#102734",
  "--color-on-tertiary-fixed-variant": "#3f5a68",
  "--color-error": "#b41340",
  "--color-on-error": "#ffffff",
  "--color-error-container": "#ffdad6",
  "--color-on-error-container": "#93000a",
  "--color-surface": "#fcfdfb",
  "--color-on-surface": "#0f1722",
  "--color-on-surface-variant": "#5c6877",
  "--color-surface-container-lowest": "#ffffff",
  "--color-surface-container-low": "#f0f4f2",
  "--color-surface-container": "#e8efeb",
  "--color-surface-container-high": "#dfe8e4",
  "--color-surface-container-highest": "#d4dfdb",
  "--color-outline": "#93a1af",
  "--color-outline-variant": "#d5dde3",
  "--color-inverse-surface": "#16202b",
  "--color-inverse-on-surface": "#eef4f7",
  "--color-inverse-primary": "#a7d0e3",
  "--color-surface-tint": "#0f5d86",
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
