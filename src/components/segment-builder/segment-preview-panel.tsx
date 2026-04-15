import { Eye } from 'lucide-react';
import type { ConditionGroup, LogicOperator, OperatorType } from '../../types/segment-builder-types';
import { PROPERTIES, OPERATORS } from '../../data/mock-data';

interface SegmentPreviewPanelProps {
  groups: ConditionGroup[];
  groupLogic: LogicOperator;
}

/** Map property key → display label */
function propLabel(key: string): string {
  return PROPERTIES.find((p) => p.key === key)?.label ?? key;
}

/** Map property key → category label */
function propCategory(key: string): string {
  return PROPERTIES.find((p) => p.key === key)?.category ?? 'Unknown';
}

/** Readable operator text for the preview sentence */
const OPERATOR_TEXT: Record<OperatorType, string> = {
  equals: 'equals to',
  not_equals: 'not equals to',
  greater_than: 'greater than',
  less_than: 'less than',
  between: 'between',
  contains: 'contains',
  is_null: 'is empty',
  is_not_null: 'is not empty',
  in: 'is one of',
  not_in: 'is not one of',
};

function operatorText(op: OperatorType): string {
  return OPERATOR_TEXT[op] ?? OPERATORS.find((o) => o.value === op)?.label ?? op;
}

/** Check if there's at least one valid (filled-in) condition across all groups */
function hasValidConditions(groups: ConditionGroup[]): boolean {
  return groups.some((g) => g.conditions.some((c) => c.property !== ''));
}

/** Pill-styled badge for property/operator/value tokens */
function Pill({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'value' | 'category' }) {
  const styles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    value: 'bg-violet-50 text-violet-700 border-violet-200 font-semibold',
    category: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-[13px] border ${styles[variant]}`}>
      {children}
    </span>
  );
}

/** Logic operator divider shown between groups */
function LogicDivider({ logic }: { logic: LogicOperator }) {
  const color = logic === 'AND'
    ? 'text-blue-600 border-blue-200'
    : 'text-emerald-600 border-emerald-200';
  return (
    <div className={`flex items-center gap-3 my-2`}>
      <div className="h-px flex-1 border-t border-dashed border-slate-200" />
      <span className={`text-xs font-bold ${color}`}>{logic}</span>
      <div className="h-px flex-1 border-t border-dashed border-slate-200" />
    </div>
  );
}

/** Renders a single condition group in natural language */
function GroupPreview({ group }: { group: ConditionGroup }) {
  const validConditions = group.conditions.filter((c) => c.property !== '');
  if (validConditions.length === 0) return null;

  // Group conditions by category for readability
  const category = propCategory(validConditions[0].property);

  return (
    <div className={`${group.negated ? 'pl-4 border-l-[3px] border-orange-400' : ''}`}>
      {group.negated && (
        <span className="text-xs font-bold text-orange-600 mb-1 block">
          EXCLUDES players where:
        </span>
      )}
      {!group.negated && (
        <span className="text-sm text-slate-500 mb-2 block">
          Applies when the data source is <Pill variant="category">{category}</Pill> and the following conditions are met:
        </span>
      )}

      <div className="space-y-2 mt-2">
        {validConditions.map((cond, ci) => (
          <div key={cond.id}>
            {ci > 0 && (
              <span className={`text-xs font-bold mr-2 ${group.logic === 'AND' ? 'text-blue-600' : 'text-emerald-600'}`}>
                {group.logic}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 flex-wrap">
              <Pill>{propLabel(cond.property)}</Pill>
              <Pill>{operatorText(cond.operator as OperatorType)}</Pill>
              {!['is_null', 'is_not_null'].includes(cond.operator) && cond.value && (
                <Pill variant="value">{cond.value}</Pill>
              )}
              {cond.operator === 'between' && cond.valueTo && (
                <>
                  <span className="text-xs text-slate-400">and</span>
                  <Pill variant="value">{cond.valueTo}</Pill>
                </>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SegmentPreviewPanel({ groups, groupLogic }: SegmentPreviewPanelProps) {
  if (!hasValidConditions(groups)) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Eye size={16} className="text-slate-500" />
        <h3 className="text-sm font-bold text-slate-900 italic">Preview</h3>
      </div>

      <div className="space-y-1">
        {groups.map((group, gi) => {
          const hasValid = group.conditions.some((c) => c.property !== '');
          if (!hasValid) return null;
          return (
            <div key={group.id}>
              {gi > 0 && <LogicDivider logic={groupLogic} />}
              <GroupPreview group={group} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
