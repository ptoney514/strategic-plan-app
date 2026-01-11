import { ThemeToggle } from './ThemeToggle';

interface NarrativeHeroProps {
  planTitle?: string;
  planYears?: string;
  subtitle?: string;
}

export function NarrativeHero({
  planTitle = 'Strategic Plan',
  planYears = '2021–2026',
  subtitle = 'Monitoring our progress across key performance indicators and strategic initiatives.',
}: NarrativeHeroProps) {
  return (
    <div className="mb-12">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-display font-semibold text-3xl lg:text-4xl text-slate-900 dark:text-slate-100 tracking-tight mb-3">
            {planTitle} <span className="text-slate-400 dark:text-slate-500 font-normal">{planYears}</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
            {subtitle}
          </p>
        </div>
        <ThemeToggle variant="default" />
      </div>
    </div>
  );
}
