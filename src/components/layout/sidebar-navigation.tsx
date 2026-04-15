import { Layers, BookTemplate, Rocket, ChevronRight } from 'lucide-react';
import type { Phase } from '../../types/segment-builder-types';

const NAV_ITEMS: { phase: Phase; label: string; icon: React.ReactNode; step: number }[] = [
  { phase: 'builder', label: 'Segment Builder', icon: <Layers size={20} />, step: 1 },
  { phase: 'templates', label: 'Template Library', icon: <BookTemplate size={20} />, step: 2 },
  { phase: 'playbooks', label: 'Playbook Automation', icon: <Rocket size={20} />, step: 3 },
];

interface SidebarNavigationProps {
  activePhase: Phase;
  onPhaseChange: (phase: Phase) => void;
}

export function SidebarNavigation({ activePhase, onPhaseChange }: SidebarNavigationProps) {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-sm">
            G
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">VNGGames</div>
            <div className="text-[11px] text-slate-400">Grow Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-3 mb-3">
          LiveOps Segments
        </div>
        {NAV_ITEMS.map(({ phase, label, icon, step }) => {
          const isActive = activePhase === phase;
          return (
            <button
              key={phase}
              onClick={() => onPhaseChange(phase)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-violet-600/20 text-violet-300 font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className={isActive ? 'text-violet-400' : 'text-slate-500'}>{icon}</span>
              <span className="flex-1 text-left">{label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive ? 'bg-violet-600/30 text-violet-300' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step}
              </span>
              {isActive && <ChevronRight size={14} className="text-violet-400" />}
            </button>
          );
        })}
      </nav>

      {/* Phase indicator */}
      <div className="px-5 py-4 border-t border-slate-700/50">
        <div className="flex gap-1.5">
          {NAV_ITEMS.map(({ phase, step }) => (
            <div
              key={phase}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                activePhase === phase ? 'bg-violet-500' : 'bg-slate-700'
              }`}
              title={`Phase ${step}`}
            />
          ))}
        </div>
        <div className="text-[11px] text-slate-500 mt-2">
          Phase {NAV_ITEMS.find((n) => n.phase === activePhase)?.step} of 3
        </div>
      </div>
    </aside>
  );
}
