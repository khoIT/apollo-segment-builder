/**
 * "Simple" analysis model cards — Events, Distribution, Interval.
 * Each card owns its own config state and renders an inline config bar
 * at the top of the expanded area before the chart/results.
 */
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  EVENTS_DAU_DATA, EVENTS_METRICS,
  DISTRIBUTION_BUCKETS, INTERVAL_METRICS,
} from '../../data/analysis-mock-data';
import type { EventsConfig, DistributionConfig, IntervalConfig } from './analysis-config-types';
import {
  DEFAULT_EVENTS_CONFIG, DEFAULT_DISTRIBUTION_CONFIG, DEFAULT_INTERVAL_CONFIG,
} from './analysis-config-types';
import {
  EventsConfigPanel, DistributionConfigPanel, IntervalConfigPanel,
} from './analysis-inline-config-panels';

export interface ModelCardProps {
  onUseAsSegment: (label: string) => void;
}

/* ── Events card ────────────────────────────────────────────────────── */

export function EventsCard({ onUseAsSegment }: ModelCardProps) {
  const [config, setConfig]   = useState<EventsConfig>(DEFAULT_EVENTS_CONFIG);
  const [groupBy, setGroupBy] = useState<'all' | 'platform'>('all');
  const maxVal = Math.max(...EVENTS_DAU_DATA.map((d) => d.ios + d.android));

  return (
    <div className="space-y-3">
      <EventsConfigPanel config={config} onChange={setConfig} onRun={() => {}} />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Events',  value: EVENTS_METRICS.totalEvents.toLocaleString() },
          { label: 'Unique Users',  value: EVENTS_METRICS.uniqueUsers.toLocaleString() },
          { label: 'Sum Revenue',   value: `${(EVENTS_METRICS.sumRevenue / 1e6).toFixed(1)}M` },
        ].map((m) => (
          <div key={m.label} className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-slate-900">{m.value}</div>
            <div className="text-[11px] text-slate-500">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">DAU (7 days)</span>
        <div className="flex gap-1">
          {(['all', 'platform'] as const).map((v) => (
            <button key={v} onClick={() => setGroupBy(v)}
              className={`px-2 py-0.5 text-[10px] font-medium rounded cursor-pointer ${
                groupBy === v ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'
              }`}>
              {v === 'all' ? 'All' : 'iOS vs Android'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-28">
        {EVENTS_DAU_DATA.map((d) => {
          const total = d.ios + d.android;
          const hPct  = (total / maxVal) * 100;
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end" style={{ height: `${hPct}%` }}>
                {groupBy === 'platform' ? (
                  <>
                    <div className="bg-blue-400 rounded-t"    style={{ height: `${(d.ios / total) * 100}%`, minHeight: 2 }} />
                    <div className="bg-emerald-400 rounded-b" style={{ height: `${(d.android / total) * 100}%`, minHeight: 2 }} />
                  </>
                ) : (
                  <div className="bg-violet-400 rounded w-full h-full" />
                )}
              </div>
              <span className="text-[9px] text-slate-400">{d.day}</span>
            </div>
          );
        })}
      </div>

      {groupBy === 'platform' && (
        <div className="flex gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-400 inline-block" /> iOS</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" /> Android</span>
        </div>
      )}

      <button onClick={() => onUseAsSegment('Active users')}
        className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium cursor-pointer mt-1">
        Use as segment input <ArrowRight size={12} />
      </button>
    </div>
  );
}

/* ── Distribution card ──────────────────────────────────────────────── */

export function DistributionCard({ onUseAsSegment }: ModelCardProps) {
  const [config, setConfig] = useState<DistributionConfig>(DEFAULT_DISTRIBUTION_CONFIG);

  return (
    <div className="space-y-2">
      <DistributionConfigPanel config={config} onChange={setConfig} onRun={() => {}} />

      {DISTRIBUTION_BUCKETS.map((b) => (
        <button key={b.label} onClick={() => onUseAsSegment(b.label)}
          className="w-full flex items-center gap-3 hover:bg-slate-50 rounded-lg p-1.5 -mx-1.5 cursor-pointer transition-colors text-left">
          <span className="text-xs text-slate-700 w-24 font-medium shrink-0">{b.label}</span>
          <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.pct}%`, minWidth: 4 }} />
          </div>
          <span className="text-xs text-slate-700 font-semibold w-16 text-right">{b.count.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 w-10 text-right">{b.pct}%</span>
        </button>
      ))}
      <p className="text-[10px] text-slate-400 mt-1">Click a bucket to use as segment input</p>
    </div>
  );
}

/* ── Interval card ──────────────────────────────────────────────────── */

export function IntervalCard({ onUseAsSegment }: ModelCardProps) {
  const [config, setConfig] = useState<IntervalConfig>(DEFAULT_INTERVAL_CONFIG);

  return (
    <div className="space-y-3">
      <IntervalConfigPanel config={config} onChange={setConfig} onRun={() => {}} />

      <p className="text-xs text-slate-500">{INTERVAL_METRICS.eventPair}</p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'P25',        value: INTERVAL_METRICS.p25 },
          { label: 'Median (P50)', value: INTERVAL_METRICS.p50 },
          { label: 'P75',        value: INTERVAL_METRICS.p75 },
        ].map((m) => (
          <div key={m.label} className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-slate-900">{m.value}</div>
            <div className="text-[11px] text-slate-500">{m.label}</div>
          </div>
        ))}
      </div>

      <button onClick={() => onUseAsSegment('Slow converters')}
        className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium cursor-pointer">
        Use as segment input <ArrowRight size={12} />
      </button>
    </div>
  );
}
