interface NarrativeHeroProps {
  planTitle?: string;
}

export function NarrativeHero({
  planTitle = 'Strategic Plan: 2021-2026',
}: NarrativeHeroProps) {
  return (
    <div className="mb-8">
      {/* Title */}
      <h1 className="font-display font-semibold text-3xl lg:text-4xl text-gray-900 tracking-tight">
        {planTitle}
      </h1>
    </div>
  );
}
