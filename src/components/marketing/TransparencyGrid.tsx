import { Icon } from '@iconify/react';

const cards = [
  {
    title: 'Public strategic plan portals',
    description:
      "Share your district's strategic vision with the community through dedicated, easy-to-navigate public portals.",
    icon: 'solar:global-linear',
    gradient: 'from-indigo-400 to-purple-500',
  },
  {
    title: 'Shareable progress dashboards',
    description:
      'Create board-ready and community-facing dashboards that can be shared instantly with any stakeholder group.',
    icon: 'solar:chart-2-linear',
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    title: 'Mobile-friendly community views',
    description:
      'Ensure families can access district progress updates from any device, anytime, anywhere.',
    icon: 'solar:smartphone-linear',
    gradient: 'from-cyan-400 to-blue-500',
  },
];

export function TransparencyGrid() {
  return (
    <section className="bg-white border-indigo-100 border-t pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex gap-2 text-[11px] uppercase font-semibold text-indigo-600 tracking-widest bg-indigo-50 border-indigo-100 border rounded-full mb-6 py-1 px-3 items-center">
            K-12 strategy software
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight mb-6">
            Built For Public Transparency
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed mb-10">
            Give families and taxpayers a clear, accessible view of district priorities, progress,
            and outcomes — without creating extra reporting work for staff.
          </p>
          <a
            href="#"
            className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium text-white transition-all bg-indigo-600 rounded-full hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
          >
            Explore Public Portals
            <Icon icon="solar:arrow-right-linear" className="ml-2" width="18" />
          </a>
        </div>

        {/* Features Grid - 3 columns on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-3xl bg-slate-900 h-[420px] shadow-lg transition-all duration-500 hover:shadow-2xl"
            >
              {/* Gradient Background Placeholder */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-60 transition-transform duration-700 group-hover:scale-105`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors duration-500" />

              <div className="flex flex-col h-full z-10 p-10 relative justify-end">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                  <Icon icon={card.icon} width="28" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-white tracking-tight">
                  {card.title}
                </h3>
                <p className="text-slate-300 text-base leading-relaxed max-w-md">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
