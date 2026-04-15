import { useState } from 'react';
import type { Playbook, PlaybookRun } from '../../types/segment-builder-types';
import { MOCK_PLAYBOOKS, MOCK_PLAYBOOK_RUNS } from '../../data/mock-data';
import { PlaybookCard } from './playbook-card';
import { PlaybookRunner } from './playbook-runner';
import { PlaybookDashboard } from './playbook-dashboard';

interface PlaybookAutomationProps {
  onCustomizeSegment: (playbook: Playbook) => void;
  onTuneSegment: (run: PlaybookRun) => void;
}

export function PlaybookAutomation({ onCustomizeSegment, onTuneSegment }: PlaybookAutomationProps) {
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [runs, setRuns] = useState<PlaybookRun[]>(MOCK_PLAYBOOK_RUNS);

  const handleRun = (playbookId: string, productCode: string) => {
    const newRun: PlaybookRun = {
      id: `run-${Date.now()}`,
      playbookId,
      productCode,
      status: 'Scheduled',
      startedAt: new Date().toISOString(),
      metricsActual: { ctrUplift: 0, conversionUplift: 0 },
      metricsBenchmark: MOCK_PLAYBOOKS.find((p) => p.id === playbookId)?.expectedKpi ?? {},
      audienceReached: 0,
    };
    setRuns((prev) => [newRun, ...prev]);
  };

  return (
    <div className="space-y-6">
      {!selectedPlaybook ? (
        <>
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Playbook Automation</h1>
            <p className="text-sm text-slate-500 mt-1">Run proven Template + Action playbooks on your game with minimal config</p>
          </div>

          {/* Playbook selection grid */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Available Playbooks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_PLAYBOOKS.map((pb) => (
                <PlaybookCard key={pb.id} playbook={pb} onSelect={setSelectedPlaybook} />
              ))}
            </div>
          </div>

          {/* Run history dashboard */}
          <PlaybookDashboard runs={runs} onTuneSegment={onTuneSegment} />
        </>
      ) : (
        <PlaybookRunner
          playbook={selectedPlaybook}
          onBack={() => setSelectedPlaybook(null)}
          onCustomizeSegment={onCustomizeSegment}
          onRun={handleRun}
        />
      )}
    </div>
  );
}
