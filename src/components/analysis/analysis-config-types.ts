/** Config types, defaults, and shared constants for all 6 analysis models */

export type DateRange = 'last_7d' | 'last_14d' | 'last_30d' | 'last_90d';

export const AVAILABLE_EVENTS = [
  { value: 'install',           label: 'Install' },
  { value: 'register',          label: 'Register' },
  { value: 'login',             label: 'Login' },
  { value: 'session_start',     label: 'Session start' },
  { value: 'tutorial_complete', label: 'Tutorial complete' },
  { value: 'first_purchase',    label: 'First purchase' },
  { value: 'purchase',          label: 'Purchase' },
  { value: 'level_up',          label: 'Level up' },
  { value: 'ad_watched',        label: 'Ad watched' },
];

export const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'last_7d',  label: 'Last 7 days' },
  { value: 'last_14d', label: 'Last 14 days' },
  { value: 'last_30d', label: 'Last 30 days' },
  { value: 'last_90d', label: 'Last 90 days' },
];

/* ── Inline (simple) model configs ── */

export interface EventsConfig {
  event: string;
  dateRange: DateRange;
  metric: 'count' | 'unique_users' | 'sum_revenue';
  breakdown: 'none' | 'platform' | 'country' | 'version';
}
export const DEFAULT_EVENTS_CONFIG: EventsConfig = {
  event: 'purchase', dateRange: 'last_7d', metric: 'count', breakdown: 'none',
};

export interface DistributionConfig {
  metric: 'revenue' | 'session_duration' | 'login_count';
  bucketStrategy: 'equal_count' | 'equal_range' | 'custom';
  dateRange: DateRange;
}
export const DEFAULT_DISTRIBUTION_CONFIG: DistributionConfig = {
  metric: 'revenue', bucketStrategy: 'equal_count', dateRange: 'last_30d',
};

export interface IntervalConfig {
  eventA: string;
  eventB: string;
  dateRange: DateRange;
}
export const DEFAULT_INTERVAL_CONFIG: IntervalConfig = {
  eventA: 'register', eventB: 'first_purchase', dateRange: 'last_30d',
};

/* ── Drawer (complex) model configs ── */

export type RetentionInterval = 'D1' | 'D3' | 'D7' | 'D14' | 'D30';

export interface RetentionConfig {
  cohortEvent: string;
  returnEvent: string;
  cohortPeriod: 'weekly' | 'daily';
  intervals: RetentionInterval[];
  dateRange: DateRange;
}
export const DEFAULT_RETENTION_CONFIG: RetentionConfig = {
  cohortEvent: 'install', returnEvent: 'login',
  cohortPeriod: 'weekly', intervals: ['D1', 'D3', 'D7', 'D14', 'D30'],
  dateRange: 'last_30d',
};

export interface FunnelConfig {
  steps: string[];
  conversionWindow: '1h' | '1d' | '7d' | '30d';
  dateRange: DateRange;
}
export const DEFAULT_FUNNEL_CONFIG: FunnelConfig = {
  steps: ['install', 'register', 'tutorial_complete', 'first_purchase'],
  conversionWindow: '7d', dateRange: 'last_30d',
};

export interface RfmConfig {
  recencyDays: number;
  frequencyEvent: string;
  monetaryMetric: 'revenue' | 'order_count';
  scoringWindowDays: number;
}
export const DEFAULT_RFM_CONFIG: RfmConfig = {
  recencyDays: 90, frequencyEvent: 'purchase',
  monetaryMetric: 'revenue', scoringWindowDays: 90,
};

/* ── Complex configs aggregate ── */

export interface AllComplexConfigs {
  retention: RetentionConfig;
  funnel: FunnelConfig;
  rfm: RfmConfig;
}
export const DEFAULT_COMPLEX_CONFIGS: AllComplexConfigs = {
  retention: DEFAULT_RETENTION_CONFIG,
  funnel: DEFAULT_FUNNEL_CONFIG,
  rfm: DEFAULT_RFM_CONFIG,
};

/** Human-readable one-liner summarising current config — shown in card header */
export function getConfigSummary(
  modelId: 'retention' | 'funnel' | 'rfm',
  configs: AllComplexConfigs,
): string {
  switch (modelId) {
    case 'retention': {
      const c = configs.retention;
      const label = AVAILABLE_EVENTS.find((e) => e.value === c.cohortEvent)?.label ?? c.cohortEvent;
      const ret   = AVAILABLE_EVENTS.find((e) => e.value === c.returnEvent)?.label  ?? c.returnEvent;
      return `${label} → ${ret} · ${c.cohortPeriod} · ${c.intervals.length} intervals`;
    }
    case 'funnel': {
      const c = configs.funnel;
      return `${c.steps.length} steps · window: ${c.conversionWindow}`;
    }
    case 'rfm': {
      const c = configs.rfm;
      const freq = AVAILABLE_EVENTS.find((e) => e.value === c.frequencyEvent)?.label ?? c.frequencyEvent;
      return `R: ${c.recencyDays}d · F: ${freq} · M: ${c.monetaryMetric === 'revenue' ? 'revenue' : 'order count'}`;
    }
  }
}
