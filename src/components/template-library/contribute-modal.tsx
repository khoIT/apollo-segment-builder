import { useState } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import type { TemplateTag, Condition, OperatorType, LogicOperator } from '../../types/segment-builder-types';
import { PROPERTIES, OPERATORS } from '../../data/mock-data';

interface ContributeModalProps {
  onClose: () => void;
  onSubmit: (data: ContributeData) => void;
}

export interface ContributeData {
  name: string;
  description: string;
  tags: TemplateTag[];
  ctrUplift: string;
  conversionUplift: string;
  conditions: Condition[];
  logic: LogicOperator;
}

const ALL_TAGS: TemplateTag[] = ['Churn', 'Monetization', 'Engagement', 'Retention', 'Upsell'];

let idCounter = 0;
function nextId() { return `contrib-${Date.now()}-${++idCounter}`; }

function emptyCondition(): Condition {
  return { id: nextId(), property: '', operator: 'equals', value: '' };
}

/** Grouped property options for the select dropdown */
const GROUPED_PROPS = PROPERTIES.reduce<Record<string, typeof PROPERTIES>>((acc, p) => {
  (acc[p.category] ??= []).push(p);
  return acc;
}, {});

export function ContributeModal({ onClose, onSubmit }: ContributeModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<TemplateTag[]>([]);
  const [ctrUplift, setCtrUplift] = useState('');
  const [conversionUplift, setConversionUplift] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([emptyCondition()]);
  const [logic, setLogic] = useState<LogicOperator>('AND');

  const toggleTag = (tag: TemplateTag) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const updateCondition = (idx: number, updated: Condition) => {
    const next = [...conditions];
    next[idx] = updated;
    setConditions(next);
  };

  const removeCondition = (idx: number) => {
    if (conditions.length <= 1) return;
    setConditions(conditions.filter((_, i) => i !== idx));
  };

  const hasValidConditions = conditions.some((c) => c.property !== '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !hasValidConditions) return;
    onSubmit({ name, description, tags, ctrUplift, conversionUplift, conditions, logic });
  };

  const logicColor = logic === 'AND' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Contribute Template</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 cursor-pointer">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Template Name *</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekend Warrior Boost"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the use case and when to use this segment..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 resize-none"
            />
          </div>

          {/* Segment conditions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">Segment Conditions *</label>
              <button
                type="button"
                onClick={() => setLogic(logic === 'AND' ? 'OR' : 'AND')}
                className={`px-2.5 py-0.5 rounded text-xs font-bold border cursor-pointer ${logicColor}`}
              >
                {logic}
              </button>
            </div>
            <div className="space-y-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
              {conditions.map((cond, idx) => (
                <div key={cond.id}>
                  {idx > 0 && (
                    <div className="text-center py-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${logicColor}`}>{logic}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <select
                      value={cond.property} onChange={(e) => updateCondition(idx, { ...cond, property: e.target.value })}
                      className="h-8 px-2 rounded border border-slate-200 bg-white text-xs flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    >
                      <option value="">Property...</option>
                      {Object.entries(GROUPED_PROPS).map(([cat, props]) => (
                        <optgroup key={cat} label={cat}>
                          {props.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <select
                      value={cond.operator} onChange={(e) => updateCondition(idx, { ...cond, operator: e.target.value as OperatorType })}
                      className="h-8 px-2 rounded border border-slate-200 bg-white text-xs w-20 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    >
                      {OPERATORS.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                    {!['is_null', 'is_not_null'].includes(cond.operator) && (
                      <input
                        type="text" value={cond.value} onChange={(e) => updateCondition(idx, { ...cond, value: e.target.value })}
                        placeholder="Value"
                        className="h-8 px-2 rounded border border-slate-200 bg-white text-xs w-24 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                      />
                    )}
                    <button
                      type="button" onClick={() => removeCondition(idx)}
                      disabled={conditions.length <= 1}
                      className="p-1 rounded text-slate-400 hover:text-red-500 disabled:opacity-20 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setConditions([...conditions, emptyCondition()])}
                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium mt-1 cursor-pointer"
              >
                <Plus size={12} /> Add condition
              </button>
            </div>
            {!hasValidConditions && (
              <p className="text-xs text-amber-600 mt-1">Select at least one property to define the segment.</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    tags.includes(tag) ? 'bg-violet-100 text-violet-700 border-violet-300' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* A/B Test Results */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">A/B Test Results</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500">CTR Uplift %</label>
                <input type="number" value={ctrUplift} onChange={(e) => setCtrUplift(e.target.value)} placeholder="e.g. 15"
                  className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Conversion Uplift %</label>
                <input type="number" value={conversionUplift} onChange={(e) => setConversionUplift(e.target.value)} placeholder="e.g. 8"
                  className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!name.trim() || !hasValidConditions}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Upload size={16} /> Submit Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
