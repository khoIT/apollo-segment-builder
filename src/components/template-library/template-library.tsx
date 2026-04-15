import { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import type { SegmentTemplate, TemplateTag } from '../../types/segment-builder-types';
import { MOCK_TEMPLATES } from '../../data/mock-data';
import { TemplateCard } from './template-card';
import { ContributeModal } from './contribute-modal';
import type { ContributeData } from './contribute-modal';

interface TemplateLibraryProps {
  onUseTemplate: (template: SegmentTemplate) => void;
}

const ALL_TAGS: TemplateTag[] = ['Churn', 'Monetization', 'Engagement', 'Retention', 'Upsell'];

export function TemplateLibrary({ onUseTemplate }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<SegmentTemplate[]>(MOCK_TEMPLATES);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<TemplateTag | null>(null);
  const [showContribute, setShowContribute] = useState(false);

  const filtered = templates.filter((t) => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
      || t.description.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !activeTag || t.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  const handleContribute = (data: ContributeData) => {
    // Use the conditions the user defined in the modal
    const validConditions = data.conditions.filter((c) => c.property !== '');
    const newTemplate: SegmentTemplate = {
      id: `tpl-custom-${Date.now()}`,
      name: data.name,
      description: data.description,
      groups: [{
        id: `g-${Date.now()}`,
        negated: false,
        logic: data.logic,
        conditions: validConditions.length > 0
          ? validConditions
          : [{ id: `c-${Date.now()}`, property: '', operator: 'equals', value: '' }],
      }],
      groupLogic: 'AND',
      abTestResult: {
        ctrUplift: data.ctrUplift ? Number(data.ctrUplift) : undefined,
        conversionUplift: data.conversionUplift ? Number(data.conversionUplift) : undefined,
      },
      tags: data.tags,
      contributedBy: 'Your Studio',
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    setShowContribute(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Template Library</h1>
          <p className="text-sm text-slate-500 mt-1">Browse A/B-tested segment templates from the community</p>
        </div>
        <button
          onClick={() => setShowContribute(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Contribute
        </button>
      </div>

      {/* Search & filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-slate-400" />
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                activeTag === tag
                  ? 'bg-violet-100 text-violet-700 border-violet-300'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((template) => (
          <TemplateCard key={template.id} template={template} onUseTemplate={onUseTemplate} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">No templates match your filters.</div>
      )}

      {/* Contribute modal */}
      {showContribute && (
        <ContributeModal onClose={() => setShowContribute(false)} onSubmit={handleContribute} />
      )}
    </div>
  );
}
