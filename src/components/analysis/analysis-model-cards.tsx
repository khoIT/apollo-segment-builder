/**
 * Barrel: exports CardShell (the collapsible card wrapper) and ANALYSIS_CARDS
 * (the ordered model registry used by AnalysisTab to render the grid).
 *
 * Individual card components live in:
 *   - analysis-simple-model-cards.tsx   (Events, Distribution, Interval)
 *   - analysis-complex-model-cards.tsx  (Retention, Funnel, RFM)
 */
import { Settings, BarChart3, Grid3X3, GitBranch, PieChart, Clock, LayoutGrid } from 'lucide-react';
import { EventsCard, DistributionCard, IntervalCard }  from './analysis-simple-model-cards';
import { RetentionCard, FunnelCard, RfmCard }           from './analysis-complex-model-cards';

/* ── Shared card shell ──────────────────────────────────────────────── */

interface CardShellProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  /** If provided, renders a ⚙ Configure button in the header (complex models) */
  onConfigure?: () => void;
  /** One-liner shown below the title when a config has been applied */
  configSummary?: string;
}

export function CardShell({
  title, icon, children, expanded, onToggle, onConfigure, configSummary,
}: CardShellProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
      {/* Header row — expand area + optional configure button + chevron */}
      <div className="flex items-center gap-2 px-5 py-3.5">
        {/* Clickable expand area */}
        <button
          onClick={onToggle}
          className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold text-slate-900">{title}</span>
            {configSummary && (
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{configSummary}</p>
            )}
          </div>
        </button>

        {/* Configure button (complex models only) */}
        {onConfigure && (
          <button
            onClick={onConfigure}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-500 hover:bg-violet-100 hover:text-violet-700 transition-colors cursor-pointer shrink-0"
          >
            <Settings size={11} /> Configure
          </button>
        )}

        {/* Expand chevron */}
        <button onClick={onToggle} className="cursor-pointer shrink-0 text-slate-400 hover:text-slate-600">
          <span className={`text-xs transition-transform inline-block ${expanded ? 'rotate-90' : ''}`}>▸</span>
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Analysis model registry ────────────────────────────────────────── */

export const ANALYSIS_CARDS = [
  {
    id: 'events',       title: 'Events',
    icon: <BarChart3  size={18} className="text-violet-600" />,
    Component: EventsCard,       configType: 'inline',
  },
  {
    id: 'retention',    title: 'Retention',
    icon: <Grid3X3    size={18} className="text-violet-600" />,
    Component: RetentionCard,    configType: 'drawer',
  },
  {
    id: 'funnel',       title: 'Funnel',
    icon: <GitBranch  size={18} className="text-violet-600" />,
    Component: FunnelCard,       configType: 'drawer',
  },
  {
    id: 'distribution', title: 'Distribution',
    icon: <PieChart   size={18} className="text-violet-600" />,
    Component: DistributionCard, configType: 'inline',
  },
  {
    id: 'interval',     title: 'Interval',
    icon: <Clock      size={18} className="text-violet-600" />,
    Component: IntervalCard,     configType: 'inline',
  },
  {
    id: 'rfm',          title: 'RFM Segmentation',
    icon: <LayoutGrid size={18} className="text-violet-600" />,
    Component: RfmCard,          configType: 'drawer',
  },
] as const;
