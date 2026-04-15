import { Pencil, Trash2, Users } from 'lucide-react';
import type { Segment } from '../../types/segment-builder-types';
import { PROPERTIES, OPERATORS } from '../../data/mock-data';

interface SavedSegmentsPanelProps {
  segments: Segment[];
  onLoad: (segment: Segment) => void;
  onDelete: (id: string) => void;
}

function formatCondition(property: string, operator: string, value: string): string {
  const propLabel = PROPERTIES.find((p) => p.key === property)?.label ?? property;
  const opLabel = OPERATORS.find((o) => o.value === operator)?.label ?? operator;
  return `${propLabel} ${opLabel} ${value}`;
}

export function SavedSegmentsPanel({ segments, onLoad, onDelete }: SavedSegmentsPanelProps) {
  if (segments.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <h3 className="text-sm font-bold text-slate-900 mb-3">
        Saved Segments ({segments.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {segments.map((seg) => (
          <div key={seg.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-all group">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-900 truncate">{seg.name}</h4>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onLoad(seg)}
                  className="p-1 rounded text-slate-400 hover:text-violet-600 hover:bg-violet-50 cursor-pointer"
                  title="Edit segment"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => onDelete(seg.id)}
                  className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                  title="Delete segment"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Audience count */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
              <Users size={12} />
              <span className="font-medium text-slate-700">{seg.estimatedAudience.toLocaleString()}</span>
              players
            </div>

            {/* Condition preview */}
            <div className="space-y-0.5">
              {seg.groups.map((group) =>
                group.conditions.slice(0, 3).map((cond, ci) => (
                  <div key={cond.id} className="flex items-center gap-1">
                    {ci > 0 && (
                      <span className={`text-[9px] font-bold ${group.logic === 'AND' ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {group.logic}
                      </span>
                    )}
                    <code className="text-[11px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded truncate">
                      {formatCondition(cond.property, cond.operator, cond.value)}
                    </code>
                  </div>
                ))
              )}
              {seg.groups.reduce((n, g) => n + g.conditions.length, 0) > 3 && (
                <span className="text-[10px] text-slate-400">+ more conditions...</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
