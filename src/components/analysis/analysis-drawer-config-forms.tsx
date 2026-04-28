/**
 * Right-side drawer shell + config forms for complex analysis models.
 * Retention / Funnel / RFM each have distinct parameter sets that need
 * more screen real estate than an inline strip can provide.
 *
 * Drawer uses position:fixed — safe inside overflow:hidden parents (no transforms on ancestors).
 */
import { useState } from 'react';
import { X, Plus, Settings } from 'lucide-react';
import type {
  RetentionConfig, RetentionInterval,
  FunnelConfig,
  RfmConfig,
  DateRange,
} from './analysis-config-types';
import { AVAILABLE_EVENTS, DATE_RANGE_OPTIONS } from './analysis-config-types';

/* ── Drawer shell ──────────────────────────────────────────────────── */

export function ConfigDrawer({ title, open, onClose, children }: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/25 z-40" onClick={onClose} />
      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 w-[380px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 shrink-0">
          <Settings size={15} className="text-violet-600 shrink-0" />
          <span className="text-sm font-bold text-slate-900 flex-1">{title}</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
            <X size={15} />
          </button>
        </div>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {children}
        </div>
      </div>
    </>
  );
}

/* ── Shared form primitives ─────────────────────────────────────────── */

function FormGroup({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 block">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-slate-400 leading-relaxed">{hint}</p>}
    </div>
  );
}

function DrawerSelect({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 cursor-pointer"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Pill<T extends string>({ value, active, onClick }: {
  value: T; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
        active ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >{value}</button>
  );
}

function NumberInput({ value, min, max, onChange, suffix }: {
  value: number; min: number; max: number;
  onChange: (v: number) => void; suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input type="number" min={min} max={max} value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
        className="w-24 text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
      />
      {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
    </div>
  );
}

function ApplyBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors mt-2"
    >
      Apply &amp; Run
    </button>
  );
}

/* ── Retention drawer form ──────────────────────────────────────────── */

export function RetentionDrawerForm({ config, onApply }: {
  config: RetentionConfig;
  onApply: (c: RetentionConfig) => void;
}) {
  const [draft, setDraft] = useState<RetentionConfig>(config);
  const ALL_INTERVALS: RetentionInterval[] = ['D1', 'D3', 'D7', 'D14', 'D30'];

  function toggleInterval(v: RetentionInterval) {
    setDraft((d) => ({
      ...d,
      intervals: d.intervals.includes(v)
        ? d.intervals.filter((x) => x !== v)
        : [...d.intervals, v].sort((a, b) => ALL_INTERVALS.indexOf(a) - ALL_INTERVALS.indexOf(b)),
    }));
  }

  return (
    <div className="space-y-4">
      <FormGroup label="Cohort trigger (first event)"
        hint="Users who perform this event enter the cohort on that date.">
        <DrawerSelect value={draft.cohortEvent}
          onChange={(v) => setDraft({ ...draft, cohortEvent: v })}
          options={AVAILABLE_EVENTS} />
      </FormGroup>

      <FormGroup label="Return event"
        hint="The event users need to perform again on each measured day.">
        <DrawerSelect value={draft.returnEvent}
          onChange={(v) => setDraft({ ...draft, returnEvent: v })}
          options={AVAILABLE_EVENTS} />
      </FormGroup>

      <FormGroup label="Cohort period">
        <div className="flex gap-1.5">
          {(['weekly', 'daily'] as const).map((v) => (
            <Pill key={v} value={v === 'weekly' ? 'Weekly' : 'Daily'} active={draft.cohortPeriod === v}
              onClick={() => setDraft({ ...draft, cohortPeriod: v })} />
          ))}
        </div>
      </FormGroup>

      <FormGroup label="Retention intervals"
        hint="At least one interval must be selected.">
        <div className="flex gap-1.5">
          {ALL_INTERVALS.map((v) => (
            <Pill key={v} value={v} active={draft.intervals.includes(v)}
              onClick={() => {
                if (draft.intervals.includes(v) && draft.intervals.length === 1) return;
                toggleInterval(v);
              }} />
          ))}
        </div>
      </FormGroup>

      <FormGroup label="Date range">
        <DrawerSelect value={draft.dateRange}
          onChange={(v) => setDraft({ ...draft, dateRange: v as DateRange })}
          options={DATE_RANGE_OPTIONS} />
      </FormGroup>

      <ApplyBtn onClick={() => onApply(draft)} />
    </div>
  );
}

