import { motion } from 'framer-motion';
import type { PreviewRendererProps } from './index';

const COUNTER_ITEMS = [
  { label: 'Students Served', value: '12,847' },
  { label: 'Schools', value: '24' },
  { label: 'Goals On Track', value: '87%' },
  { label: 'Community Events', value: '156' },
];

const CARD_ITEMS = [
  { title: 'Student Achievement', progress: 82 },
  { title: 'Community Partnerships', progress: 64 },
  { title: 'Staff Development', progress: 91 },
  { title: 'Operational Excellence', progress: 73 },
];

export function LaunchTractionRenderer({
  primaryColor,
  secondaryColor,
  districtName,
  config,
}: PreviewRendererProps) {
  const animate = config.enableAnimations;
  const cols = config.gridColumns ?? 4;

  return (
    <div className="min-h-full bg-slate-900 text-white">
      {/* Header bar */}
      <div className="px-8 py-4 flex items-center justify-between border-b border-slate-700">
        <div>
          <h1 className="text-xl font-bold">{districtName}</h1>
          <p className="text-slate-400 text-sm">Strategic Plan Dashboard</p>
        </div>
        <div
          className="px-3 py-1.5 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: primaryColor }}
        >
          2025-2026
        </div>
      </div>

      {/* Counter row */}
      <div className="px-8 py-8">
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {COUNTER_ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={animate ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-4 rounded-xl bg-slate-800 border border-slate-700"
            >
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: i === 0 ? primaryColor : i === 1 ? secondaryColor : 'white' }}
              >
                {item.value}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress cards */}
      <div className="px-8 pb-8">
        <h2 className="text-lg font-semibold mb-4">Strategic Pillars</h2>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${Math.min(cols, CARD_ITEMS.length)}, 1fr)` }}
        >
          {CARD_ITEMS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={animate ? { opacity: 0, scale: 0.95 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="p-4 rounded-xl bg-slate-800 border border-slate-700"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-200">{card.title}</span>
                <span className="text-sm font-bold" style={{ color: primaryColor }}>
                  {card.progress}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: primaryColor }}
                  initial={animate ? { width: 0 } : { width: `${card.progress}%` }}
                  animate={{ width: `${card.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mock bar chart area */}
      <div className="px-8 pb-8">
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
          <h3 className="text-sm font-semibold mb-4 text-slate-300">Year-over-Year Progress</h3>
          <div className="flex items-end gap-3 h-24">
            {[45, 58, 62, 71, 82, 87].map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t"
                style={{ backgroundColor: i === 5 ? primaryColor : `${primaryColor}60` }}
                initial={animate ? { height: 0 } : { height: `${h}%` }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.08 }}
              />
            ))}
          </div>
          <div className="flex gap-3 mt-2">
            {['2020', '2021', '2022', '2023', '2024', '2025'].map((yr) => (
              <span key={yr} className="flex-1 text-center text-[10px] text-slate-500">
                {yr}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
