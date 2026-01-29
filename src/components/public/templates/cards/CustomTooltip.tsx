/**
 * CustomTooltip - Shared tooltip component for Recharts visualizations
 * Features:
 * - Polished white card with shadow
 * - Bold label header
 * - Colored dots matching series colors
 * - Consistent styling across all chart types
 */

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-sm">
        <p className="font-bold text-gray-800 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-gray-600">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>
              {entry.name}:{' '}
              <span className="font-semibold">
                {typeof entry.value === 'number'
                  ? entry.value.toLocaleString()
                  : entry.value}
              </span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
