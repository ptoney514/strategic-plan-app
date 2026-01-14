import type { NumberFormat } from '../../lib/utils/formatMetricValue';
import { getNumberFormat, parseNumberFormat } from '../../lib/utils/formatMetricValue';

interface NumberFormatSelectorProps {
  isPercentage: boolean;
  decimalPlaces: number;
  onIsPercentageChange: (value: boolean) => void;
  onDecimalPlacesChange: (value: number) => void;
}

const FORMAT_OPTIONS: { value: NumberFormat; label: string; description: string }[] = [
  { value: 'whole', label: 'Whole Number', description: 'e.g., 785' },
  { value: 'decimal', label: 'Decimal', description: 'e.g., 785.0' },
  { value: 'percentage', label: 'Percentage', description: 'e.g., 785.0%' },
];

const DECIMAL_OPTIONS = [0, 1, 2, 3, 4];

/**
 * NumberFormatSelector - Controls how metric values are displayed
 *
 * Allows selecting between whole numbers, decimals, and percentages.
 * When decimal or percentage is selected, shows decimal places picker.
 */
export function NumberFormatSelector({
  isPercentage,
  decimalPlaces,
  onIsPercentageChange,
  onDecimalPlacesChange,
}: NumberFormatSelectorProps) {
  const currentFormat = getNumberFormat(isPercentage, decimalPlaces);

  const handleFormatChange = (format: NumberFormat) => {
    const { isPercentage: newIsPercentage, decimalPlaces: newDecimalPlaces } = parseNumberFormat(
      format,
      decimalPlaces
    );
    onIsPercentageChange(newIsPercentage);
    onDecimalPlacesChange(newDecimalPlaces);
  };

  const showDecimalPlaces = currentFormat === 'decimal' || currentFormat === 'percentage';

  return (
    <div className="mb-4 p-4 bg-white border border-[#e8e6e1] rounded-lg">
      <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-3">
        Number Format
      </h3>

      <div className="flex flex-wrap gap-4 items-end">
        {/* Format Type Dropdown */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[12px] text-[#6a6a6a] mb-1.5">
            Display Format
          </label>
          <select
            value={currentFormat}
            onChange={(e) => handleFormatChange(e.target.value as NumberFormat)}
            className="w-full px-3 py-2.5 text-[14px] text-[#1a1a1a] border border-[#e8e6e1] rounded-lg bg-white focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#d1fae5] transition-colors cursor-pointer"
          >
            {FORMAT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Decimal Places Dropdown - only shown for decimal/percentage */}
        {showDecimalPlaces && (
          <div className="w-[140px]">
            <label className="block text-[12px] text-[#6a6a6a] mb-1.5">
              Decimal Places
            </label>
            <select
              value={decimalPlaces}
              onChange={(e) => onDecimalPlacesChange(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2.5 text-[14px] text-[#1a1a1a] border border-[#e8e6e1] rounded-lg bg-white focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#d1fae5] transition-colors cursor-pointer"
            >
              {DECIMAL_OPTIONS.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Preview hint */}
      <p className="mt-2 text-[12px] text-[#8a8a8a]">
        Preview: {FORMAT_OPTIONS.find((o) => o.value === currentFormat)?.description}
        {showDecimalPlaces && decimalPlaces > 0 && currentFormat === 'decimal' && (
          <span> ({decimalPlaces} decimal{decimalPlaces !== 1 ? 's' : ''})</span>
        )}
      </p>
    </div>
  );
}
