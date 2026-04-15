import { useState } from 'react';
import { Plus, Save, Users, Sparkles, ArrowLeft } from 'lucide-react';
import type { ConditionGroup, LogicOperator, Condition, Segment } from '../../types/segment-builder-types';
import { ConditionGroupCard } from './condition-group';
import { SavedSegmentsPanel } from './saved-segments-panel';
import { SegmentPreviewPanel } from './segment-preview-panel';
import { AiSuggestionInput } from './ai-suggestion-input';
import { useAudienceEstimate } from '../../hooks/use-audience-estimate';

let groupIdCounter = 200;
function newGroupId() { return `grp-${Date.now()}-${++groupIdCounter}`; }

let conditionIdCounter = 300;
function newConditionId() { return `cond-${Date.now()}-${++conditionIdCounter}`; }

function createEmptyCondition(): Condition {
  return { id: newConditionId(), property: '', operator: 'equals', value: '' };
}

function createEmptyGroup(): ConditionGroup {
  return { id: newGroupId(), negated: false, logic: 'AND', conditions: [createEmptyCondition()] };
}

interface SegmentBuilderProps {
  initialGroups?: ConditionGroup[];
  initialGroupLogic?: LogicOperator;
  initialName?: string;
  onClearInitial?: () => void;
  onBack?: () => void;
}

export function SegmentBuilder({ initialGroups, initialGroupLogic, initialName, onClearInitial, onBack }: SegmentBuilderProps) {
  const [groups, setGroups] = useState<ConditionGroup[]>(initialGroups ?? [createEmptyGroup()]);
  const [groupLogic, setGroupLogic] = useState<LogicOperator>(initialGroupLogic ?? 'AND');
  const [segmentName, setSegmentName] = useState(initialName ?? '');
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedSegments, setSavedSegments] = useState<Segment[]>([]);

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
      groups: JSON.parse(JSON.stringify(groups)),
      groupLogic,
      estimatedAudience: estimate,
    };

    setSavedSegments((prev) => {
      const exists = prev.findIndex((s) => s.id === segment.id);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = segment;
        return next;
      }
      return [segment, ...prev];
    });

    setSaved(true);
    setEditingId(segment.id);
    onClearInitial?.();
  };

  const handleReset = () => {
    setGroups([createEmptyGroup()]);
    setGroupLogic('AND');
    setSegmentName('');
    setSaved(false);
    setEditingId(null);
    onClearInitial?.();
  };

  const handleLoad = (segment: Segment) => {
    setGroups(JSON.parse(JSON.stringify(segment.groups)));
    setGroupLogic(segment.groupLogic);
    setSegmentName(segment.name);
    setEditingId(segment.id);
    setSaved(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    setSavedSegments((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) {
      handleReset();
    }
  };

  /** Apply AI-generated conditions into the builder */
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
      {/* Back button */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
          <ArrowLeft size={16} /> Back
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Segment Builder</h1>
          <p className="text-sm text-slate-500 mt-1">Define audience conditions to build a player segment</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {editingId ? 'New Segment' : 'Reset'}
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

      {/* Audience estimate */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/50 rounded-xl px-5 py-4">
        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
          <Users size={20} className="text-violet-600" />
        </div>
        <div>
          <div className="text-sm text-slate-500">Estimated Audience</div>
          <div className="text-2xl font-bold text-slate-900">
            {estimate > 0 ? estimate.toLocaleString() : '—'}
          </div>
        </div>
        <div className="ml-auto text-xs text-slate-400">players matching conditions</div>
      </div>

      {/* Condition groups */}
      <div className="space-y-3">
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
      </div>

      {/* Add group */}
      {groups.length < 4 && (
        <button
          onClick={handleAddGroup}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/30 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Add condition group
        </button>
      )}

      {/* Segment preview — natural language summary */}
      <SegmentPreviewPanel groups={groups} groupLogic={groupLogic} />

      {/* Saved segments listing */}
      <SavedSegmentsPanel segments={savedSegments} onLoad={handleLoad} onDelete={handleDelete} />
    </div>
  );
}
