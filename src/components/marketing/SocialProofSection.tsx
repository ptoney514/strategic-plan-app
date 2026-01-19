import { Icon } from '@iconify/react';

const districts = [
  { name: 'Summit Schools', icon: 'solar:umbrella-linear' },
  { name: 'North Star District', icon: 'solar:stars-linear' },
  { name: 'Valley Education', icon: 'solar:book-bookmark-linear' },
  { name: 'Future Prep', icon: 'solar:atom-linear' },
  { name: 'City Unified', icon: 'solar:buildings-linear' },
];

export function SocialProofSection() {
  return (
    <section className="py-16 bg-white border-t border-indigo-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold text-indigo-400 tracking-widest uppercase mb-10">
          Trusted by School Districts
        </p>
        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {districts.map((district) => (
            <div key={district.name} className="flex items-center gap-2 font-bold text-indigo-600">
              <Icon icon={district.icon} width="20" />
              {district.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
