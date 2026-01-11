import { Building2, Target, Users, GraduationCap } from 'lucide-react';

interface StatsCardsGridProps {
  totalDistricts: number;
  totalGoals: number;
  totalUsers: number;
  totalSchools: number;
  isLoading?: boolean;
}

const statsConfig = [
  {
    key: 'districts',
    label: 'Total Districts',
    icon: Building2,
    bgColor: 'bg-[#f5f3ef]',
    iconColor: 'text-[#b85c38]',
    getValue: (props: StatsCardsGridProps) => props.totalDistricts,
  },
  {
    key: 'goals',
    label: 'Total Goals',
    icon: Target,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    getValue: (props: StatsCardsGridProps) => props.totalGoals,
  },
  {
    key: 'users',
    label: 'Total Users',
    icon: Users,
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    getValue: (props: StatsCardsGridProps) => props.totalUsers,
  },
  {
    key: 'schools',
    label: 'Total Schools',
    icon: GraduationCap,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    getValue: (props: StatsCardsGridProps) => props.totalSchools,
  },
];

export function StatsCardsGrid(props: StatsCardsGridProps) {
  const { isLoading } = props;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {statsConfig.map((stat) => (
        <div
          key={stat.key}
          data-testid="stats-card"
          className="bg-white border border-[#e8e6e1] rounded-xl p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#8a8a8a] uppercase tracking-wide mb-2">
                {stat.label}
              </p>
              {isLoading ? (
                <div className="h-9 w-16 bg-[#f5f3ef] rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-['Playfair_Display',_Georgia,_serif] font-medium text-[#1a1a1a]">
                  {stat.getValue(props)}
                </p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
