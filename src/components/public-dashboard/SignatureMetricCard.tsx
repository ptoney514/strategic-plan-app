'use client';

import { StatusChip, type StatusValue } from './StatusChip';

export interface SparklinePoint {
  year: string;
  value: number;
}

export interface SignatureMetricCardProps {
  eyebrow?: string;
  title: string;
  status: StatusValue;
  statusLabel?: string;
  displayValue: string;
  displayUnit?: string;
  supportingLine: string;
  accentColor: string;
  target: number;
  targetLabel: string;
  series: SparklinePoint[];
}

const SVG_WIDTH = 300;
const SVG_HEIGHT = 110;
const Y_TOP = 18;
const Y_BOTTOM = 90;
const X_LEFT = 10;
const X_RIGHT = 290;

function mapPoints(series: SparklinePoint[], target: number) {
  const values = series.map((p) => p.value);
  const minValue = Math.min(...values, target);
  const maxValue = Math.max(...values, target);
  const range = maxValue - minValue || 1;
  const step = series.length > 1 ? (X_RIGHT - X_LEFT) / (series.length - 1) : 0;

  return series.map((point, index) => {
    const x = X_LEFT + step * index;
    const y = Y_BOTTOM - ((point.value - minValue) / range) * (Y_BOTTOM - Y_TOP);
    return { ...point, x, y };
  });
}

export function SignatureMetricCard({
  eyebrow = 'Signature metric',
  title,
  status,
  statusLabel,
  displayValue,
  displayUnit,
  supportingLine,
  accentColor,
  targetLabel,
  target,
  series,
}: SignatureMetricCardProps) {
  const points = mapPoints(series, target);
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  const lastPoint = points[points.length - 1];
  const areaPath =
    points.length > 0
      ? `${linePath} L ${lastPoint.x} ${Y_BOTTOM + 10} L ${points[0].x} ${Y_BOTTOM + 10} Z`
      : '';
  const gradientId = `sigGrad-${title.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <div className="sig-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: 'var(--ink-3)' }}
          >
            {eyebrow}
          </div>
          <h3
            className="mt-1 text-2xl md:text-3xl"
            style={{ color: 'var(--ink)', fontFamily: 'Geist, sans-serif', fontWeight: 500 }}
          >
            {title}
          </h3>
        </div>
        <StatusChip status={status} label={statusLabel} />
      </div>

      <div className="mt-6 grid grid-cols-5 items-end gap-5">
        <div className="col-span-2">
          <div className="sig-number" style={{ color: accentColor }}>
            {displayValue}
            {displayUnit ? (
              <span
                className="ml-0.5 text-[32px]"
                style={{ color: 'var(--ink-3)' }}
              >
                {displayUnit}
              </span>
            ) : null}
          </div>
          <div className="mt-3 text-[12px]" style={{ color: 'var(--ink-3)' }}>
            {supportingLine}
          </div>
        </div>

        <div className="col-span-3">
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            width="100%"
            height={SVG_HEIGHT}
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            role="img"
            aria-label={`${title} trend through ${lastPoint?.year ?? ''}`}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity="0.28" />
                <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            <line
              x1="0"
              y1={Y_TOP}
              x2={SVG_WIDTH}
              y2={Y_TOP}
              stroke={accentColor}
              strokeDasharray="4,4"
              strokeWidth="1"
              opacity="0.45"
            />
            <text
              x={SVG_WIDTH - 4}
              y={Y_TOP - 5}
              textAnchor="end"
              fontSize="9"
              fontWeight="600"
              fill={accentColor}
            >
              {targetLabel}
            </text>

            {areaPath ? <path d={areaPath} fill={`url(#${gradientId})`} /> : null}
            {linePath ? (
              <path
                d={linePath}
                fill="none"
                stroke={accentColor}
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}

            {lastPoint ? (
              <>
                <circle cx={lastPoint.x} cy={lastPoint.y} r="4.5" fill={accentColor} />
                <circle cx={lastPoint.x} cy={lastPoint.y} r="1.75" fill="#ffffff" />
              </>
            ) : null}

            {points.map((p, i) => {
              const isLast = i === points.length - 1;
              return (
                <text
                  key={`${p.year}-${i}`}
                  x={p.x}
                  y={SVG_HEIGHT - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight={isLast ? 700 : 400}
                  fill={isLast ? 'var(--ink)' : 'var(--ink-3)'}
                >
                  {p.year}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
