import { Play, TrendingUp, MessageSquare, Bell, Smartphone } from 'lucide-react';
import type { Playbook, ActionType } from '../../types/segment-builder-types';

interface PlaybookCardProps {
  playbook: Playbook;
  onSelect: (playbook: Playbook) => void;
}

const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
  'Push': <Bell size={14} />,
  'In-app Message': <MessageSquare size={14} />,
  'SMS': <Smartphone size={14} />,
};

const ACTION_COLORS: Record<ActionType, string> = {
  'Push': 'bg-blue-50 text-blue-600 border-blue-200',
  'In-app Message': 'bg-amber-50 text-amber-600 border-amber-200',
  'SMS': 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

export function PlaybookCard({ playbook, onSelect }: PlaybookCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-slate-300 transition-all">
      {/* Action type badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${ACTION_COLORS[playbook.action.type]}`}>
          {ACTION_ICONS[playbook.action.type]}
          {playbook.action.type}
        </span>
        <div className="flex items-center gap-2">
          {playbook.expectedKpi.ctrUplift != null && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <TrendingUp size={12} /> CTR +{playbook.expectedKpi.ctrUplift}%
            </span>
          )}
          {playbook.expectedKpi.conversionUplift != null && (
            <span className="flex items-center gap-1 text-xs font-semibold text-violet-600">
              <TrendingUp size={12} /> Conv +{playbook.expectedKpi.conversionUplift}%
            </span>
          )}
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-1">{playbook.name}</h3>
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{playbook.description}</p>

      {/* Action preview */}
      <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Message Preview</div>
        <div className="text-sm font-medium text-slate-800">{playbook.action.title}</div>
        <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{playbook.action.body}</div>
      </div>

      <button
        onClick={() => onSelect(playbook)}
        className="w-full flex items-center justify-center gap-2 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors cursor-pointer"
      >
        <Play size={14} />
        Configure & Run
      </button>
    </div>
  );
}
