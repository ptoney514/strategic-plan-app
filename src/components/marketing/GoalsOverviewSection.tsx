import { Icon } from '@iconify/react';

const goals = [
  {
    title: 'Student Achievement & Growth',
    description:
      'Track academic priorities, outcomes, and instructional initiatives in one centralized system — aligned from district leadership to school sites.',
    icon: 'solar:square-academic-cap-linear',
  },
  {
    title: 'Community Engagement & Transparency',
    description:
      'Publish public-facing dashboards that keep families, boards, and community stakeholders informed and engaged.',
    icon: 'solar:users-group-rounded-linear',
  },
  {
    title: 'Operational Excellence',
    description:
      'Monitor staffing, programs, and operational initiatives with clear ownership, timelines, and accountability.',
    icon: 'solar:chart-2-linear',
  },
];

export function GoalsOverviewSection() {
  return (
    <section className="border-y bg-indigo-50/50 border-indigo-100 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="md:px-12 md:py-24 overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-900 rounded-[2.5rem] p-6 py-16 relative shadow-2xl">
          {/* Decorative background effects */}
          <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[100px] pointer-events-none" />

          {/* Section Header */}
          <div className="z-10 text-center max-w-4xl mx-auto mb-16 relative">
            <h2 className="md:text-5xl text-4xl font-medium text-white tracking-tight">
              From Static Plans To Living Strategy
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <div
                key={goal.title}
                className="group flex flex-col justify-between h-full bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-[1.01] hover:border-white/20 hover:shadow-xl hover:shadow-indigo-900/20"
              >
                <div className="flex justify-between items-start w-full mb-6">
                  <h3 className="leading-snug text-xl font-semibold text-white pr-4">
                    {goal.title}
                  </h3>
                  <div className="text-indigo-200 group-hover:text-white transition-colors duration-300 transform group-hover:rotate-12">
                    <Icon icon={goal.icon} width="28" />
                  </div>
                </div>
                <p className="text-indigo-100/70 text-sm leading-relaxed">{goal.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
