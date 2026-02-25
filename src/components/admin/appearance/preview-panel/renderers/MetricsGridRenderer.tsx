import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PreviewHeader } from '../../../preview/PreviewHeader';
import type { PreviewRendererProps } from './index';

const SAMPLE_METRICS = [
  { label: 'Graduation Rate', value: '94.2%', trend: 'up' as const, delta: '+2.1%' },
  { label: 'Attendance', value: '96.8%', trend: 'up' as const, delta: '+0.4%' },
  { label: 'Reading Proficiency', value: '78.5%', trend: 'down' as const, delta: '-1.2%' },
  { label: 'Math Proficiency', value: '71.3%', trend: 'up' as const, delta: '+3.6%' },
  { label: 'Parent Satisfaction', value: '4.2/5', trend: 'stable' as const, delta: '0.0' },
  { label: 'Teacher Retention', value: '89.1%', trend: 'up' as const, delta: '+1.8%' },
];

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp className="w-3 h-3 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-500" />;
  return <Minus className="w-3 h-3 text-slate-400" />;
};

export function MetricsGridRenderer({
  primaryColor,
  secondaryColor,
  logoUrl,
  districtName,
  tagline,
  config,
}: PreviewRendererProps) {
  const cols = config.gridColumns ?? 3;
  const variant = config.cardVariant ?? 'compact';

  return (
    <div className="min-h-full">
      <PreviewHeader
        primaryColor={primaryColor}
        districtName={districtName}
        tagline={tagline}
        logoUrl={logoUrl}
      />

      {config.showNarrativeHero && (
        <div className="py-8 text-center" style={{ backgroundColor: `${primaryColor}08` }}>
          <h2 className="text-2xl font-bold text-slate-900">Key Performance Indicators</h2>
          <p className="text-slate-500 mt-1">Real-time district metrics at a glance</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {SAMPLE_METRICS.map((metric) => (
            <div
              key={metric.label}
              className={`rounded-xl ${
                variant === 'rich'
                  ? 'shadow-md border-0'
                  : variant === 'compact'
                    ? 'border'
                    : 'border shadow-sm'
              }`}
              style={{
                backgroundColor: 'white',
                borderColor: variant !== 'rich' ? '#e5e7eb' : undefined,
              }}
            >
              <div className={variant === 'compact' ? 'p-3' : 'p-5'}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {metric.label}
                  </span>
                  <TrendIcon trend={metric.trend} />
                </div>
                <div className="flex items-end gap-2">
                  <span
                    className={`font-bold ${variant === 'compact' ? 'text-xl' : 'text-2xl'}`}
                    style={{ color: primaryColor }}
                  >
                    {metric.value}
                  </span>
                  <span
                    className={`text-xs font-medium mb-0.5 ${
                      metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-slate-400'
                    }`}
                  >
                    {metric.delta}
                  </span>
                </div>
                {variant === 'rich' && (
                  <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: '70%', backgroundColor: secondaryColor }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
