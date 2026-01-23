import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

interface BarData {
  year: string;
  value: number;
}

const chartData: BarData[] = [
  { year: '22-23', value: 3.75 },
  { year: '23-24', value: 3.74 },
  { year: '24-25', value: 3.79 },
  { year: '25-26', value: 3.83 },
];

const targetValue = 3.5;
const minValue = 3.0;
const maxValue = 4.0;
const BAR_AREA_HEIGHT = 100; // pixels

const bottomCards = [
  {
    id: '1.3',
    title: 'Average Score of Teachers on the Instructional Model Self-Assessment Rubric',
    type: 'RATING',
    value: '3.67',
    target: '3.59',
    status: 'on-target',
  },
  {
    id: '1.4',
    title: 'Student learning is personalized with intervention and enrichment opportunities',
    type: 'OTHER',
    value: '100',
    target: null,
    status: 'at-target',
  },
  {
    id: '1.5',
    title: 'Curriculum is regularly reviewed and updated',
    type: 'TEXT',
    value: null,
    target: null,
    status: 'read-more',
  },
];

export function ProductDemo() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  // Calculate bar height in pixels
  const getBarHeight = (value: number) => {
    return Math.round(((value - minValue) / (maxValue - minValue)) * BAR_AREA_HEIGHT);
  };

  // Target line position as percentage
  const targetLinePosition = ((targetValue - minValue) / (maxValue - minValue)) * 100;

  return (
    <div
      ref={containerRef}
      className="aspect-video rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      }}
    >
      <div className="h-full p-4 md:p-6 flex flex-col">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-slate-500 mb-3">
          <span>Strategic Plan</span>
          <span>/</span>
          <span className="text-slate-700 font-medium">1 Student Achievement & Well-being</span>
        </div>

        {/* Title Section */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-500 text-white flex items-center justify-center text-sm md:text-lg font-bold flex-shrink-0 shadow-md">
            1
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base md:text-xl font-bold text-slate-800">
                Student Achievement & Well-being
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] md:text-xs font-medium whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                On Target
              </span>
            </div>
            <p className="text-[10px] md:text-sm text-slate-500 mt-1 leading-relaxed">
              Ensure all students achieve academic success through high-quality instruction, personalized learning, social-emotional support, and career readiness preparation.
            </p>
          </div>
        </div>

        {/* Goals Overview Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm md:text-base font-semibold text-slate-800">Goals Overview</span>
          <span className="text-[10px] md:text-xs text-slate-500">8 goals total</span>
        </div>

        {/* Main Cards Row */}
        <div className="flex gap-3 mb-3 flex-1 min-h-0">
          {/* Featured Goal Card (1.1) */}
          <div
            className="flex-1 bg-white rounded-xl p-3 md:p-4 flex flex-col min-w-0"
            style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)' }}
          >
            <div className="flex items-start gap-2 mb-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-red-500 text-white flex items-center justify-center text-[10px] md:text-xs font-bold flex-shrink-0">
                1.1
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs md:text-sm font-semibold text-slate-800 leading-tight">
                  Grow and nurture a district culture that values, demonstrates, and promotes a sense of belonging
                </div>
                <p className="text-[9px] md:text-xs text-slate-500 mt-1 hidden md:block">
                  Foster an inclusive environment where all students, staff, families, and community members feel valued and connected.
                </p>
              </div>
              <Icon icon="solar:maximize-square-linear" className="w-4 h-4 text-slate-400 flex-shrink-0 hidden md:block" />
            </div>

            <div className="flex flex-1 min-h-0 gap-3 mt-2">
              {/* Left side - Status and Value */}
              <div className="flex flex-col justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] md:text-[10px] font-medium w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  On Target
                </span>
                <div className="mt-auto">
                  <div className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-wide">Other</div>
                  <div className="text-xl md:text-3xl font-bold text-slate-800">
                    3.83 <span className="text-sm md:text-base font-normal text-slate-400">rating</span>
                  </div>
                  <div className="text-[9px] md:text-xs text-slate-500">Target: 3.50 rating</div>
                </div>
              </div>

              {/* Right side - Bar Chart */}
              <div className="flex-1 flex items-end justify-center min-w-0">
                <div className="w-full max-w-[180px] relative" style={{ height: BAR_AREA_HEIGHT + 24 }}>
                  {/* Target line label */}
                  <div
                    className="absolute right-0 text-[8px] md:text-[9px] text-emerald-600 font-medium"
                    style={{ bottom: `${(targetLinePosition / 100) * BAR_AREA_HEIGHT + 18}px` }}
                  >
                    Target: 3.50
                  </div>

                  {/* Target line */}
                  <div
                    className="absolute left-0 right-12 border-t-2 border-dashed border-emerald-500 z-10"
                    style={{ bottom: `${(targetLinePosition / 100) * BAR_AREA_HEIGHT + 16}px` }}
                  />

                  {/* Bars Container */}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-around gap-2">
                    {chartData.map((bar, index) => (
                      <div key={bar.year} className="flex flex-col items-center flex-1">
                        {/* Value label */}
                        <span
                          className={`text-[8px] md:text-[10px] font-semibold text-slate-600 mb-1 transition-opacity duration-500 ${
                            isVisible ? 'opacity-100' : 'opacity-0'
                          }`}
                          style={{ transitionDelay: `${index * 150 + 500}ms` }}
                        >
                          {bar.value}
                        </span>
                        {/* Bar */}
                        <div
                          className="w-full max-w-8 bg-red-500 rounded-t origin-bottom"
                          style={{
                            height: `${getBarHeight(bar.value)}px`,
                            transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
                            transition: `transform 800ms ease-out ${index * 150}ms`,
                          }}
                        />
                        {/* X-axis label */}
                        <span className="text-[7px] md:text-[9px] text-slate-500 mt-1">{bar.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Card (1.2) */}
          <div
            className="w-32 md:w-44 bg-white rounded-xl p-3 md:p-4 flex flex-col"
            style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)' }}
          >
            <div className="flex items-start gap-2 mb-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-red-500 text-white flex items-center justify-center text-[10px] md:text-xs font-bold flex-shrink-0">
                1.2
              </div>
              <div className="text-[9px] md:text-xs font-semibold text-slate-800 leading-tight">
                NDE Academic Classification
              </div>
            </div>
            <p className="text-[8px] md:text-[10px] text-slate-500 mb-2 hidden md:block">
              Academic classification score (Excellent=100, Great=90, Good=80)
            </p>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-wide">Other</div>
              <div className="text-2xl md:text-4xl font-bold text-slate-800">
                100 <span className="text-xs md:text-sm font-normal text-slate-400">score</span>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" />
              <span className="text-[9px] md:text-xs text-emerald-600 font-medium">At Target</span>
            </div>
          </div>
        </div>

        {/* Bottom Cards Row */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {bottomCards.map((card, index) => (
            <div
              key={card.id}
              className={`bg-white rounded-xl p-2 md:p-3 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
                transitionDelay: `${600 + index * 100}ms`,
              }}
            >
              <div className="flex items-start gap-2 mb-2">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-red-500 text-white flex items-center justify-center text-[9px] md:text-[10px] font-bold flex-shrink-0">
                  {card.id}
                </div>
                <div className="text-[8px] md:text-[10px] font-medium text-slate-700 leading-tight line-clamp-2">
                  {card.title}
                </div>
              </div>

              <div className="text-[7px] md:text-[9px] text-slate-400 uppercase tracking-wide">{card.type}</div>

              {card.value ? (
                <div className="text-lg md:text-2xl font-bold text-slate-800">
                  {card.value}
                  {card.target && (
                    <span className="text-xs md:text-sm font-normal text-slate-400"> / {card.target}</span>
                  )}
                </div>
              ) : (
                <div className="text-sm md:text-base font-medium text-red-500 flex items-center gap-1 mt-1">
                  Read more
                  <Icon icon="solar:arrow-right-linear" className="w-3 h-3 md:w-4 md:h-4" />
                </div>
              )}

              {card.status !== 'read-more' && (
                <div className="flex items-center gap-1 mt-1">
                  {card.status === 'on-target' ? (
                    <>
                      <Icon icon="solar:graph-up-linear" className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-500" />
                      <span className="text-[8px] md:text-[10px] text-emerald-600 font-medium">On Target</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:check-circle-bold" className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-500" />
                      <span className="text-[8px] md:text-[10px] text-emerald-600 font-medium">At Target</span>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
