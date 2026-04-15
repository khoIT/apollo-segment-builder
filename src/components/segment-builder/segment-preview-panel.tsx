import { Eye, Users } from 'lucide-react';
import type { ConditionGroup, LogicOperator, OperatorType } from '../../types/segment-builder-types';
import { PROPERTIES, OPERATORS } from '../../data/mock-data';

interface SegmentPreviewPanelProps {
  groups: ConditionGroup[];
  groupLogic: LogicOperator;
  audienceEstimate: number;
}

function propLabel(key: string): string {
  return PROPERTIES.find((p) => p.key === key)?.label ?? key;
}

function propCategory(key: string): string {
  return PROPERTIES.find((p) => p.key === key)?.category ?? 'Unknown';
}

const OPERATOR_TEXT: Record<OperatorType, string> = {
  equal: 'equals to',
  not_equal: 'not equals to',
  contains: 'contains',
  less_than: 'less than',
  greater_than: 'greater than',
  less_equal: 'less or equal to',
  greater_equal: 'greater or equal to',
  between: 'between',
  before: 'before',
  after: 'after',
  within_x_days: 'within X days',
  within_x_hours: 'within X hours',
  within_x_minutes: 'within X minutes',
  after_x_days: 'after X days',
  after_x_hours: 'after X hours',
  after_x_minutes: 'after X minutes',
  in: 'is one of',
  not_in: 'is not one of',
  on_nth_day: 'on nth day',
};

function operatorText(op: OperatorType): string {
  return OPERATOR_TEXT[op] ?? OPERATORS.find((o) => o.value === op)?.label ?? op;
}

function hasValidConditions(groups: ConditionGroup[]): boolean {
  return groups.some((g) => g.conditions.some((c) => c.property !== ''));
}

/** Compact pill badge for the side panel */
function Pill({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'value' | 'category' }) {
  const styles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    value: 'bg-violet-50 text-violet-700 border-violet-200 font-semibold',
    category: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold',
  };
  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] border ${styles[variant]}`}>
      {children}
    </span>
  );
}

function LogicDivider({ logic }: { logic: LogicOperator }) {
  const color = logic === 'AND' ? 'text-blue-600' : 'text-emerald-600';
  return (
    <div className="flex items-center gap-2 my-2">
      <div className="h-px flex-1 border-t border-dashed border-slate-200" />
      <span className={`text-[10px] font-bold ${color}`}>{logic}</span>
      <div className="h-px flex-1 border-t border-dashed border-slate-200" />
    </div>
  );
}

function GroupPreview({ group }: { group: ConditionGroup }) {
  const validConditions = group.conditions.filter((c) => c.property !== '');
  if (validConditions.length === 0) return null;

  const category = propCategory(validConditions[0].property);

  return (
    <div className={`${group.negated ? 'pl-3 border-l-2 border-orange-400' : ''}`}>
      {group.negated && (
        <span className="text-[10px] font-bold text-orange-600 mb-1 block">EXCLUDES where:</span>
      )}
      {!group.negated && (
        <p className="text-[11px] text-slate-500 mb-1.5 leading-relaxed">
          Applies when the source is <Pill variant="category">{category}</Pill> and conditions are met:
        </p>
      )}

      <div className="space-y-1.5">
        {validConditions.map((cond, ci) => (
          <div key={cond.id} className="flex flex-wrap items-center gap-1">
            {ci > 0 && (
              <span className={`text-[10px] font-bold ${group.logic === 'AND' ? 'text-blue-600' : 'text-emerald-600'}`}>
                {group.logic}
              </span>
            )}
            <Pill>{propLabel(cond.property)}</Pill>
            <Pill>{operatorText(cond.operator as OperatorType)}</Pill>
            {!['is_null', 'is_not_null'].includes(cond.operator) && cond.value && (
              <Pill variant="value">{cond.value}</Pill>
            )}
            {cond.operator === 'between' && cond.valueTo && (
              <>
                <span className="text-[10px] text-slate-400">and</span>
                <Pill variant="value">{cond.valueTo}</Pill>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SegmentPreviewPanel({ groups, groupLogic, audienceEstimate }: SegmentPreviewPanelProps) {
  const hasConditions = hasValidConditions(groups);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <Eye size={14} className="text-slate-500" />
        <h3 className="text-xs font-bold text-slate-900 italic">Preview</h3>
      </div>

      {/* Audience estimate — compact */}
      <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-violet-50/50 to-indigo-50/50">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-violet-500" />
          <span className="text-xs text-slate-500">Estimated Audience</span>
        </div>
        <div className="text-xl font-bold text-slate-900 mt-0.5">
          {audienceEstimate > 0 ? audienceEstimate.toLocaleString() : '—'}
        </div>
      </div>

      {/* Condition preview */}
      <div className="px-4 py-4">
        {hasConditions ? (
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
        ) : (
          <div className="text-center py-6">
            <div className="text-slate-300 mb-2">
              <Eye size={24} className="mx-auto" />
            </div>
            <p className="text-xs text-slate-400">Add conditions on the left to see a preview here</p>
          </div>
        )}
      </div>
    </div>
  );
}
