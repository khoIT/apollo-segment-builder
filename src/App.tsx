import { useState, useCallback } from 'react';
import type { Phase, ConditionGroup, LogicOperator, SegmentTemplate, Playbook, PlaybookRun } from './types/segment-builder-types';
import { SidebarNavigation } from './components/layout/sidebar-navigation';
import { SegmentPhaseContainer } from './components/segment-builder/segment-phase-container';
import { TemplateLibrary } from './components/template-library/template-library';
import { PlaybookAutomation } from './components/playbook-automation/playbook-automation';

/** State passed when cloning from a template or playbook into builder */
interface BuilderPreload {
  groups: ConditionGroup[];
  groupLogic: LogicOperator;
  name: string;
  returnTo: Phase;
}

export default function App() {
  const [activePhase, setActivePhase] = useState<Phase>('builder');
  const [builderPreload, setBuilderPreload] = useState<BuilderPreload | null>(null);

  /** Phase 2 → Phase 1: clone template into builder */
  const handleUseTemplate = useCallback((template: SegmentTemplate) => {
    const cloned: ConditionGroup[] = JSON.parse(JSON.stringify(template.groups));
    setBuilderPreload({ groups: cloned, groupLogic: template.groupLogic, name: `${template.name} (Copy)`, returnTo: 'templates' });
    setActivePhase('builder');
  }, []);

  /** Phase 3 → Phase 1: customize playbook segment */
  const handleCustomizeSegment = useCallback((playbook: Playbook) => {
    const cloned: ConditionGroup[] = JSON.parse(JSON.stringify(playbook.template.groups));
    setBuilderPreload({ groups: cloned, groupLogic: playbook.template.groupLogic, name: `${playbook.name} — Custom`, returnTo: 'playbooks' });
    setActivePhase('builder');
  }, []);

  /** Phase 3 dashboard → Phase 1: tune segment */
  const handleTuneSegment = useCallback((_run: PlaybookRun) => {
    setBuilderPreload(null);
    setActivePhase('builder');
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNavigation activePhase={activePhase} onPhaseChange={setActivePhase} />

      <main className="flex-1 px-8 py-8 overflow-y-auto">
        {activePhase === 'builder' && (
          <SegmentPhaseContainer
            key={builderPreload ? 'preloaded' : 'listing'}
            initialGroups={builderPreload?.groups}
            initialGroupLogic={builderPreload?.groupLogic}
            initialName={builderPreload?.name}
            onClearInitial={() => setBuilderPreload(null)}
            onBack={builderPreload ? () => {
              const returnTo = builderPreload.returnTo;
              setBuilderPreload(null);
              setActivePhase(returnTo);
            } : undefined}
          />
        )}

        {activePhase === 'templates' && (
          <TemplateLibrary onUseTemplate={handleUseTemplate} />
        )}

        {activePhase === 'playbooks' && (
          <PlaybookAutomation
            onCustomizeSegment={handleCustomizeSegment}
            onTuneSegment={handleTuneSegment}
          />
        )}
      </main>
    </div>
  );
}
