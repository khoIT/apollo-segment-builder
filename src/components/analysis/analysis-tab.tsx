/**
 * Analysis tab — root component.
 *
 * Rendering strategy (hybrid config pattern):
 *   Simple models  (events / distribution / interval):
 *     → inline config bar inside expanded card content, card manages own state
 *   Complex models (retention / funnel / rfm):
 *     → "⚙ Configure" button in CardShell header opens right-side drawer
 *     → drawer state + applied configs owned here at tab level
 */
import { useState } from 'react';
import { CardShell, ANALYSIS_CARDS } from './analysis-model-cards';
import { ConfigDrawer, RetentionDrawerForm, FunnelDrawerForm, RfmDrawerForm } from './analysis-drawer-config-forms';
import {
  DEFAULT_COMPLEX_CONFIGS, getConfigSummary,
  type AllComplexConfigs, type RetentionConfig, type FunnelConfig, type RfmConfig,
} from './analysis-config-types';

type ComplexModelId = 'retention' | 'funnel' | 'rfm';

const DRAWER_TITLES: Record<ComplexModelId, string> = {
  retention: 'Configure Retention',
  funnel:    'Configure Funnel',
  rfm:       'Configure RFM',
};

interface AnalysisTabProps {
  onUseAsSegmentInput: (label: string) => void;
}

export function AnalysisTab({ onUseAsSegmentInput }: AnalysisTabProps) {
  const [expandedId,    setExpandedId]    = useState<string | null>('events');
  const [drawerOpen,    setDrawerOpen]    = useState<ComplexModelId | null>(null);
  const [complexConfigs, setComplexConfigs] = useState<AllComplexConfigs>(DEFAULT_COMPLEX_CONFIGS);
  const [toast,         setToast]         = useState<string | null>(null);

  function handleUseAsSegment(label: string) {
    onUseAsSegmentInput(label);
    setToast(label);
    setTimeout(() => setToast(null), 3000);
  }

  function applyConfig(modelId: ComplexModelId, config: RetentionConfig | FunnelConfig | RfmConfig) {
    setComplexConfigs((prev) => ({ ...prev, [modelId]: config }));
    setDrawerOpen(null);
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Analysis</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore user behavior models before building a segment. Simple models have inline config;
          complex models use the <strong>⚙ Configure</strong> button.
        </p>
      </div>

      {/* Model card grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {ANALYSIS_CARDS.map(({ id, title, icon, Component, configType }) => {
          const isExpanded  = expandedId === id;
          const isComplex   = configType === 'drawer';
          const complexId   = id as ComplexModelId;

          return (
            <CardShell
              key={id}
              title={title}
              icon={icon}
              expanded={isExpanded}
              onToggle={() => setExpandedId(isExpanded ? null : id)}
              onConfigure={isComplex ? () => setDrawerOpen(complexId) : undefined}
              configSummary={isComplex ? getConfigSummary(complexId, complexConfigs) : undefined}
            >
              <Component onUseAsSegment={handleUseAsSegment} />
            </CardShell>
          );
        })}
      </div>

      {/* Config drawer for complex models */}
      <ConfigDrawer
        title={drawerOpen ? DRAWER_TITLES[drawerOpen] : ''}
        open={drawerOpen !== null}
        onClose={() => setDrawerOpen(null)}
      >
        {drawerOpen === 'retention' && (
          <RetentionDrawerForm
            config={complexConfigs.retention}
            onApply={(c) => applyConfig('retention', c)}
          />
        )}
        {drawerOpen === 'funnel' && (
          <FunnelDrawerForm
            config={complexConfigs.funnel}
            onApply={(c) => applyConfig('funnel', c)}
          />
        )}
        {drawerOpen === 'rfm' && (
          <RfmDrawerForm
            config={complexConfigs.rfm}
            onApply={(c) => applyConfig('rfm', c)}
          />
        )}
      </ConfigDrawer>

      {/* Segment-input success toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-xl z-50 flex items-center gap-2">
          <span className="text-emerald-400">✓</span>
          <span><strong>{toast}</strong> applied — switching to Segment Builder</span>
        </div>
      )}
    </div>
  );
}
