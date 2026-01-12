import { Plus, Trash2 } from 'lucide-react';

export interface DataPoint {
  label: string;
  value: string;
  target?: string;
}

interface DataPointsEditorProps {
  dataPoints: DataPoint[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: 'label' | 'value' | 'target', value: string) => void;
  error?: string;
}

/**
 * DataPointsEditor - Year-over-year data points table editor
 *
 * Allows adding, editing, and removing data points for metric charts.
 * Each data point has a label (year/period), actual value, and optional target value.
 */
export function DataPointsEditor({
  dataPoints,
  onAdd,
  onRemove,
  onUpdate,
  error,
}: DataPointsEditorProps) {
  return (
    <div className="mb-4 pb-4 border-b border-[#e8e6e1]">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-[13px] font-semibold text-[#1a1a1a]">
          Year-over-Year Data
        </label>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#10b981] bg-[#d1fae5] border border-[#10b981] rounded-lg hover:bg-[#a7f3d0] transition-colors"
          type="button"
        >
          <Plus className="h-3 w-3" />
          Add Data Point
        </button>
      </div>

      {dataPoints.length === 0 ? (
        <div className="text-center py-6 bg-white border border-[#e8e6e1] rounded-lg">
          <p className="text-[13px] text-[#8a8a8a]">
            No data points yet. Add year-over-year values to visualize trends.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e8e6e1] rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1.5fr_1.5fr_1.5fr_auto] gap-2 px-3 py-2 bg-gray-50 border-b border-[#e8e6e1]">
            <div className="text-[11px] font-semibold text-[#6a6a6a]">Year/Period</div>
            <div className="text-[11px] font-semibold text-[#6a6a6a]">Actual Value</div>
            <div className="text-[11px] font-semibold text-[#6a6a6a]">Target Value</div>
            <div className="text-[11px] font-semibold text-[#6a6a6a] text-right">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#e8e6e1]">
            {dataPoints.map((dp, index) => (
              <div key={index} className="grid grid-cols-[1.5fr_1.5fr_1.5fr_auto] gap-2 px-3 py-2 items-center">
                <input
                  type="text"
                  value={dp.label}
                  onChange={(e) => onUpdate(index, 'label', e.target.value)}
                  placeholder="2024"
                  className="px-2 py-1.5 text-[13px] text-[#1a1a1a] border border-[#e8e6e1] rounded bg-white focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#d1fae5] transition-colors"
                />
                <input
                  type="number"
                  step="0.01"
                  value={dp.value}
                  onChange={(e) => onUpdate(index, 'value', e.target.value)}
                  placeholder="3.75"
                  className="px-2 py-1.5 text-[13px] text-[#1a1a1a] border border-[#e8e6e1] rounded bg-white focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#d1fae5] transition-colors"
                />
                <input
                  type="number"
                  step="0.01"
                  value={dp.target || ''}
                  onChange={(e) => onUpdate(index, 'target', e.target.value)}
                  placeholder="3.50"
                  className="px-2 py-1.5 text-[13px] text-[#1a1a1a] border border-[#e8e6e1] rounded bg-white focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#d1fae5] transition-colors"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => onRemove(index)}
                    className="p-1.5 text-[#6a6a6a] hover:text-[#ef4444] hover:bg-[#fee2e2] rounded transition-colors"
                    type="button"
                    title="Remove data point"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-[12px] text-[#ef4444]">{error}</p>
      )}
    </div>
  );
}
