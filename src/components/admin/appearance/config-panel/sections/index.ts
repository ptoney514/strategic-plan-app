import type { ComponentType } from 'react';
import { Palette, ImageIcon, LayoutTemplate, SlidersHorizontal, Grid3X3, CreditCard } from 'lucide-react';
import { BrandColorsSection } from './BrandColorsSection';
import { LogoSection } from './LogoSection';
import { TemplateSelectorSection } from './TemplateSelectorSection';
import { LayoutOptionsSection } from './LayoutOptionsSection';
import { GridDensitySection } from './GridDensitySection';
import { CardStyleSection } from './CardStyleSection';

export interface ConfigSectionEntry {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  order: number;
  component: ComponentType;
  defaultOpen?: boolean;
}

export const CONFIG_SECTIONS: ConfigSectionEntry[] = [
  { id: 'colors', title: 'Brand Colors', icon: Palette, order: 0, component: BrandColorsSection, defaultOpen: true },
  { id: 'logo', title: 'Logo', icon: ImageIcon, order: 1, component: LogoSection, defaultOpen: true },
  { id: 'template', title: 'Dashboard Template', icon: LayoutTemplate, order: 2, component: TemplateSelectorSection, defaultOpen: true },
  { id: 'layout', title: 'Layout Options', icon: SlidersHorizontal, order: 3, component: LayoutOptionsSection, defaultOpen: false },
  { id: 'grid', title: 'Grid Density', icon: Grid3X3, order: 4, component: GridDensitySection, defaultOpen: false },
  { id: 'cards', title: 'Card Style', icon: CreditCard, order: 5, component: CardStyleSection, defaultOpen: false },
];
