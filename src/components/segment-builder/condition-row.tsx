import { Trash2 } from 'lucide-react';
import type { Condition, OperatorType } from '../../types/segment-builder-types';
import { PROPERTIES, OPERATORS } from '../../data/mock-data';

interface ConditionRowProps {
  condition: Condition;
  onChange: (updated: Condition) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const NO_VALUE_OPERATORS: OperatorType[] = ['is_null', 'is_not_null'];

export function ConditionRow({ condition, onChange, onRemove, canRemove }: ConditionRowProps) {
  const needsValue = !NO_VALUE_OPERATORS.includes(condition.operator);
  const isBetween = condition.operator === 'between';

  // Group properties by category for the select dropdown
  const grouped = PROPERTIES.reduce<Record<string, typeof PROPERTIES>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="flex items-center gap-2 group">
      {/* Property selector */}
      <select
        value={condition.property}
        onChange={(e) => onChange({ ...condition, property: e.target.value })}
        className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm min-w-[160px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
      >
        <option value="">Select property...</option>
        {Object.entries(grouped).map(([cat, props]) => (
          <optgroup key={cat} label={cat}>
            {props.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </optgroup>
        ))}
      </select>

      {/* Operator selector */}
      <select
        value={condition.operator}
        onChange={(e) => onChange({ ...condition, operator: e.target.value as OperatorType })}
        className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm min-w-[110px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>

      {/* Value input */}
      {needsValue && (
        <input
          type="text"
          value={condition.value}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          placeholder="Value"
          className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm min-w-[120px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
        />
      )}

      {/* Second value for 'between' */}
      {isBetween && (
        <>
          <span className="text-xs text-slate-400 font-medium">and</span>
          <input
            type="text"
            value={condition.valueTo ?? ''}
            onChange={(e) => onChange({ ...condition, valueTo: e.target.value })}
            placeholder="Value"
            className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm min-w-[120px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
          />
        </>
      )}

      {/* Remove button */}
      <button
        onClick={onRemove}
        disabled={!canRemove}
        className={`p-1.5 rounded transition-colors ${
          canRemove
            ? 'text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'
            : 'text-slate-200 cursor-not-allowed'
        }`}
        title="Remove condition"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
