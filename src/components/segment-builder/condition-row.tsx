import { Trash2 } from 'lucide-react';
import type { Condition, OperatorType, DataType } from '../../types/segment-builder-types';
import { PROPERTIES, getOperatorsForType } from '../../data/mock-data';

interface ConditionRowProps {
  condition: Condition;
  onChange: (updated: Condition) => void;
  onRemove: () => void;
  canRemove: boolean;
}

/** Operators that don't need a value input */
const NO_VALUE_OPS: OperatorType[] = [];

/** Operators that take a second value (range) */
const RANGE_OPS: OperatorType[] = ['between'];

/** Operators where value is a simple integer (X days/hours/minutes) */
const DURATION_OPS: OperatorType[] = [
  'within_x_days', 'within_x_hours', 'within_x_minutes',
  'after_x_days', 'after_x_hours', 'after_x_minutes',
  'on_nth_day',
];

/** Get placeholder text based on operator */
function getPlaceholder(op: OperatorType, dataType: DataType): string {
  if (DURATION_OPS.includes(op)) return 'Enter number';
  if (dataType === 'datetime') return 'Select date';
  if (dataType === 'int64') return 'Enter whole number';
  if (dataType === 'float64') return 'Enter decimal value';
  if (dataType === 'boolean') return 'true / false';
  if (dataType.startsWith('array_')) return 'Comma-separated values';
  return 'Enter text';
}

/** Get the input type for the value field */
function getInputType(op: OperatorType, dataType: DataType): string {
  if (DURATION_OPS.includes(op)) return 'number';
  if (dataType === 'int64' || dataType === 'float64') return 'number';
  if (dataType === 'datetime' && !DURATION_OPS.includes(op) && op !== 'between') return 'datetime-local';
  return 'text';
}

// Group properties by category
const GROUPED_PROPS = PROPERTIES.reduce<Record<string, typeof PROPERTIES>>((acc, p) => {
  (acc[p.category] ??= []).push(p);
  return acc;
}, {});

export function ConditionRow({ condition, onChange, onRemove, canRemove }: ConditionRowProps) {
  // Resolve the data type for the selected property
  const selectedProp = PROPERTIES.find((p) => p.key === condition.property);
  const dataType: DataType = selectedProp?.dataType ?? 'string';

  // Get allowed operators for this data type
  const allowedOps = getOperatorsForType(dataType);

  const needsValue = !NO_VALUE_OPS.includes(condition.operator);
  const isBetween = RANGE_OPS.includes(condition.operator);
  const inputType = getInputType(condition.operator, dataType);
  const placeholder = getPlaceholder(condition.operator, dataType);

  // When property changes, reset operator to first allowed for new type
  const handlePropertyChange = (newProp: string) => {
    const newType = PROPERTIES.find((p) => p.key === newProp)?.dataType ?? 'string';
    const newOps = getOperatorsForType(newType);
    const currentOpStillValid = newOps.some((op) => op.value === condition.operator);
    onChange({
      ...condition,
      property: newProp,
      operator: currentOpStillValid ? condition.operator : newOps[0]?.value ?? 'equal',
      value: '',
      valueTo: undefined,
    });
  };

  // Boolean special: render as select
  const isBooleanType = dataType === 'boolean';

  return (
    <div className="flex items-center gap-2 group">
      {/* Property selector */}
      <select
        value={condition.property}
        onChange={(e) => handlePropertyChange(e.target.value)}
        className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm min-w-[160px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
      >
        <option value="">Select property...</option>
        {Object.entries(GROUPED_PROPS).map(([cat, props]) => (
          <optgroup key={cat} label={cat}>
            {props.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </optgroup>
        ))}
      </select>

      {/* Operator selector — filtered by data type */}
      <select
        value={condition.operator}
        onChange={(e) => onChange({ ...condition, operator: e.target.value as OperatorType })}
        className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm min-w-[130px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
      >
        {allowedOps.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>

      {/* Value input — adapted by data type */}
      {needsValue && !isBooleanType && (
        <input
          type={inputType}
          value={condition.value}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          placeholder={placeholder}
          className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm min-w-[130px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
        />
      )}

      {/* Boolean: true/false dropdown */}
      {isBooleanType && (
        <select
          value={condition.value}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm min-w-[100px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
        >
          <option value="">Select...</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      )}

      {/* Second value for 'between' range */}
      {isBetween && (
        <>
          <span className="text-xs text-slate-400 font-medium">and</span>
          <input
            type={inputType}
            value={condition.valueTo ?? ''}
            onChange={(e) => onChange({ ...condition, valueTo: e.target.value })}
            placeholder={placeholder}
            className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm min-w-[130px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
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
