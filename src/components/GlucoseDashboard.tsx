import React, { useState } from 'react';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Percent,
  Plus,
  Info,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { GlucoseReading, UserProfile } from '../types/diabetic';
import { calculateClinicalMetrics } from '../lib/storage';

interface Props {
  readings: GlucoseReading[];
  profile: UserProfile;
  onOpenLogGlucose: () => void;
}

export const GlucoseDashboard: React.FC<Props> = ({
  readings,
  profile,
  onOpenLogGlucose,
}) => {
  const [dayFilter, setDayFilter] = useState<7 | 14 | 30 | 90>(14);
  const [hoveredPoint, setHoveredPoint] = useState<GlucoseReading | null>(null);

  // Filter readings within day range
  const now = new Date();
  const filterCutoff = new Date(now.getTime() - dayFilter * 24 * 3600 * 1000);
  const filteredReadings = readings
    .filter((r) => new Date(r.timestamp) >= filterCutoff)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const metrics = calculateClinicalMetrics(
    filteredReadings,
    profile.targetRangeLow,
    profile.targetRangeHigh
  );

  // SVG Chart Dimensions
  const chartHeight = 220;
  const chartWidth = 760;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const minVal = 40;
  const maxVal = 300;

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    const ratio = (clamped - minVal) / (maxVal - minVal);
    return chartHeight - padding.bottom - ratio * (chartHeight - padding.top - padding.bottom);
  };

  const getX = (idx: number, total: number) => {
    if (total <= 1) return padding.left + (chartWidth - padding.left - padding.right) / 2;
    return padding.left + (idx / (total - 1)) * (chartWidth - padding.left - padding.right);
  };

  // Generate SVG path points
  const points = filteredReadings.map((r, idx) => ({
    x: getX(idx, filteredReadings.length),
    y: getY(r.value),
    reading: r,
  }));

  const linePath = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

  // Target band coordinates
  const targetBandTop = getY(profile.targetRangeHigh);
  const targetBandBottom = getY(profile.targetRangeLow);
  const targetBandHeight = targetBandBottom - targetBandTop;

  // Breakdown by meal context
  const mealContexts: { label: string; contexts: string[] }[] = [
    { label: 'Fasting / Waking', contexts: ['fasting'] },
    { label: 'Post-Breakfast', contexts: ['after_breakfast', 'before_breakfast'] },
    { label: 'Post-Lunch', contexts: ['after_lunch', 'before_lunch'] },
    { label: 'Post-Dinner', contexts: ['after_dinner', 'before_dinner'] },
    { label: 'Bedtime / Night', contexts: ['bedtime', 'night'] },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Glucose Tracking Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Continuous clinical glucose analytics, Time in Range (TIR), and estimated A1C
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Day range filter */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-semibold">
            {[7, 14, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setDayFilter(days as any)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  dayFilter === days
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {days}D
              </button>
            ))}
          </div>

          <button
            onClick={onOpenLogGlucose}
            className="px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Log Reading
          </button>
        </div>
      </div>

      {/* Primary Clinical KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Avg BG */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Average Glucose
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {metrics.avgBg || '--'}
            </span>
            <span className="text-xs font-semibold text-slate-500">{profile.glucoseUnit}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Goal: &lt; 154 mg/dL
          </p>
        </div>

        {/* Estimated A1C */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Estimated A1C
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
              ADA eAG
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
              {metrics.estimatedA1c ? `${metrics.estimatedA1c}%` : '--'}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Target: &lt; 7.0% (ADA standard)
          </p>
        </div>

        {/* Time in Range % */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Time in Range (TIR)
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {metrics.tirPercentage}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {profile.targetRangeLow}-{profile.targetRangeHigh} mg/dL (Goal: &gt; 70%)
          </p>
        </div>

        {/* Hypo Events */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Hypo Incidents (&lt;70)
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span
              className={`text-2xl sm:text-3xl font-black ${
                metrics.lowCount + metrics.veryLowCount > 0
                  ? 'text-rose-600'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {metrics.lowCount + metrics.veryLowCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">events</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Very Low (&lt;54): {metrics.veryLowCount}
          </p>
        </div>

        {/* Glucose Variability */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Variability (CV)
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {metrics.cvPercentage}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            SD: ±{metrics.standardDeviation} mg/dL (Goal: ≤ 36%)
          </p>
        </div>
      </div>

      {/* Time in Range Stacked Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Clinical Time in Range Distribution
          </h3>
          <span className="text-xs text-slate-500">{metrics.count} total checks ({dayFilter} days)</span>
        </div>

        {/* Multi-segment bar */}
        <div className="w-full h-5 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
          {metrics.veryLowPct > 0 && (
            <div
              style={{ width: `${metrics.veryLowPct}%` }}
              className="bg-rose-700 h-full"
              title={`Very Low (<54): ${metrics.veryLowPct}%`}
            />
          )}
          {metrics.lowPct > 0 && (
            <div
              style={{ width: `${metrics.lowPct}%` }}
              className="bg-rose-400 h-full"
              title={`Low (54-69): ${metrics.lowPct}%`}
            />
          )}
          {metrics.inRangePct > 0 && (
            <div
              style={{ width: `${metrics.inRangePct}%` }}
              className="bg-emerald-500 h-full"
              title={`Target (70-180): ${metrics.inRangePct}%`}
            />
          )}
          {metrics.highPct > 0 && (
            <div
              style={{ width: `${metrics.highPct}%` }}
              className="bg-amber-400 h-full"
              title={`High (181-250): ${metrics.highPct}%`}
            />
          )}
          {metrics.veryHighPct > 0 && (
            <div
              style={{ width: `${metrics.veryHighPct}%` }}
              className="bg-amber-700 h-full"
              title={`Very High (>250): ${metrics.veryHighPct}%`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-700 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400">Very Low (&lt;54): <strong>{metrics.veryLowPct}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-400 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400">Low (54-69): <strong>{metrics.lowPct}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400">In Range: <strong>{metrics.inRangePct}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400">High (181-250): <strong>{metrics.highPct}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-700 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400">Very High (&gt;250): <strong>{metrics.veryHighPct}%</strong></span>
          </div>
        </div>
      </div>

      {/* Interactive Trend Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Glucose Trend & Target Corridor
            </h3>
            <p className="text-xs text-slate-500">
              Shaded green band shows recommended target zone ({profile.targetRangeLow} - {profile.targetRangeHigh} mg/dL)
            </p>
          </div>

          {hoveredPoint && (
            <div className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
              <span className="font-bold text-blue-600 dark:text-blue-400">{hoveredPoint.value} {profile.glucoseUnit}</span>
              {' '}• {hoveredPoint.context} • {new Date(hoveredPoint.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>

        {/* SVG Canvas */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[550px] overflow-visible"
          >
            {/* Shaded Target Corridor */}
            <rect
              x={padding.left}
              y={targetBandTop}
              width={chartWidth - padding.left - padding.right}
              height={targetBandHeight}
              fill="rgba(16, 185, 129, 0.09)"
              stroke="rgba(16, 185, 129, 0.25)"
              strokeDasharray="4 4"
            />

            {/* Horizontal Gridlines & Y-Labels */}
            {[70, 130, 180, 250].map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    className="dark:stroke-slate-800"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="10"
                    className="fill-slate-400 font-mono"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Connecting Trend Line */}
            {points.length > 1 && (
              <path
                d={linePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
            )}

            {/* Scatter Dots */}
            {points.map((pt, i) => {
              const val = pt.reading.value;
              let dotColor = '#10b981'; // In range
              if (val < profile.targetRangeLow) dotColor = '#f43f5e'; // Low
              else if (val > profile.targetRangeHigh) dotColor = '#f59e0b'; // High

              const isHovered = hoveredPoint?.id === pt.reading.id;

              return (
                <g key={pt.reading.id || i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    fill={dotColor}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="cursor-pointer transition-all hover:scale-125"
                    onMouseEnter={() => setHoveredPoint(pt.reading)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Breakdown by Meal Timing */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
          Mealtime Glycemic Averages ({dayFilter}-Day Analysis)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {mealContexts.map((group) => {
            const matches = filteredReadings.filter((r) => group.contexts.includes(r.context));
            const avg =
              matches.length > 0
                ? Math.round(matches.reduce((s, m) => s + m.value, 0) / matches.length)
                : null;

            return (
              <div
                key={group.label}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center"
              >
                <span className="text-[11px] font-semibold text-slate-500 block truncate">
                  {group.label}
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
                  {avg ? `${avg} ${profile.glucoseUnit}` : 'No data'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {matches.length} readings
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
