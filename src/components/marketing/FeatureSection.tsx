import type { ReactNode } from 'react';
import { Icon } from '@iconify/react';

interface Feature {
  title: string;
  description: string;
  icon?: string;
  highlighted?: boolean;
}

interface FeatureSectionProps {
  badge?: string;
  title: string;
  subtitle?: string;
  description: string;
  features: Feature[];
  visual: ReactNode;
  reversed?: boolean;
  className?: string;
  variant?: 'default' | 'alternate';
}

export function FeatureSection({
  badge,
  title,
  subtitle,
  description,
  features,
  visual,
  reversed = false,
  className = '',
  variant = 'default',
}: FeatureSectionProps) {
  const sectionBg = variant === 'alternate' ? 'bg-indigo-50/50 border-y border-indigo-100' : '';

  return (
    <section className={`py-24 overflow-hidden ${sectionBg} ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Optional badge and subtitle for centered header */}
        {(badge || subtitle) && (
          <div className="text-center mb-20 max-w-2xl mx-auto">
            {badge && (
              <div className="inline-flex gap-2 text-[11px] uppercase font-semibold text-indigo-600 tracking-widest bg-indigo-50 border-indigo-100 border rounded-full mb-6 py-1 px-3 items-center">
                {badge}
              </div>
            )}
            <h2 className="text-3xl md:text-4xl font-semibold text-indigo-900 tracking-tight mb-4">
              {title}
            </h2>
            {subtitle && <p className="text-indigo-500 text-lg">{subtitle}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className={`space-y-8 ${reversed ? 'order-2 lg:order-2' : 'order-2 lg:order-1'}`}>
            {!badge && !subtitle && (
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-indigo-900">{title}</h3>
                <p className="text-indigo-500 leading-relaxed">{description}</p>
              </div>
            )}

            {(badge || subtitle) && (
              <p className="text-indigo-500 leading-relaxed">{description}</p>
            )}

            <div className="space-y-6">
              {features.map((feature) => (
                <FeatureItem key={feature.title} {...feature} />
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className={reversed ? 'order-1 lg:order-1' : 'order-1 lg:order-2'}>{visual}</div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ title, description, icon, highlighted = false }: Feature) {
  if (icon) {
    // Icon style feature item
    return (
      <div className="flex gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
            highlighted
              ? 'bg-blue-50 border border-blue-100 text-blue-600'
              : 'bg-white border border-indigo-200 text-indigo-600'
          }`}
        >
          <Icon icon={icon} width="20" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-indigo-900">{title}</h4>
          <p className="text-sm text-indigo-500 mt-1">{description}</p>
        </div>
      </div>
    );
  }

  // Border style feature item
  return (
    <div
      className={`pl-4 space-y-1 ${
        highlighted
          ? 'border-l-2 border-blue-600'
          : 'border-l-2 border-indigo-200 hover:border-blue-300 transition-colors'
      }`}
    >
      <h4 className="text-base font-semibold text-indigo-900">{title}</h4>
      <p className="text-sm text-indigo-500">{description}</p>
    </div>
  );
}

// Pre-built visuals for the three feature sections
export function FeatureVisualHierarchy() {
  return (
    <div className="bg-indigo-50 rounded-2xl border border-indigo-200 p-8 aspect-square lg:aspect-video flex items-center justify-center relative shadow-sm">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="bg-white border border-indigo-200 shadow-sm px-4 py-3 rounded-lg flex items-center gap-3 w-full justify-center">
          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
            <Icon icon="solar:city-linear" width="18" />
          </div>
          <span className="font-medium text-sm">District Goals</span>
        </div>
        <div className="h-8 w-px bg-indigo-300" />
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-white border border-indigo-200 shadow-sm px-3 py-3 rounded-lg flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-50 text-green-500 flex items-center justify-center">
              <Icon icon="solar:book-linear" width="14" />
            </div>
            <span className="text-xs font-medium text-indigo-600">Academic</span>
          </div>
          <div className="bg-white border border-indigo-200 shadow-sm px-3 py-3 rounded-lg flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-cyan-50 text-cyan-500 flex items-center justify-center">
              <Icon icon="solar:bus-linear" width="14" />
            </div>
            <span className="text-xs font-medium text-indigo-600">Operations</span>
          </div>
        </div>
        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm text-xs text-indigo-500">
          Strategic Plan Builder
        </div>
      </div>
    </div>
  );
}

export function FeatureVisualProgress() {
  return (
    <div className="bg-white rounded-2xl border border-indigo-200 p-8 aspect-square lg:aspect-video flex items-center justify-center relative shadow-sm">
      <div className="w-full max-w-md space-y-4">
        {/* Progress Item */}
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-indigo-700">Literacy Initiative</span>
            <span className="text-xs font-medium text-blue-600">Behind Schedule</span>
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full w-[45%]" />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-5 h-5 rounded-full bg-indigo-300" />
            <span className="text-[10px] text-indigo-400">Assigned to J. Smith</span>
          </div>
        </div>
        {/* Progress Item 2 */}
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 opacity-60">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-indigo-700">STEM Expansion</span>
            <span className="text-xs font-medium text-cyan-600">On Track</span>
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-1.5">
            <div className="bg-cyan-500 h-1.5 rounded-full w-[75%]" />
          </div>
        </div>
      </div>
      <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm text-xs text-indigo-500">
        District Progress Tracking
      </div>
    </div>
  );
}

export function FeatureVisualChart() {
  return (
    <div className="bg-indigo-50 rounded-2xl border border-indigo-200 p-8 aspect-square lg:aspect-video flex items-center justify-center relative shadow-sm">
      <div className="w-full max-w-xs bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
        <div className="h-32 bg-indigo-50 p-4 relative overflow-hidden">
          {/* Fake chart bars */}
          <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-between px-4 gap-2">
            <div className="w-full bg-blue-200 h-[40%] rounded-t-sm" />
            <div className="w-full bg-blue-300 h-[60%] rounded-t-sm" />
            <div className="w-full bg-blue-400 h-[30%] rounded-t-sm" />
            <div className="w-full bg-blue-500 h-[80%] rounded-t-sm" />
            <div className="w-full bg-blue-600 h-[50%] rounded-t-sm" />
          </div>
        </div>
        <div className="p-4 flex justify-between items-center">
          <div className="space-y-1">
            <div className="h-2 w-16 bg-indigo-200 rounded" />
            <div className="h-2 w-10 bg-indigo-100 rounded" />
          </div>
          <div className="text-blue-600 font-bold text-lg">84%</div>
        </div>
      </div>
      <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm text-xs text-indigo-500">
        Board Progress Analytics
      </div>
    </div>
  );
}
