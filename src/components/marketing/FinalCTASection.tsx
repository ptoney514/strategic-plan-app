import { Icon } from '@iconify/react';

interface FinalCTASectionProps {
  onDemoClick: () => void;
}

export function FinalCTASection({ onDemoClick }: FinalCTASectionProps) {
  return (
    <section className="relative overflow-hidden pt-24 pb-32 bg-[#0F0A29] text-white">
      {/* Base Layer: Radial + Linear Gradient Blend */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Radial Glow (Top Left) */}
        <div className="absolute -top-[400px] -left-[200px] w-[1000px] h-[1000px] bg-indigo-600/30 rounded-full blur-[120px] mix-blend-screen opacity-50" />
        {/* Secondary Radial Glow (Center Right) */}
        <div className="absolute top-1/4 -right-[200px] w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[100px] opacity-40" />
        {/* Linear Base Blend */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0F0A29]/80 to-[#0F0A29]" />
      </div>

      {/* Curved Wave Layer (Bottom Right Shape) */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-[70%] z-0 pointer-events-none flex items-end">
        <svg
          className="w-full h-full min-h-[500px]"
          viewBox="0 0 1440 600"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wave-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Wave Fill Area */}
          <path d="M0,400 C480,520 960,200 1440,250 V600 H0 Z" fill="url(#wave-fill)" />
          {/* Yellow Accent Stroke */}
          <path
            d="M0,400 C480,520 960,200 1440,250"
            stroke="#FBBF24"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left Text */}
        <div>
          <h2 className="text-4xl font-semibold tracking-tight mb-4 text-white">
            Modernize Your District's Strategic Planning
          </h2>
          <p className="text-indigo-200 text-lg mb-8 max-w-md">
            See how StrataDash helps districts move from static plans to continuous improvement —
            with less reporting effort and better visibility.
          </p>
          <div className="flex items-center gap-4 text-sm text-indigo-200">
            <span className="flex items-center gap-2">
              <Icon icon="solar:check-circle-linear" className="text-yellow-400" width="18" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <Icon icon="solar:check-circle-linear" className="text-yellow-400" width="18" />
              14-day free trial
            </span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="bg-linear-to-br from-indigo-600/90 to-purple-700/90 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl ring-1 ring-white/10">
          <div className="space-y-4">
            <div>
              <label className="sr-only">Work Email</label>
              <input
                type="email"
                placeholder="Your work email address"
                className="w-full px-4 py-3 bg-white border border-transparent rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 transition-all shadow-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full px-4 py-3 bg-white border border-transparent rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 transition-all shadow-xs"
              />
              <input
                type="text"
                placeholder="District Name"
                className="w-full px-4 py-3 bg-white border border-transparent rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 transition-all shadow-xs"
              />
            </div>
            <button
              type="button"
              onClick={onDemoClick}
              className="w-full bg-[#0F0A29] hover:bg-[#1a1245] text-white font-medium py-3 rounded-lg shadow-lg shadow-purple-900/20 transition-all transform active:scale-[0.98]"
            >
              Request District Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
