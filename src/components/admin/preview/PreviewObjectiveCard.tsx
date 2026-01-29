import { TrendingUp, Target } from 'lucide-react';

interface PreviewObjectiveCardProps {
  primaryColor: string;
  secondaryColor: string;
}

/**
 * PreviewObjectiveCard - Sample objective cards for dashboard preview
 * Shows how goals/objectives will appear with the selected colors
 */
export function PreviewObjectiveCard({
  primaryColor,
  secondaryColor,
}: PreviewObjectiveCardProps) {
  const sampleObjectives = [
    {
      title: 'Student Achievement',
      description: 'Improve student outcomes through data-driven instruction',
      progress: 72,
      status: 'on-track',
      indicatorColor: '#22c55e',
    },
    {
      title: 'Community Partnerships',
      description: 'Strengthen relationships with families and stakeholders',
      progress: 58,
      status: 'in-progress',
      indicatorColor: secondaryColor,
    },
    {
      title: 'Staff Development',
      description: 'Support professional growth and engagement',
      progress: 85,
      status: 'ahead',
      indicatorColor: primaryColor,
    },
  ];

  return (
    <section className="bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#2C2C2C]">Strategic Objectives</h2>
          <span
            className="text-sm font-medium px-3 py-1 rounded-full"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            3 Active Goals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleObjectives.map((objective, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              {/* Color indicator bar */}
              <div
                className="h-1.5"
                style={{ backgroundColor: objective.indicatorColor }}
              />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${primaryColor}10` }}
                  >
                    <Target className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${objective.indicatorColor}15`,
                      color: objective.indicatorColor,
                    }}
                  >
                    {objective.status.replace('-', ' ')}
                  </span>
                </div>
                <h3 className="font-semibold text-[#2C2C2C] mb-2">{objective.title}</h3>
                <p className="text-sm text-[#808080] mb-4">{objective.description}</p>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#808080]">Progress</span>
                    <span className="font-medium" style={{ color: primaryColor }}>
                      {objective.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${objective.progress}%`,
                        backgroundColor: objective.indicatorColor,
                      }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-[#808080]">4 sub-goals</span>
                  <div className="flex items-center gap-1 text-xs" style={{ color: primaryColor }}>
                    <TrendingUp className="w-3 h-3" />
                    <span>+5% this month</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
