/**
 * "Complex" analysis model cards — Retention, Funnel, RFM.
 * These cards are display-only: they render static mock data.
 * Config parameters are edited via the side drawer managed by AnalysisTab,
 * not inline, because their parameter sets are too rich for an inline strip.
 */
import { ArrowRight } from 'lucide-react';
import {
  RETENTION_COHORTS, FUNNEL_STEPS, RFM_GRID,
} from '../../data/analysis-mock-data';
import type { ModelCardProps } from './analysis-simple-model-cards';

/* ── Retention card ─────────────────────────────────────────────────── */

export function RetentionCard({ onUseAsSegment }: ModelCardProps) {
  const rColor = (v: number) =>
    v >= 30 ? 'bg-emerald-100 text-emerald-800'
    : v >= 15 ? 'bg-amber-50 text-amber-700'
    : 'bg-red-50 text-red-600';

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-slate-100">
              <th className="text-left py-1.5 pr-3 font-medium">Cohort</th>
              <th className="text-right px-2 font-medium">Users</th>
              {['D1', 'D3', 'D7', 'D14', 'D30'].map((d) => (
                <th key={d} className="text-center px-2 font-medium">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RETENTION_COHORTS.map((row) => (
              <tr key={row.cohort} className="border-b border-slate-50">
                <td className="py-2 pr-3 font-medium text-slate-700">{row.cohort}</td>
                <td className="text-right px-2 text-slate-500">{row.users.toLocaleString()}</td>
                {[row.d1, row.d3, row.d7, row.d14, row.d30].map((v, i) => (
                  <td key={i} className="text-center px-1.5 py-1.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${rColor(v)}`}>
                      {v}%
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => onUseAsSegment('Retained D7+')}
        className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium cursor-pointer">
        Use as segment input <ArrowRight size={12} />
      </button>
    </div>
  );
}

/* ── Funnel card ────────────────────────────────────────────────────── */

export function FunnelCard({ onUseAsSegment }: ModelCardProps) {
  const maxDropIdx = FUNNEL_STEPS.reduce((worst, _step, i) => {
    if (i === 0) return worst;
    const drop     = FUNNEL_STEPS[i - 1].pct - FUNNEL_STEPS[i].pct;
    const worstDrop = FUNNEL_STEPS[worst - 1].pct - FUNNEL_STEPS[worst].pct;
    return drop > worstDrop ? i : worst;
  }, 1);

  return (
    <div className="space-y-2">
      {FUNNEL_STEPS.map((step, i) => {
        const isBiggestDrop = i === maxDropIdx;
        return (
          <div key={step.name} className="flex items-center gap-3">
            <span className="text-xs text-slate-600 w-28 shrink-0 font-medium">{step.name}</span>
            <div className="flex-1 h-7 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isBiggestDrop ? 'bg-red-400' : 'bg-violet-400'}`}
                style={{ width: `${step.pct}%` }}
              />
            </div>
            <div className="w-20 text-right shrink-0">
              <span className={`text-xs font-bold ${isBiggestDrop ? 'text-red-600' : 'text-slate-700'}`}>
                {step.count.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">{step.pct}%</span>
            </div>
          </div>
        );
      })}
      <p className="text-[10px] text-red-500 font-medium">
        ⚠ Biggest drop: {FUNNEL_STEPS[maxDropIdx - 1].name} → {FUNNEL_STEPS[maxDropIdx].name}
      </p>
      <button onClick={() => onUseAsSegment('Funnel drop-off')}
        className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium cursor-pointer">
        Use as segment input <ArrowRight size={12} />
      </button>
    </div>
  );
}

/* ── RFM card ───────────────────────────────────────────────────────── */

export function RfmCard({ onUseAsSegment }: ModelCardProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <span>← Low Frequency</span>
        <span className="flex-1" />
        <span>High Frequency →</span>
      </div>

      <div className="space-y-0.5">
        {RFM_GRID.map((row, ri) => (
          <div key={ri} className="flex gap-0.5">
            <span className="text-[9px] text-slate-400 w-6 shrink-0 flex items-center justify-center">
              R{5 - ri}
            </span>
            {row.map((cell, ci) => (
              <button key={ci} onClick={() => onUseAsSegment(cell.label)}
                className={`flex-1 py-2 rounded text-[9px] font-semibold text-center cursor-pointer hover:ring-2 hover:ring-violet-400 transition-all ${cell.color}`}>
                {cell.label}
              </button>
            ))}
          </div>
        ))}
        <div className="flex gap-0.5 mt-0.5">
          <span className="w-6" />
          {['F1', 'F2', 'F3', 'F4', 'F5'].map((f) => (
            <span key={f} className="flex-1 text-center text-[9px] text-slate-400">{f}</span>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-slate-400">Click any cell to use its users as segment input</p>
    </div>
  );
}
