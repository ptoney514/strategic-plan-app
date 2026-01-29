import { FileText, Target, BarChart3, ChevronRight } from 'lucide-react';

interface PreviewHeroProps {
  primaryColor: string;
  districtName: string;
  planYears?: string;
}

/**
 * PreviewHero - Simplified hero section preview for appearance settings
 * Shows the key visual elements without animations or functional links
 */
export function PreviewHero({
  primaryColor,
  districtName,
  planYears = '2021-2026',
}: PreviewHeroProps) {
  const quickLinks = [
    {
      icon: FileText,
      title: 'What is a Strategic Plan?',
      description: 'Learn about our planning process',
    },
    {
      icon: Target,
      title: `Goals for ${planYears}`,
      description: 'Explore our strategic focus areas',
    },
    {
      icon: BarChart3,
      title: 'Strategic Plan Dashboard',
      description: 'View progress and metrics',
      highlighted: true,
    },
  ];

  return (
    <section className="relative bg-gradient-to-br from-white to-gray-50 py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-6">
            {districtName}
            <span className="block" style={{ color: primaryColor }}>
              Strategic Plan {planYears}
            </span>
          </h1>
          <p className="text-xl text-[#808080] max-w-3xl mx-auto mb-10">
            Community. Innovation. Excellence. - Charting our course for educational
            excellence through strategic pillars that guide our commitment to student success
          </p>

          {/* Quick Links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-4xl mx-auto mb-10">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-4 bg-white rounded-lg flex-1 ${
                    link.highlighted
                      ? 'border-2 shadow-md'
                      : 'border border-gray-200'
                  }`}
                  style={link.highlighted ? { borderColor: primaryColor } : undefined}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <h4 className="font-semibold text-[#2C2C2C] text-sm mb-1 truncate">
                      {link.title}
                    </h4>
                    <p className="text-xs text-[#808080] leading-tight">
                      {link.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action Preview */}
        <div className="text-center">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">
              Explore Our Strategic Plan
            </h3>
            <p className="text-[#808080] text-sm leading-relaxed mb-4">
              Discover how our strategic goals work together to create an innovative
              educational experience that serves all learners in our community.
            </p>
            <span
              className="inline-flex items-center gap-2 px-5 py-2 border-2 rounded-lg font-medium text-sm"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Learn More <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
