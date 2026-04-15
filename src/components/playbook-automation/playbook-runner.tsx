import { useState } from 'react';
import { ArrowLeft, Play, Settings, TrendingUp, Bell, MessageSquare, Smartphone } from 'lucide-react';
import type { Playbook, ActionType } from '../../types/segment-builder-types';
import { MOCK_PRODUCTS, PROPERTIES, OPERATORS } from '../../data/mock-data';

interface PlaybookRunnerProps {
  playbook: Playbook;
  onBack: () => void;
  onCustomizeSegment: (playbook: Playbook) => void;
  onRun: (playbookId: string, productCode: string) => void;
}

const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
  'Push': <Bell size={16} />,
  'In-app Message': <MessageSquare size={16} />,
  'SMS': <Smartphone size={16} />,
};

export function PlaybookRunner({ playbook, onBack, onCustomizeSegment, onRun }: PlaybookRunnerProps) {
  const [productCode, setProductCode] = useState('');
  const [launched, setLaunched] = useState(false);

  const handleRun = () => {
    if (!productCode) return;
    setLaunched(true);
    onRun(playbook.id, productCode);
  };

  return (
    <div className="space-y-6">
      {/* Back button & header */}
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2 cursor-pointer">
          <ArrowLeft size={16} /> Back to Playbooks
        </button>
        <h2 className="text-xl font-bold text-slate-900">{playbook.name}</h2>
        <p className="text-sm text-slate-500 mt-1">{playbook.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Segment & Action */}
        <div className="space-y-4">
          {/* Segment logic (read-only) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Segment Logic</h3>
              <button
                onClick={() => onCustomizeSegment(playbook)}
                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium cursor-pointer"
              >
                <Settings size={12} /> Customize
              </button>
            </div>
            {playbook.template.groups.map((group) => (
              <div key={group.id} className={`space-y-1 ${group.negated ? 'pl-3 border-l-2 border-orange-300' : ''}`}>
                {group.negated && <span className="text-[10px] font-bold text-orange-600">NOT</span>}
                {group.conditions.map((cond, ci) => (
                  <div key={cond.id} className="flex items-center gap-1.5 text-sm">
                    {ci > 0 && (
                      <span className={`text-[10px] font-bold ${group.logic === 'AND' ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {group.logic}
                      </span>
                    )}
                    <code className="text-xs bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-700">
                      {PROPERTIES.find((p) => p.key === cond.property)?.label ?? cond.property}{' '}
                      {OPERATORS.find((o) => o.value === cond.operator)?.label ?? cond.operator}{' '}
                      {cond.value}
                    </code>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Action template */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Action Template</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-200">
                {ACTION_ICONS[playbook.action.type]}
                {playbook.action.type}
              </span>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-sm font-semibold text-slate-800">{playbook.action.title}</div>
              <div className="text-xs text-slate-500 mt-1">{playbook.action.body}</div>
            </div>
          </div>
        </div>

        {/* Right: Config & KPI */}
        <div className="space-y-4">
          {/* KPI benchmarks */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Expected KPI Benchmarks</h3>
            <div className="grid grid-cols-2 gap-3">
              {playbook.expectedKpi.ctrUplift != null && (
                <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
                  <TrendingUp size={20} className="text-emerald-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-emerald-700">+{playbook.expectedKpi.ctrUplift}%</div>
                  <div className="text-[11px] text-emerald-600">CTR Uplift</div>
                </div>
              )}
              {playbook.expectedKpi.conversionUplift != null && (
                <div className="bg-violet-50 rounded-lg p-3 text-center border border-violet-100">
                  <TrendingUp size={20} className="text-violet-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-violet-700">+{playbook.expectedKpi.conversionUplift}%</div>
                  <div className="text-[11px] text-violet-600">Conversion Uplift</div>
                </div>
              )}
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Configuration</h3>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Product Code (Game) *</label>
              <select
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              >
                <option value="">Select a game...</option>
                {MOCK_PRODUCTS.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={!productCode || launched}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-violet-200"
          >
            <Play size={18} />
            {launched ? 'Playbook Scheduled!' : 'Run Playbook'}
          </button>
        </div>
      </div>
    </div>
  );
}
