import { useEffect, useRef } from 'react';
import type { Metric } from '../../lib/types';
import { StatusBadge, calculateStatus } from './StatusBadge';

interface MetricCardProps {
  metric: Metric;
  index: number;
}

// Color palette for charts based on index
const chartColors = ['#B91C1C', '#2563EB', '#059669', '#D97706'];

export function MetricCard({ metric, index }: MetricCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartColor = chartColors[index % chartColors.length];

  // Format the metric value
  const formatValue = () => {
    const value = metric.current_value ?? metric.actual_value ?? 0;

    if (metric.metric_type === 'percent' || metric.is_percentage) {
      return { value: value.toFixed(1), unit: '%' };
    }
    if (metric.metric_type === 'rating') {
      return { value: value.toFixed(2), unit: `/ ${metric.target_value || 5.0}` };
    }
    if (metric.metric_type === 'currency') {
      return { value: `$${value.toLocaleString()}`, unit: '' };
    }
    if (Number.isInteger(value)) {
      return { value: value.toString(), unit: metric.unit || '' };
    }
    return { value: value.toFixed(1), unit: metric.unit || '' };
  };

  // Calculate target comparison
  const getTargetComparison = () => {
    if (!metric.target_value) return null;

    const current = metric.current_value ?? metric.actual_value ?? 0;
    const target = metric.target_value;
    const diff = current - target;

    if (Math.abs(diff) < 0.01) {
      return 'At target';
    }

    if (metric.is_higher_better !== false) {
      // Higher is better
      if (diff > 0) {
        return `Above by ${Math.abs(diff).toFixed(2)}`;
      }
      return `Below by ${Math.abs(diff).toFixed(2)}`;
    } else {
      // Lower is better
      if (diff < 0) {
        return `Better by ${Math.abs(diff).toFixed(2)}`;
      }
      return `Above by ${Math.abs(diff).toFixed(2)}`;
    }
  };

  // Calculate status based on progress toward target
  const getStatus = () => {
    if (!metric.target_value) {
      return calculateStatus(null);
    }

    const current = metric.current_value ?? metric.actual_value ?? 0;
    const target = metric.target_value;
    const baseline = metric.baseline_value ?? 0;

    // Calculate progress percentage
    const range = target - baseline;
    if (range === 0) return calculateStatus(100);

    const progress = ((current - baseline) / range) * 100;
    return calculateStatus(progress);
  };

  const { value, unit } = formatValue();
  const status = getStatus();
  const targetComparison = getTargetComparison();

  // Simple bar chart using canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get display dimensions
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Chart data
    const current = metric.current_value ?? metric.actual_value ?? 0;
    const baseline = metric.baseline_value ?? current * 0.8;
    const target = metric.target_value ?? current * 1.2;

    const data = [
      { label: 'Baseline', value: baseline },
      { label: 'Current', value: current },
      { label: 'Target', value: target },
    ];

    // Calculate chart dimensions
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Calculate scales
    const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
    const minValue = Math.min(...data.map(d => d.value)) * 0.9;
    const barWidth = chartWidth / data.length * 0.6;
    const barGap = chartWidth / data.length;

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw grid lines
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();
    }

    // Draw bars
    data.forEach((d, i) => {
      const barHeight = ((d.value - minValue) / (maxValue - minValue)) * chartHeight;
      const x = padding.left + barGap * i + (barGap - barWidth) / 2;
      const y = padding.top + chartHeight - barHeight;

      // Bar color (target is gray)
      ctx.fillStyle = i === 2 ? '#E5E7EB' : chartColor;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 4);
      ctx.fill();

      // Label
      ctx.fillStyle = '#6B7280';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x + barWidth / 2, rect.height - 8);
    });

    // Draw y-axis labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridLines; i++) {
      const value = maxValue - ((maxValue - minValue) / gridLines) * i;
      const y = padding.top + (chartHeight / gridLines) * i + 4;
      ctx.fillText(value.toFixed(1), padding.left - 8, y);
    }
  }, [metric, chartColor]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-all duration-300">
      {/* Header: Label + Status badge */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
          {metric.metric_category || 'Metric'}
        </span>
        <StatusBadge status={status} size="sm" />
      </div>

      {/* Title */}
      <h3 className="text-gray-900 font-semibold text-lg tracking-tight mb-2">
        {metric.metric_name || metric.name}
      </h3>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tighter font-display">
          {value}
        </span>
        {unit && (
          <span className="text-xl lg:text-2xl text-gray-400 font-medium font-display">
            {unit}
          </span>
        )}
      </div>

      {/* Target line */}
      {metric.target_value && (
        <div className="text-sm font-medium text-gray-500 mt-3">
          Target:{' '}
          <span className="text-gray-900">
            {metric.target_value}
            {metric.metric_type === 'percent' || metric.is_percentage ? '%' : ''}
          </span>
          {targetComparison && (
            <>
              <span className="text-gray-300 mx-1">•</span>
              {targetComparison}
            </>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="relative w-full h-44 mt-6">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
