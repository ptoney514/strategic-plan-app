import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { Widget, WidgetType, WidgetConfig, CreateWidgetPayload, UpdateWidgetPayload } from '../../../lib/types/v2';
import {
  DonutWidget,
  BigNumberWidget,
  BarChartWidget,
  AreaLineWidget,
  ProgressBarWidget,
  PieBreakdownWidget,
} from './renderers';

interface WidgetConfigPanelProps {
  type: WidgetType;
  initialData?: Widget;
  onSave: (data: CreateWidgetPayload | UpdateWidgetPayload) => void;
  onCancel: () => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-xs font-medium mb-1"
      style={{ color: 'var(--editorial-text-secondary)' }}
    >
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg px-3 py-2 text-sm outline-hidden"
      style={{
        backgroundColor: 'var(--editorial-bg, #f9fafb)',
        border: '1px solid var(--editorial-border)',
        color: 'var(--editorial-text-primary)',
      }}
    />
  );
}

function NumberInput({ value, onChange, placeholder }: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      placeholder={placeholder}
      className="w-full rounded-lg px-3 py-2 text-sm outline-hidden"
      style={{
        backgroundColor: 'var(--editorial-bg, #f9fafb)',
        border: '1px solid var(--editorial-border)',
        color: 'var(--editorial-text-primary)',
      }}
    />
  );
}

function SelectInput({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg px-3 py-2 text-sm outline-hidden"
      style={{
        backgroundColor: 'var(--editorial-bg, #f9fafb)',
        border: '1px solid var(--editorial-border)',
        color: 'var(--editorial-text-primary)',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function LivePreview({ type, config, title, subtitle }: {
  type: WidgetType;
  config: WidgetConfig;
  title: string;
  subtitle?: string;
}) {
  const props = { config, title, subtitle };
  switch (type) {
    case 'donut': return <DonutWidget {...props} />;
    case 'big-number': return <BigNumberWidget {...props} />;
    case 'bar-chart': return <BarChartWidget {...props} />;
    case 'area-line': return <AreaLineWidget {...props} />;
    case 'progress-bar': return <ProgressBarWidget {...props} />;
    case 'pie-breakdown': return <PieBreakdownWidget {...props} />;
    default: return null;
  }
}

export function WidgetConfigPanel({ type, initialData, onSave, onCancel }: WidgetConfigPanelProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle ?? '');
  const [config, setConfig] = useState<WidgetConfig>(initialData?.config ?? {});

  function updateConfig(patch: Partial<WidgetConfig>) {
    setConfig((prev) => ({ ...prev, ...patch }));
  }

  function handleSave() {
    if (initialData) {
      const payload: UpdateWidgetPayload = { title, subtitle, type, config };
      onSave(payload);
    } else {
      const payload: CreateWidgetPayload = { title, subtitle, type, config };
      onSave(payload);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Config form */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{
          backgroundColor: 'var(--editorial-surface)',
          border: '1px solid var(--editorial-border)',
        }}
      >
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--editorial-text-primary)' }}
        >
          {initialData ? 'Edit Widget' : 'Configure Widget'}
        </h3>

        <div>
          <FieldLabel>Title</FieldLabel>
          <TextInput value={title} onChange={setTitle} placeholder="Widget title" />
        </div>

        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <TextInput value={subtitle} onChange={setSubtitle} placeholder="Optional subtitle" />
        </div>

        {/* Type-specific fields */}
        <TypeSpecificFields type={type} config={config} onUpdate={updateConfig} />

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} size="sm" disabled={!title.trim()}>
            {initialData ? 'Save Changes' : 'Create Widget'}
          </Button>
          <Button onClick={onCancel} variant="ghost" size="sm">
            Cancel
          </Button>
        </div>
      </div>

      {/* Live preview */}
      <div
        className="rounded-xl p-5"
        style={{
          backgroundColor: 'var(--editorial-surface)',
          border: '1px solid var(--editorial-border)',
        }}
      >
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: 'var(--editorial-text-primary)' }}
        >
          Preview
        </h3>
        <LivePreview type={type} config={config} title={title} subtitle={subtitle} />
      </div>
    </div>
  );
}

function TypeSpecificFields({ type, config, onUpdate }: {
  type: WidgetType;
  config: WidgetConfig;
  onUpdate: (patch: Partial<WidgetConfig>) => void;
}) {
  switch (type) {
    case 'donut':
    case 'progress-bar':
      return (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Value</FieldLabel>
              <NumberInput value={config.value} onChange={(v) => onUpdate({ value: v })} placeholder="0" />
            </div>
            <div>
              <FieldLabel>Target</FieldLabel>
              <NumberInput value={config.target} onChange={(v) => onUpdate({ target: v })} placeholder="100" />
            </div>
          </div>
          <div>
            <FieldLabel>Label</FieldLabel>
            <TextInput value={config.label ?? ''} onChange={(v) => onUpdate({ label: v })} placeholder="of goal" />
          </div>
        </>
      );

    case 'big-number':
      return (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Value</FieldLabel>
              <NumberInput value={config.value} onChange={(v) => onUpdate({ value: v })} placeholder="0" />
            </div>
            <div>
              <FieldLabel>Unit</FieldLabel>
              <TextInput value={config.unit ?? ''} onChange={(v) => onUpdate({ unit: v })} placeholder="e.g. %" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Trend</FieldLabel>
              <TextInput value={config.trend ?? ''} onChange={(v) => onUpdate({ trend: v })} placeholder="+12%" />
            </div>
            <div>
              <FieldLabel>Direction</FieldLabel>
              <SelectInput
                value={config.trendDirection ?? 'flat'}
                onChange={(v) => onUpdate({ trendDirection: v as 'up' | 'down' | 'flat' })}
                options={[
                  { value: 'up', label: 'Up' },
                  { value: 'down', label: 'Down' },
                  { value: 'flat', label: 'Flat' },
                ]}
              />
            </div>
          </div>
        </>
      );

    case 'bar-chart':
      return <DataPointsEditor config={config} onUpdate={onUpdate} multiValue />;

    case 'area-line':
      return <DataPointsEditor config={config} onUpdate={onUpdate} />;

    case 'pie-breakdown':
      return <BreakdownEditor config={config} onUpdate={onUpdate} />;

    default:
      return null;
  }
}

