type IndicatorColor = 'green' | 'amber' | 'red' | 'gray';

interface StatusIndicatorEditorProps {
  text: string;
  color: IndicatorColor;
  onTextChange: (text: string) => void;
  onColorChange: (color: IndicatorColor) => void;
  textError?: string;
  maxLength?: number;
}

const COLOR_OPTIONS: IndicatorColor[] = ['green', 'amber', 'red', 'gray'];

/**
 * StatusIndicatorEditor - Badge text and color editor
 *
 * Allows editing optional status indicator (badge) that appears on metric cards.
 * Includes text input with character counter and color radio buttons.
 */
export function StatusIndicatorEditor({
  text,
  color,
  onTextChange,
  onColorChange,
  textError,
  maxLength = 50,
}: StatusIndicatorEditorProps) {
  return (
    <div className="mb-4 p-4 bg-white border border-[#e8e6e1] rounded-lg">
      <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-3">
        Status Indicator
      </h3>

      {/* Badge Text */}
      <div className="mb-3">
        <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-2">
          Badge Text <span className="text-[#6a6a6a] font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => onTextChange(e.target.value.slice(0, maxLength))}
          placeholder="e.g., On Target, Needs Improvement, Exceeding Goals"
          className={`w-full px-4 py-3 text-[14px] text-[#1a1a1a] border rounded-lg bg-white focus:outline-none focus:ring-2 transition-colors ${
            textError
              ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#fee2e2]'
              : 'border-[#e8e6e1] focus:border-[#10b981] focus:ring-[#d1fae5]'
          }`}
        />
        {textError && (
          <p className="mt-1 text-[12px] text-[#ef4444]">{textError}</p>
        )}
        <div className="text-right text-[12px] text-[#8a8a8a] mt-1">
          {text.length} / {maxLength} characters
        </div>
      </div>

      {/* Badge Color */}
      <div>
        <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-2">
          Badge Color <span className="text-[#6a6a6a] font-normal">(optional)</span>
        </label>
        <div className="flex gap-3">
          {COLOR_OPTIONS.map((colorOption) => (
            <label
              key={colorOption}
              className="flex items-center cursor-pointer"
            >
              <input
                type="radio"
                name="indicatorColor"
                value={colorOption}
                checked={color === colorOption}
                onChange={(e) => onColorChange(e.target.value as IndicatorColor)}
                className="mr-2"
              />
              <span className="text-[13px] text-[#1a1a1a] capitalize">{colorOption}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
