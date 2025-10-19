import React from 'react';
import { TrendingUp, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { type VisualizationType } from '../lib/metric-visualizations';
import { NarrativeDisplay } from './NarrativeDisplay';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface MetricPreviewProps {
  type: VisualizationType;
  data: any;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function MetricPreview({ type, data }: MetricPreviewProps) {
  const renderPreview = () => {
    switch (type) {
      case 'number':
        const decimals = data.decimals ?? 2;
        const formattedValue = typeof data.currentValue === 'number'
          ? data.currentValue.toFixed(decimals)
          : data.currentValue || '0';
        const valueWithUnit = data.unit
          ? `${formattedValue}${data.unit}`
          : formattedValue;
        const fullDisplay = data.label
          ? `${data.label} - ${valueWithUnit}`
          : valueWithUnit;

        return (
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">Number/KPI Display</h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{fullDisplay}</p>
                    {data.targetValue && (
                      <p className="text-sm text-muted-foreground">
                        Target: {data.targetValue.toFixed(decimals)}{data.unit || ''}
                      </p>
                    )}
                  </div>
                </div>
                {data.showTrend && data.targetValue && data.currentValue >= data.targetValue && (
                  <TrendingUp className="w-6 h-6 text-green-500" />
                )}
              </div>
            </div>
          </div>
        );

      case 'ratio':
        const fullRatioDisplay = data.label
          ? `${data.label}${data.ratioValue || '1.0:1'}`
          : data.ratioValue || '1.0:1';

        return (
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">Ratio Display</h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{fullRatioDisplay}</p>
                    {data.showTarget && data.targetValue && (
                      <p className="text-sm text-muted-foreground">
                        Target: {data.label}{data.targetValue}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'percentage':
        return (
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{data.label || 'Metric Name'}</h3>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {data.currentValue || 0}%
                </span>
                {data.suffix && (
                  <span className="text-lg text-muted-foreground">{data.suffix}</span>
                )}
                {data.showTrend && data.currentValue > 50 && (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                )}
              </div>

              {data.showProgressBar && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>Target: {data.targetValue || 100}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (data.currentValue / (data.targetValue || 100)) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'bar-chart':
        const barData = data.dataPoints || [];

        return (
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-medium mb-4">Bar Chart</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  {data.showLegend && <Legend />}
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'line-chart':
        const lineData = data.dataPoints || [];

        return (
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-medium mb-4">Line Chart</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {data.showArea ? (
                  <AreaChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="y"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type={data.smoothCurve ? "monotone" : "linear"}
                      dataKey="y"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={data.showDots !== false}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'donut-chart':
        const pieData = data.categories || [];
        const total = pieData.reduce((sum: number, item: any) => sum + item.value, 0);

        return (
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-medium mb-4">Donut Chart</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  {data.showLegend && <Legend />}
                </PieChart>
              </ResponsiveContainer>
            </div>

            {data.showPercentages && pieData.length > 0 && (
              <div className="mt-4 space-y-2">
                {pieData.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">
                      {((item.value / total) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'status':
        const statusConfig = {
          'completed': {
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: CheckCircle,
            text: 'Completed'
          },
          'on-target': {
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: CheckCircle,
            text: 'On Target'
          },
          'off-target': {
            color: 'bg-orange-100 text-orange-800 border-orange-200',
            icon: AlertCircle,
            text: 'Off Target'
          },
          'at-risk': {
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: XCircle,
            text: 'At Risk'
          },
          'pending': {
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            icon: Clock,
            text: 'Pending'
          }
        };

        const config = statusConfig[data.status as keyof typeof statusConfig] || statusConfig.pending;
        const StatusIcon = config.icon;

        return (
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-medium">{data.label || 'Status'}</h3>
                <span className={`px-2 py-1 rounded-md text-sm font-medium ${config.color}`}>
                  {config.text}
                </span>
              </div>

              {data.showIcon && (
                <div className="flex items-center gap-3">
                  <StatusIcon className="w-8 h-8" style={{
                    color: config.color.includes('green') ? '#22c55e' :
                      config.color.includes('orange') ? '#f97316' :
                        config.color.includes('red') ? '#ef4444' : '#6b7280'
                  }} />
                  <div>
                    <p className="text-2xl font-bold">{config.text}</p>
                    {data.description && (
                      <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
                    )}
                  </div>
                </div>
              )}

              {!data.showIcon && data.description && (
                <p className="text-muted-foreground">{data.description}</p>
              )}
            </div>
          </div>
        );

      case 'likert-scale':
        const likertData = data.dataPoints || [];
        const average = likertData.length > 0
          ? likertData.reduce((sum: number, point: any) => sum + point.value, 0) / likertData.length
          : 0;

        return (
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-medium mb-2">
              Likert Scale {data.scaleMin}-{data.scaleMax} {data.scaleLabel}
            </h3>
            {data.showAverage && likertData.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-3xl font-bold">{average.toFixed(2)}</p>
                {data.targetValue && (
                  <p className="text-sm text-muted-foreground">Target: {data.targetValue}</p>
                )}
              </div>
            )}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={likertData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis domain={[data.scaleMin || 1, data.scaleMax || 5]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  {data.showTarget && data.targetValue && (
                    <Line
                      type="monotone"
                      dataKey={() => data.targetValue}
                      stroke="#ef4444"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Target"
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'narrative':
        return (
          <div className="bg-white rounded-lg border border-border p-2">
            <NarrativeDisplay config={data} />
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="text-center py-8 text-muted-foreground">
              Preview for {type} coming soon...
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Preview</h3>
        <p className="text-sm text-muted-foreground">
          This is how your metric will appear
        </p>
      </div>

      <div className="bg-gradient-to-br from-muted/30 to-muted/50 p-6 rounded-lg">
        {renderPreview()}
      </div>
    </div>
  );
}