function DataPointsEditor({ config, onUpdate, multiValue }: {
  config: WidgetConfig;
  onUpdate: (patch: Partial<WidgetConfig>) => void;
  multiValue?: boolean;
}) {
  const points = config.dataPoints ?? [];

  function addPoint() {
    const newPoint = multiValue
      ? { label: '', values: [0] }
      : { label: '', value: 0 };
    onUpdate({ dataPoints: [...points, newPoint] });
  }

  function removePoint(index: number) {
    onUpdate({ dataPoints: points.filter((_, i) => i !== index) });
  }

  function updatePoint(index: number, field: string, value: string | number) {
    const updated = points.map((p, i) => {
      if (i !== index) return p;
      if (field === 'label') return { ...p, label: value as string };
      if (field === 'value') return { ...p, value: Number(value) };
      return p;
    });
    onUpdate({ dataPoints: updated });
  }

  function updatePointValues(index: number, valuesStr: string) {
    const vals = valuesStr.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n));
    const updated = points.map((p, i) => (i === index ? { ...p, values: vals } : p));
    onUpdate({ dataPoints: updated });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FieldLabel>Data Points</FieldLabel>
        <button
          onClick={addPoint}
          className="text-xs flex items-center gap-1"
          style={{ color: 'var(--editorial-accent-primary, #6366f1)' }}
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
      {points.map((point, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={point.label}
            onChange={(e) => updatePoint(i, 'label', e.target.value)}
            placeholder="Label"
            className="flex-1 rounded-lg px-3 py-1.5 text-xs outline-hidden"
            style={{
              backgroundColor: 'var(--editorial-bg)',
              border: '1px solid var(--editorial-border)',
              color: 'var(--editorial-text-primary)',
            }}
          />
          {multiValue ? (
            <input
              type="text"
              value={point.values?.join(', ') ?? ''}
              onChange={(e) => updatePointValues(i, e.target.value)}
              placeholder="1, 2, 3"
              className="flex-1 rounded-lg px-3 py-1.5 text-xs outline-hidden"
              style={{
                backgroundColor: 'var(--editorial-bg)',
                border: '1px solid var(--editorial-border)',
                color: 'var(--editorial-text-primary)',
              }}
            />
          ) : (
            <input
              type="number"
              value={point.value ?? ''}
              onChange={(e) => updatePoint(i, 'value', e.target.value)}
              placeholder="0"
              className="w-20 rounded-lg px-3 py-1.5 text-xs outline-hidden"
              style={{
                backgroundColor: 'var(--editorial-bg)',
                border: '1px solid var(--editorial-border)',
                color: 'var(--editorial-text-primary)',
              }}
            />
          )}
          <button onClick={() => removePoint(i)} className="p-1 text-red-400 hover:text-red-600">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {multiValue && (
        <div>
          <FieldLabel>Legend Labels (comma-separated)</FieldLabel>
          <TextInput
            value={config.legend?.join(', ') ?? ''}
            onChange={(v) => onUpdate({ legend: v.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="Series A, Series B"
          />
        </div>
      )}
    </div>
  );
}

function BreakdownEditor({ config, onUpdate }: {
  config: WidgetConfig;
  onUpdate: (patch: Partial<WidgetConfig>) => void;
}) {
  const items = config.breakdownItems ?? [];

  function addItem() {
    onUpdate({ breakdownItems: [...items, { label: '', value: 0, color: '#6366f1' }] });
  }

  function removeItem(index: number) {
    onUpdate({ breakdownItems: items.filter((_, i) => i !== index) });
  }

  function updateItem(index: number, field: string, value: string | number) {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      return { ...item, [field]: field === 'value' ? Number(value) : value };
    });
    onUpdate({ breakdownItems: updated });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FieldLabel>Breakdown Items</FieldLabel>
        <button
          onClick={addItem}
          className="text-xs flex items-center gap-1"
          style={{ color: 'var(--editorial-accent-primary, #6366f1)' }}
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={item.label}
            onChange={(e) => updateItem(i, 'label', e.target.value)}
            placeholder="Label"
            className="flex-1 rounded-lg px-3 py-1.5 text-xs outline-hidden"
            style={{
              backgroundColor: 'var(--editorial-bg)',
              border: '1px solid var(--editorial-border)',
              color: 'var(--editorial-text-primary)',
            }}
          />
          <input
            type="number"
            value={item.value}
            onChange={(e) => updateItem(i, 'value', e.target.value)}
            placeholder="0"
            className="w-20 rounded-lg px-3 py-1.5 text-xs outline-hidden"
            style={{
              backgroundColor: 'var(--editorial-bg)',
              border: '1px solid var(--editorial-border)',
              color: 'var(--editorial-text-primary)',
            }}
          />
          <input
            type="color"
            value={item.color}
            onChange={(e) => updateItem(i, 'color', e.target.value)}
            className="w-8 h-8 rounded border-0 cursor-pointer"
          />
          <button onClick={() => removeItem(i)} className="p-1 text-red-400 hover:text-red-600">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
