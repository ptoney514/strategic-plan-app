import { Icon } from '@iconify/react';

interface HeroSectionProps {
  onDemoClick: () => void;
}

export function HeroSection({ onDemoClick }: HeroSectionProps) {
  return (
    <main className="pt-32 pb-20 relative">
      {/* Background Decoration - moved to absolute within main, not fixed */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 h-[50vh] w-[60vw] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="fade-in-up text-center max-w-4xl mx-auto px-6 mb-20 space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-100 bg-blue-50/80 text-blue-700 text-xs font-semibold tracking-wide uppercase shadow-sm">
          Built for K-12 Districts
        </div>

        {/* Headline */}
        <h1 className="text-indigo-900 text-5xl md:text-6xl font-bold leading-tight tracking-tight">
          Plan Better.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-500">
            Show Progress.
          </span>{' '}
          Build Trust.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-indigo-500 max-w-2xl mx-auto leading-relaxed">
          Move beyond static PDFs and spreadsheets. StrataDash helps districts plan smarter,
          track execution in real time, and publish public-facing progress
          dashboards — so boards, staff, and communities stay aligned.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onDemoClick}
            className="group relative flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-full shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
          >
            <span className="text-base font-medium">Schedule a District Demo</span>
            <Icon
              icon="solar:arrow-right-linear"
              width="20"
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </button>

          <button className="flex items-center justify-center gap-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 h-12 px-6 rounded-full font-medium text-base transition-all hover:border-indigo-300">
            <Icon icon="solar:play-circle-linear" width="20" />
            Watch Product Tour
          </button>
        </div>

        <p className="text-sm text-indigo-400 font-medium">
          Used by districts managing multi-year strategic plans
        </p>
      </div>

      {/* Product Video Showcase */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 fade-in-up fade-in-delay-1">
        <div className="shadow-indigo-200/50 md:p-4 bg-indigo-50/50 border-indigo-200 border rounded-xl p-2 relative shadow-2xl">
          <div className="rounded-lg overflow-hidden border border-indigo-200 bg-white relative shadow-sm group">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full aspect-video object-cover"
            >
              <source src="/showreel.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {/* Subtle inner border */}
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-lg pointer-events-none" />
          </div>
        </div>
      </div>
    </main>
  );
}
