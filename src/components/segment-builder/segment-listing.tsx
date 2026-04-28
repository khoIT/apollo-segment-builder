import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, Copy, Users, Filter, Layers } from 'lucide-react';
import type { Segment, SegmentType } from '../../types/segment-builder-types';
import { PROPERTIES, OPERATORS } from '../../data/mock-data';

/* ── Segment type badge config ── */
const TYPE_BADGE: Record<SegmentType, { icon: string; label: string; cls: string }> = {
  dynamic:  { icon: '⟳', label: 'Dynamic',  cls: 'bg-blue-100 text-blue-700' },
  static:   { icon: '❄', label: 'Static',   cls: 'bg-slate-100 text-slate-600' },
  realtime: { icon: '⚡', label: 'Realtime', cls: 'bg-emerald-100 text-emerald-700' },
};

interface SegmentListingProps {
  segments: Segment[];
  onEdit: (segment: Segment) => void;
  onDelete: (id: string) => void;
  onDuplicate: (segment: Segment) => void;
  onCreateNew: () => void;
}

function formatCondition(property: string, operator: string, value: string): string {
  const propLabel = PROPERTIES.find((p) => p.key === property)?.label ?? property;
  const opLabel = OPERATORS.find((o) => o.value === operator)?.label ?? operator;
  return value ? `${propLabel} ${opLabel} ${value}` : `${propLabel} ${opLabel}`;
}

function conditionCount(seg: Segment): number {
  return seg.groups.reduce((n, g) => n + g.conditions.filter((c) => c.property).length, 0);
}

export function SegmentListing({ segments, onEdit, onDelete, onDuplicate, onCreateNew }: SegmentListingProps) {
  const [search, setSearch] = useState('');

  const filtered = segments.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saved Segments</h1>
          <p className="text-sm text-slate-500 mt-1">{segments.length} segment{segments.length !== 1 ? 's' : ''} created</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-5 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          New Segment
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search segments..."
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
        />
      </div>

      {/* Segment table */}
      {filtered.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_110px_90px_80px] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <span>Segment</span>
            <span>Type</span>
            <span>Audience</span>
            <span>Conditions</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}
          {filtered.map((seg) => {
            const totalConds = conditionCount(seg);
            return (
              <div
                key={seg.id}
                className="grid grid-cols-[1fr_100px_110px_90px_80px] gap-4 px-5 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
              >
                {/* Name + condition preview */}
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">{seg.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {seg.groups.flatMap((g) => g.conditions.filter((c) => c.property)).slice(0, 3).map((cond, ci) => (
                      <span key={cond.id} className="inline-flex items-center gap-1">
                        {ci > 0 && (
                          <span className={`text-[9px] font-bold ${seg.groups[0]?.logic === 'AND' ? 'text-blue-500' : 'text-emerald-500'}`}>
                            {seg.groups[0]?.logic}
                          </span>
                        )}
                        <code className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {formatCondition(cond.property, cond.operator, cond.value)}
                        </code>
                      </span>
                    ))}
                    {totalConds > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">+{totalConds - 3} more</span>
                    )}
                  </div>
                </div>

                {/* Segment type badge */}
                <div className="flex items-center">
                  {(() => {
                    const badge = TYPE_BADGE[seg.segmentType ?? 'dynamic'];
                    return (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                        {badge.icon} {badge.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Audience */}
                <div className="flex items-center gap-1.5 text-sm">
                  <Users size={13} className="text-violet-500 shrink-0" />
                  <span className="font-medium text-slate-700">
                    {seg.estimatedAudience > 0 ? seg.estimatedAudience.toLocaleString() : '—'}
                  </span>
                </div>

                {/* Condition count badge */}
                <div className="flex items-center">
                  <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    <Filter size={10} />
                    {totalConds}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(seg)} className="p-1.5 rounded text-slate-400 hover:text-violet-600 hover:bg-violet-50 cursor-pointer" title="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => onDuplicate(seg)} className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer" title="Duplicate">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => onDelete(seg.id)} className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : segments.length > 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No segments match your search.</div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
          <Layers size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-1">No segments yet</p>
          <p className="text-xs text-slate-400 mb-4">Create your first segment to get started</p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            New Segment
          </button>
        </div>
      )}
    </div>
  );
}
