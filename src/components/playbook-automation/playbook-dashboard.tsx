import { Settings, TrendingUp, TrendingDown, Clock, CheckCircle2, Zap, Users } from 'lucide-react';
import type { PlaybookRun, PlaybookStatus } from '../../types/segment-builder-types';
import { MOCK_PLAYBOOKS, MOCK_PRODUCTS } from '../../data/mock-data';

interface PlaybookDashboardProps {
  runs: PlaybookRun[];
  onTuneSegment: (run: PlaybookRun) => void;
}

const STATUS_CONFIG: Record<PlaybookStatus, { color: string; icon: React.ReactNode }> = {
  Scheduled: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={12} /> },
  Active: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Zap size={12} /> },
  Completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={12} /> },
};

/** Renders a gap indicator bar comparing actual vs benchmark */
function KpiGap({ label, actual, benchmark }: { label: string; actual?: number; benchmark?: number }) {
  if (benchmark == null) return null;
  const act = actual ?? 0;
  const pct = benchmark > 0 ? Math.min((act / benchmark) * 100, 150) : 0;
  const isAhead = act >= benchmark;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className={`font-semibold ${isAhead ? 'text-emerald-600' : 'text-amber-600'}`}>
          {act > 0 ? `+${act.toFixed(1)}%` : '—'} / +{benchmark}%
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isAhead ? 'bg-emerald-500' : 'bg-amber-400'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function PlaybookDashboard({ runs, onTuneSegment }: PlaybookDashboardProps) {
  if (runs.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        No playbook runs yet. Select a playbook to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-900">Run History</h3>
      {runs.map((run) => {
        const playbook = MOCK_PLAYBOOKS.find((p) => p.id === run.playbookId);
        const product = MOCK_PRODUCTS.find((p) => p.code === run.productCode);
        const status = STATUS_CONFIG[run.status];

        return (
          <div key={run.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h4 className="text-sm font-bold text-slate-900">{playbook?.name ?? run.playbookId}</h4>
                <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${status.color}`}>
                  {status.icon} {run.status}
                </span>
              </div>
              <button
                onClick={() => onTuneSegment(run)}
                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium cursor-pointer"
              >
                <Settings size={12} /> Tune Segment
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
              <span>Game: <strong className="text-slate-700">{product?.name ?? run.productCode}</strong></span>
              <span>Started: <strong className="text-slate-700">{new Date(run.startedAt).toLocaleDateString()}</strong></span>
              {run.audienceReached > 0 && (
                <span className="flex items-center gap-1">
                  <Users size={12} /> <strong className="text-slate-700">{run.audienceReached.toLocaleString()}</strong> reached
                </span>
              )}
            </div>

            {/* KPI gap indicators */}
            {run.status !== 'Scheduled' && (
              <div className="space-y-2">
                <KpiGap label="CTR Uplift" actual={run.metricsActual.ctrUplift} benchmark={run.metricsBenchmark.ctrUplift} />
                <KpiGap label="Conversion Uplift" actual={run.metricsActual.conversionUplift} benchmark={run.metricsBenchmark.conversionUplift} />
              </div>
            )}

            {run.status !== 'Scheduled' && (
              <div className="flex items-center gap-1 mt-3 text-xs">
                {(run.metricsActual.ctrUplift ?? 0) >= (run.metricsBenchmark.ctrUplift ?? 0) &&
                 (run.metricsActual.conversionUplift ?? 0) >= (run.metricsBenchmark.conversionUplift ?? 0) ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <TrendingUp size={14} /> Performing above benchmark
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <TrendingDown size={14} /> Below benchmark — consider tuning
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
