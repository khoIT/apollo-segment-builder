import { useState, useCallback } from 'react';
import type { Phase, ConditionGroup, LogicOperator, SegmentTemplate, Playbook, PlaybookRun } from './types/segment-builder-types';
import { SidebarNavigation } from './components/layout/sidebar-navigation';
import { SegmentBuilder } from './components/segment-builder/segment-builder';
import { TemplateLibrary } from './components/template-library/template-library';
import { PlaybookAutomation } from './components/playbook-automation/playbook-automation';

/**
 * State passed to SegmentBuilder when cloning from a template or playbook.
 * Cleared after the builder mounts with it.
 */
interface BuilderPreload {
  groups: ConditionGroup[];
  groupLogic: LogicOperator;
  name: string;
  /** Phase to return to when clicking Back */
  returnTo: Phase;
}

export default function App() {
  const [activePhase, setActivePhase] = useState<Phase>('builder');
  const [builderPreload, setBuilderPreload] = useState<BuilderPreload | null>(null);

  /** Phase 2 → Phase 1: clone template into builder */
  const handleUseTemplate = useCallback((template: SegmentTemplate) => {
    // Deep-clone groups so edits don't mutate the template
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

  /** Phase 3 dashboard → Phase 1: tune a running playbook's segment */
  const handleTuneSegment = useCallback((run: PlaybookRun) => {
    // Resolve the playbook from the run, fall back to empty
    const playbook = undefined; // Would look up in a real app; here we just open builder
    void playbook;
    setBuilderPreload(null);
    setActivePhase('builder');
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNavigation activePhase={activePhase} onPhaseChange={setActivePhase} />

      <main className="flex-1 px-8 py-8 overflow-y-auto">
        {activePhase === 'builder' && (
          <SegmentBuilder
            key={builderPreload ? 'preloaded' : 'fresh'}
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
