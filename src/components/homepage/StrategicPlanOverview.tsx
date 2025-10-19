import { motion } from 'framer-motion';
import { Calendar, Users, Target, TrendingUp } from 'lucide-react';

interface OverviewProps {
  primaryColor?: string;
  planYears?: string;
  numGoals?: number;
}

export function StrategicPlanOverview({
  primaryColor = '#C03537',
  planYears = '2021-2026',
  numGoals = 4
}: OverviewProps) {

  const overviewStats = [
    {
      icon: Calendar,
      title: planYears,
      subtitle: 'Strategic Plan Timeline',
      description: 'Five-year comprehensive roadmap'
    },
    {
      icon: Target,
      title: `${numGoals} Goals`,
      subtitle: 'Strategic Focus Areas',
      description: 'Student Achievement, Staff Support, Community Partnership, Infrastructure'
    },
    {
      icon: Users,
      title: 'Community-Driven',
      subtitle: 'Stakeholder Engagement',
      description: 'Input from families, staff, and community members'
    },
    {
      icon: TrendingUp,
      title: 'Measurable Impact',
      subtitle: 'Data-Driven Results',
      description: 'Clear metrics and accountability measures'
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] mb-4">
            Strategic Plan Overview
          </h2>
          <p className="text-xl text-[#808080] max-w-3xl mx-auto">
            A comprehensive five-year plan developed through extensive community engagement, focused on four key areas that will drive educational excellence and student success.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewStats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="h-full border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 bg-white p-6 text-center">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2C2C2C] mb-1">
                    {stat.title}
                  </h3>
                  <p className="font-semibold mb-2" style={{ color: primaryColor }}>
                    {stat.subtitle}
                  </p>
                  <p className="text-sm text-[#808080] leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-lg p-8 border border-gray-200 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-[#2C2C2C] mb-4">
              Community. Innovation. Excellence.
            </h3>
            <p className="text-[#808080] leading-relaxed">
              Our strategic plan represents the collective vision of our entire community. Through extensive engagement with students, families, staff, and community members, we have developed a roadmap that honors our past while boldly embracing the future of education. Every goal, strategy, and action item reflects our unwavering commitment to ensuring that every student in our district has the opportunity to reach their full potential.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
