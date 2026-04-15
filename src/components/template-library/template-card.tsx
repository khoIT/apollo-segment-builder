import { ArrowRight, TrendingUp, Copy } from 'lucide-react';
import type { SegmentTemplate, TemplateTag } from '../../types/segment-builder-types';
import { PROPERTIES, OPERATORS } from '../../data/mock-data';

interface TemplateCardProps {
  template: SegmentTemplate;
  onUseTemplate: (template: SegmentTemplate) => void;
}

const TAG_COLORS: Record<TemplateTag, string> = {
  Churn: 'bg-red-50 text-red-600 border-red-200',
  Monetization: 'bg-amber-50 text-amber-700 border-amber-200',
  Engagement: 'bg-blue-50 text-blue-600 border-blue-200',
  Retention: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Upsell: 'bg-purple-50 text-purple-600 border-purple-200',
};

/** Render a condition as a readable string */
function formatCondition(property: string, operator: string, value: string): string {
  const propLabel = PROPERTIES.find((p) => p.key === property)?.label ?? property;
  const opLabel = OPERATORS.find((o) => o.value === operator)?.label ?? operator;
  return `${propLabel} ${opLabel} ${value}`;
}

export function TemplateCard({ template, onUseTemplate }: TemplateCardProps) {
  const { name, description, groups, abTestResult, tags, contributedBy } = template;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-slate-300 transition-all group">
      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.map((tag) => (
          <span key={tag} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TAG_COLORS[tag]}`}>
            {tag}
          </span>
        ))}
      </div>

      {/* Title & description */}
      <h3 className="text-base font-bold text-slate-900 mb-1">{name}</h3>
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{description}</p>

      {/* Condition preview */}
      <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Segment Logic</div>
        {groups.map((group, gi) => (
          <div key={group.id}>
            {gi > 0 && (
              <div className="text-[10px] font-bold text-blue-600 my-1 px-2">{template.groupLogic}</div>
            )}
            <div className={`text-xs space-y-1 ${group.negated ? 'pl-3 border-l-2 border-orange-300' : ''}`}>
              {group.negated && (
                <span className="text-[10px] font-bold text-orange-600">NOT</span>
              )}
              {group.conditions.map((cond, ci) => (
                <div key={cond.id} className="flex items-center gap-1.5">
                  {ci > 0 && (
                    <span className={`text-[10px] font-bold ${group.logic === 'AND' ? 'text-blue-600' : 'text-emerald-600'}`}>
                      {group.logic}
                    </span>
                  )}
                  <code className="text-xs text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-100">
                    {formatCondition(cond.property, cond.operator, cond.value)}
                  </code>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* A/B test results */}
      <div className="flex items-center gap-3 mb-4">
        {abTestResult.ctrUplift != null && (
          <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
            <TrendingUp size={14} />
            CTR +{abTestResult.ctrUplift}%
          </div>
        )}
        {abTestResult.conversionUplift != null && (
          <div className="flex items-center gap-1 text-sm font-semibold text-violet-600">
            <TrendingUp size={14} />
            Conv +{abTestResult.conversionUplift}%
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        {contributedBy && (
          <span className="text-[11px] text-slate-400">by {contributedBy}</span>
        )}
        {!contributedBy && <span />}
        <button
          onClick={() => onUseTemplate(template)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 transition-colors cursor-pointer"
        >
          <Copy size={12} />
          Use Template
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
