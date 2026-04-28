import { useState } from 'react';
import { Plus, Save, Sparkles, ArrowLeft } from 'lucide-react';
import type { ConditionGroup, LogicOperator, Condition, Segment, SegmentType } from '../../types/segment-builder-types';
import { ConditionGroupCard } from './condition-group';
import { SegmentPreviewPanel } from './segment-preview-panel';
import { AiSuggestionInput } from './ai-suggestion-input';
import { useAudienceEstimate } from '../../hooks/use-audience-estimate';

/* ── Segment type options ── */
const SEGMENT_TYPES: {
  value: SegmentType;
  icon: string;
  label: string;
  desc: string;
  activeClass: string;
}[] = [
  {
    value: 'dynamic',
    icon: '⟳',
    label: 'Dynamic',
    desc: 'Re-computed on demand or by schedule',
    activeClass: 'bg-blue-50 border-blue-400 text-blue-700',
  },
  {
    value: 'static',
    icon: '❄',
    label: 'Static',
    desc: 'Frozen snapshot — size never changes',
    activeClass: 'bg-slate-100 border-slate-400 text-slate-700',
  },
  {
    value: 'realtime',
    icon: '⚡',
    label: 'Realtime',
    desc: 'Always queries live on page load',
    activeClass: 'bg-emerald-50 border-emerald-400 text-emerald-700',
  },
];

let groupIdCounter = 200;
function newGroupId() { return `grp-${Date.now()}-${++groupIdCounter}`; }

let conditionIdCounter = 300;
function newConditionId() { return `cond-${Date.now()}-${++conditionIdCounter}`; }

function createEmptyCondition(): Condition {
  return { id: newConditionId(), property: '', operator: 'equal', value: '' };
}

function createEmptyGroup(): ConditionGroup {
  return { id: newGroupId(), negated: false, logic: 'AND', conditions: [createEmptyCondition()] };
}

interface SegmentBuilderProps {
  initialGroups?: ConditionGroup[];
  initialGroupLogic?: LogicOperator;
  initialName?: string;
  /** ID of segment being edited (from listing) */
  editingId?: string | null;
  onClearInitial?: () => void;
  onBack?: () => void;
  /** Notify parent (container) when segment is saved */
  onSave?: (segment: Segment) => void;
}

export function SegmentBuilder({
  initialGroups, initialGroupLogic, initialName,
  editingId: externalEditingId, onClearInitial, onBack, onSave,
}: SegmentBuilderProps) {
  const [groups, setGroups] = useState<ConditionGroup[]>(initialGroups ?? [createEmptyGroup()]);
  const [groupLogic, setGroupLogic] = useState<LogicOperator>(initialGroupLogic ?? 'AND');
  const [segmentName, setSegmentName] = useState(initialName ?? '');
  const [segmentType, setSegmentType] = useState<SegmentType>('dynamic');
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(externalEditingId ?? null);

  const estimate = useAudienceEstimate(groups);

  const handleGroupChange = (idx: number, updated: ConditionGroup) => {
    const next = [...groups];
    next[idx] = updated;
    setGroups(next);
    setSaved(false);
  };

  const handleGroupRemove = (idx: number) => {
    setGroups(groups.filter((_, i) => i !== idx));
    setSaved(false);
  };

  const handleAddGroup = () => {
    if (groups.length >= 4) return;
    setGroups([...groups, createEmptyGroup()]);
    setSaved(false);
  };

  const handleSave = () => {
    if (!segmentName.trim()) return;
    const segment: Segment = {
      id: editingId ?? `seg-${Date.now()}`,
      name: segmentName,
      segmentType,
      groups: JSON.parse(JSON.stringify(groups)),
      groupLogic,
      estimatedAudience: estimate,
    };
    setEditingId(segment.id);
    setSaved(true);
    onClearInitial?.();
    onSave?.(segment);
  };

  const handleReset = () => {
    setGroups([createEmptyGroup()]);
    setGroupLogic('AND');
    setSegmentName('');
    setSaved(false);
    setEditingId(null);
    onClearInitial?.();
  };

  const handleAiApply = (aiGroups: ConditionGroup[], aiLogic: LogicOperator, aiName: string) => {
    setGroups(aiGroups);
    setGroupLogic(aiLogic);
    if (aiName) setSegmentName(aiName);
    setSaved(false);
    setEditingId(null);
  };

  const groupLogicColor = groupLogic === 'AND'
    ? 'bg-blue-100 text-blue-700 border-blue-200'
    : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  return (
    <div className="space-y-6">
      {/* Back button — always shown to go back to listing */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
          <ArrowLeft size={16} /> Back to Segments
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {editingId ? 'Edit Segment' : 'New Segment'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Define audience conditions to build a player segment</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!segmentName.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Save size={16} />
            {editingId ? 'Update Segment' : 'Save Segment'}
          </button>
        </div>
      </div>

      {/* AI Suggestion */}
      <AiSuggestionInput onApply={handleAiApply} />

      {/* Segment name input */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
        <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Segment Name</label>
        <input
          type="text"
          value={segmentName}
          onChange={(e) => { setSegmentName(e.target.value); setSaved(false); }}
          placeholder="e.g. High-value churned iOS users"
          className="flex-1 h-9 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
        />
        {saved && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
            <Sparkles size={12} /> Saved
          </span>
        )}
      </div>

      {/* Segment type selector */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
        <label className="text-sm font-medium text-slate-700 whitespace-nowrap w-32 shrink-0">Segment Type</label>
        <div className="flex gap-2 flex-1">
          {SEGMENT_TYPES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSegmentType(opt.value)}
              className={`flex-1 flex flex-col items-start px-3 py-2 rounded-lg border-2 transition-all cursor-pointer text-left ${
                segmentType === opt.value
                  ? opt.activeClass
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs font-bold leading-tight">{opt.icon} {opt.label}</span>
              <span className="text-[10px] mt-0.5 leading-tight opacity-75">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Two-column: conditions (left) + preview (right on lg+) */}
      <div className="flex gap-5 items-start">
        <div className="flex-1 min-w-0 space-y-3">
          {groups.map((group, idx) => (
            <div key={group.id}>
              {idx > 0 && (
                <div className="flex items-center gap-3 py-2">
                  <div className="h-px flex-1 bg-slate-200" />
                  <button
                    onClick={() => setGroupLogic(groupLogic === 'AND' ? 'OR' : 'AND')}
                    className={`px-4 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${groupLogicColor}`}
                  >
                    {groupLogic}
                  </button>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
              )}
              <ConditionGroupCard
                group={group}
                onChange={(updated) => handleGroupChange(idx, updated)}
                onRemove={() => handleGroupRemove(idx)}
                canRemove={groups.length > 1}
              />
            </div>
          ))}

          {groups.length < 4 && (
            <button
              onClick={handleAddGroup}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/30 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              Add condition group
            </button>
          )}
        </div>

        <div className="hidden lg:block w-72 shrink-0 sticky top-6">
          <SegmentPreviewPanel groups={groups} groupLogic={groupLogic} audienceEstimate={estimate} />
        </div>
      </div>

      {/* Preview below on small screens */}
      <div className="lg:hidden">
        <SegmentPreviewPanel groups={groups} groupLogic={groupLogic} audienceEstimate={estimate} />
      </div>
    </div>
  );
}