/* ── Funnel drawer form ──────────────────────────────────────────────── */

export function FunnelDrawerForm({ config, onApply }: {
  config: FunnelConfig;
  onApply: (c: FunnelConfig) => void;
}) {
  const [draft, setDraft] = useState<FunnelConfig>(config);

  function updateStep(i: number, val: string) {
    const steps = [...draft.steps];
    steps[i] = val;
    setDraft({ ...draft, steps });
  }

  return (
    <div className="space-y-4">
      <FormGroup label="Funnel steps (ordered)"
        hint="Minimum 2 steps. Users must complete each step within the conversion window.">
        <div className="space-y-1.5">
          {draft.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 w-4 text-right shrink-0">{i + 1}</span>
              <div className="flex-1">
                <DrawerSelect value={step} onChange={(v) => updateStep(i, v)} options={AVAILABLE_EVENTS} />
              </div>
              <button onClick={() => {
                if (draft.steps.length <= 2) return;
                setDraft({ ...draft, steps: draft.steps.filter((_, idx) => idx !== i) });
              }}
                className={`shrink-0 transition-colors cursor-pointer ${
                  draft.steps.length <= 2 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-300 hover:text-red-400'
                }`}>
                <X size={13} />
              </button>
            </div>
          ))}
          {draft.steps.length < 8 && (
            <button onClick={() => setDraft({ ...draft, steps: [...draft.steps, 'login'] })}
              className="flex items-center gap-1 text-[11px] text-violet-600 hover:text-violet-800 font-medium cursor-pointer mt-0.5">
              <Plus size={11} /> Add step
            </button>
          )}
        </div>
      </FormGroup>

      <FormGroup label="Conversion window"
        hint="Maximum time allowed between the first and last step.">
        <div className="flex gap-1.5">
          {(['1h', '1d', '7d', '30d'] as const).map((v) => (
            <Pill key={v} value={v} active={draft.conversionWindow === v}
              onClick={() => setDraft({ ...draft, conversionWindow: v })} />
          ))}
        </div>
      </FormGroup>

      <FormGroup label="Date range">
        <DrawerSelect value={draft.dateRange}
          onChange={(v) => setDraft({ ...draft, dateRange: v as DateRange })}
          options={DATE_RANGE_OPTIONS} />
      </FormGroup>

      <ApplyBtn onClick={() => onApply(draft)} />
    </div>
  );
}

/* ── RFM drawer form ────────────────────────────────────────────────── */

export function RfmDrawerForm({ config, onApply }: {
  config: RfmConfig;
  onApply: (c: RfmConfig) => void;
}) {
  const [draft, setDraft] = useState<RfmConfig>(config);

  return (
    <div className="space-y-4">
      <FormGroup label="Recency window"
        hint="R score = how recently a user performed their last purchase within this window.">
        <NumberInput value={draft.recencyDays} min={1} max={365}
          onChange={(v) => setDraft({ ...draft, recencyDays: v })} suffix="days" />
      </FormGroup>

      <FormGroup label="Frequency event"
        hint="F score = how many times the user performed this event in the scoring window.">
        <DrawerSelect value={draft.frequencyEvent}
          onChange={(v) => setDraft({ ...draft, frequencyEvent: v })}
          options={AVAILABLE_EVENTS} />
      </FormGroup>

      <FormGroup label="Monetary metric"
        hint="M score = total value from this metric in the scoring window.">
        <div className="flex gap-1.5">
          {([
            { value: 'revenue',     label: 'Revenue (VNĐ)' },
            { value: 'order_count', label: 'Order count' },
          ] as const).map((o) => (
            <Pill key={o.value} value={o.label} active={draft.monetaryMetric === o.value}
              onClick={() => setDraft({ ...draft, monetaryMetric: o.value })} />
          ))}
        </div>
      </FormGroup>

      <FormGroup label="Scoring window"
        hint="All three R/F/M scores are calculated within this shared period.">
        <NumberInput value={draft.scoringWindowDays} min={7} max={365}
          onChange={(v) => setDraft({ ...draft, scoringWindowDays: v })} suffix="days" />
      </FormGroup>

      <ApplyBtn onClick={() => onApply(draft)} />
    </div>
  );
}
