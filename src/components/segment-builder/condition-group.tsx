import { Plus, Ban, X } from 'lucide-react';
import type { ConditionGroup as ConditionGroupType, Condition, LogicOperator } from '../../types/segment-builder-types';
import { ConditionRow } from './condition-row';

interface ConditionGroupProps {
  group: ConditionGroupType;
  onChange: (updated: ConditionGroupType) => void;
  onRemove: () => void;
  canRemove: boolean;
}

let conditionIdCounter = 100;
function newConditionId() {
  return `cond-${Date.now()}-${++conditionIdCounter}`;
}

function createEmptyCondition(): Condition {
  return { id: newConditionId(), property: '', operator: 'equal', value: '' };
}

export function ConditionGroupCard({ group, onChange, onRemove, canRemove }: ConditionGroupProps) {
  const handleAddCondition = () => {
    onChange({ ...group, conditions: [...group.conditions, createEmptyCondition()] });
  };

  const handleConditionChange = (idx: number, updated: Condition) => {
    const next = [...group.conditions];
    next[idx] = updated;
    onChange({ ...group, conditions: next });
  };

  const handleConditionRemove = (idx: number) => {
    onChange({ ...group, conditions: group.conditions.filter((_, i) => i !== idx) });
  };

  const handleLogicToggle = () => {
    const next: LogicOperator = group.logic === 'AND' ? 'OR' : 'AND';
    onChange({ ...group, logic: next });
  };

  const handleNegateToggle = () => {
    onChange({ ...group, negated: !group.negated });
  };

  const logicColor = group.logic === 'AND' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200';
  const borderColor = group.negated ? 'border-orange-300 bg-orange-50/30' : 'border-slate-200 bg-white';

  return (
    <div className={`rounded-xl border-2 ${borderColor} p-4 transition-colors`}>
      {/* Group header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* NOT toggle */}
          <button
            onClick={handleNegateToggle}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
              group.negated
                ? 'bg-orange-100 text-orange-700 border-orange-300'
                : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-orange-50 hover:text-orange-500'
            }`}
            title="Toggle NOT (negate this group)"
          >
            <Ban size={12} />
            NOT
          </button>

          {/* Logic toggle */}
          <button
            onClick={handleLogicToggle}
            className={`px-3 py-1 rounded-md text-xs font-bold border transition-colors cursor-pointer ${logicColor}`}
          >
            {group.logic}
          </button>

          <span className="text-xs text-slate-400">
            {group.conditions.length} condition{group.conditions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {canRemove && (
          <button
            onClick={onRemove}
            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            title="Remove group"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Conditions list */}
      <div className="space-y-2">
        {group.conditions.map((cond, idx) => (
          <div key={cond.id}>
            {idx > 0 && (
              <div className="flex items-center gap-2 py-1">
                <div className="h-px flex-1 bg-slate-100" />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${logicColor}`}>
                  {group.logic}
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
            )}
            <ConditionRow
              condition={cond}
              onChange={(updated) => handleConditionChange(idx, updated)}
              onRemove={() => handleConditionRemove(idx)}
              canRemove={group.conditions.length > 1}
            />
          </div>
        ))}
      </div>

      {/* Add condition */}
      <button
        onClick={handleAddCondition}
        className="mt-3 flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors cursor-pointer"
      >
        <Plus size={14} />
        Add condition
      </button>
    </div>
  );
}
