/**
 * Inline config panels for the 3 "simple" analysis models.
 * Rendered at the top of expanded card content — always visible when card is open.
 * Pattern: compact pill row with native selects + Run button.
 */
import { Play } from 'lucide-react';
import type { EventsConfig, DistributionConfig, IntervalConfig, DateRange } from './analysis-config-types';
import { AVAILABLE_EVENTS, DATE_RANGE_OPTIONS } from './analysis-config-types';

/* ── Shared primitives ─────────────────────────────────────────────── */

/** Tiny native select styled to match the existing card design */
function Sel({ value, onChange, options, label }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {label && <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-[11px] bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400 cursor-pointer"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

/** Container bar shared by all inline panels */
function InlineConfigBar({ children, onRun }: { children: React.ReactNode; onRun: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 mb-3 bg-slate-50 border border-slate-200 rounded-lg">
      {children}
      <button
        onClick={onRun}
        className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold rounded-md cursor-pointer transition-colors"
      >
        <Play size={9} fill="white" /> Run
      </button>
    </div>
  );
}

/* ── Events config panel ─────────────────────────────────────────────── */

export function EventsConfigPanel({ config, onChange, onRun }: {
  config: EventsConfig;
  onChange: (c: EventsConfig) => void;
  onRun: () => void;
}) {
  return (
    <InlineConfigBar onRun={onRun}>
      <Sel label="Event"
        value={config.event}
        onChange={(v) => onChange({ ...config, event: v })}
        options={AVAILABLE_EVENTS}
      />
      <Sel
        value={config.dateRange}
        onChange={(v) => onChange({ ...config, dateRange: v as DateRange })}
        options={DATE_RANGE_OPTIONS}
      />
      <Sel
        value={config.metric}
        onChange={(v) => onChange({ ...config, metric: v as EventsConfig['metric'] })}
        options={[
          { value: 'count',        label: 'Event count' },
          { value: 'unique_users', label: 'Unique users' },
          { value: 'sum_revenue',  label: 'Sum revenue' },
        ]}
      />
      <Sel label="By"
        value={config.breakdown}
        onChange={(v) => onChange({ ...config, breakdown: v as EventsConfig['breakdown'] })}
        options={[
          { value: 'none',     label: 'No breakdown' },
          { value: 'platform', label: 'Platform' },
          { value: 'country',  label: 'Country' },
          { value: 'version',  label: 'Version' },
        ]}
      />
    </InlineConfigBar>
  );
}

/* ── Distribution config panel ──────────────────────────────────────── */

export function DistributionConfigPanel({ config, onChange, onRun }: {
  config: DistributionConfig;
  onChange: (c: DistributionConfig) => void;
  onRun: () => void;
}) {
  return (
    <InlineConfigBar onRun={onRun}>
      <Sel label="Metric"
        value={config.metric}
        onChange={(v) => onChange({ ...config, metric: v as DistributionConfig['metric'] })}
        options={[
          { value: 'revenue',          label: 'Revenue' },
          { value: 'session_duration', label: 'Session duration' },
          { value: 'login_count',      label: 'Login count' },
        ]}
      />
      <Sel label="Buckets"
        value={config.bucketStrategy}
        onChange={(v) => onChange({ ...config, bucketStrategy: v as DistributionConfig['bucketStrategy'] })}
        options={[
          { value: 'equal_count', label: 'Equal count' },
          { value: 'equal_range', label: 'Equal range' },
          { value: 'custom',      label: 'Custom' },
        ]}
      />
      <Sel
        value={config.dateRange}
        onChange={(v) => onChange({ ...config, dateRange: v as DateRange })}
        options={DATE_RANGE_OPTIONS}
      />
    </InlineConfigBar>
  );
}

/* ── Interval config panel ──────────────────────────────────────────── */

export function IntervalConfigPanel({ config, onChange, onRun }: {
  config: IntervalConfig;
  onChange: (c: IntervalConfig) => void;
  onRun: () => void;
}) {
  return (
    <InlineConfigBar onRun={onRun}>
      <Sel label="From"
        value={config.eventA}
        onChange={(v) => onChange({ ...config, eventA: v })}
        options={AVAILABLE_EVENTS}
      />
      <span className="text-[11px] text-slate-400 font-medium">→</span>
      <Sel label="To"
        value={config.eventB}
        onChange={(v) => onChange({ ...config, eventB: v })}
        options={AVAILABLE_EVENTS}
      />
      <Sel
        value={config.dateRange}
        onChange={(v) => onChange({ ...config, dateRange: v as DateRange })}
        options={DATE_RANGE_OPTIONS}
      />
    </InlineConfigBar>
  );
}
