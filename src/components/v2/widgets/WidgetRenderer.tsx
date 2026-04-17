import type { Widget } from '../../../lib/types/v2';
import {
  DonutWidget,
  BigNumberWidget,
  BarChartWidget,
  AreaLineWidget,
  ProgressBarWidget,
  PieBreakdownWidget,
} from './renderers';

interface WidgetRendererProps {
  widget: Widget;
}

/**
 * Dispatches a Widget to the correct renderer based on `widget.type`.
 *
 * Extracted from `WidgetCard` so public views (e.g. `GoalDetailView`) can
 * render a widget in their own chrome without inheriting the admin card's
 * edit/delete hover actions and type badge.
 */
export function WidgetRenderer({ widget }: WidgetRendererProps) {
  const props = { config: widget.config, title: widget.title, subtitle: widget.subtitle };

  switch (widget.type) {
    case 'donut':
      return <DonutWidget {...props} />;
    case 'big-number':
      return <BigNumberWidget {...props} />;
    case 'bar-chart':
      return <BarChartWidget {...props} />;
    case 'area-line':
      return <AreaLineWidget {...props} />;
    case 'progress-bar':
      return <ProgressBarWidget {...props} />;
    case 'pie-breakdown':
      return <PieBreakdownWidget {...props} />;
    default:
      return <div className="text-sm text-gray-400">Unknown widget type</div>;
  }
}
