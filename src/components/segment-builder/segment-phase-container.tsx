import { useState, useCallback } from 'react';
import type { Segment, ConditionGroup, LogicOperator } from '../../types/segment-builder-types';
import { MOCK_SAVED_SEGMENTS } from '../../data/mock-data';
import { SegmentListing } from './segment-listing';
import { SegmentBuilder } from './segment-builder';

type View = 'listing' | 'builder';

interface SegmentPhaseContainerProps {
  /** Pre-loaded from template/playbook clone */
  initialGroups?: ConditionGroup[];
  initialGroupLogic?: LogicOperator;
  initialName?: string;
  onClearInitial?: () => void;
  onBack?: () => void;
}

export function SegmentPhaseContainer(props: SegmentPhaseContainerProps) {
  // Start in builder if there's preloaded data, otherwise show listing
  const [view, setView] = useState<View>(props.initialGroups ? 'builder' : 'listing');
  const [segments, setSegments] = useState<Segment[]>(MOCK_SAVED_SEGMENTS);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);

  const handleCreateNew = useCallback(() => {
    setEditingSegment(null);
    setView('builder');
  }, []);

  const handleEdit = useCallback((seg: Segment) => {
    setEditingSegment(seg);
    setView('builder');
  }, []);

  const handleDuplicate = useCallback((seg: Segment) => {
    const dup: Segment = {
      ...JSON.parse(JSON.stringify(seg)),
      id: `seg-dup-${Date.now()}`,
      name: `${seg.name} (Copy)`,
    };
    setSegments((prev) => [dup, ...prev]);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  }, []);

  /** Called by builder when user saves */
  const handleSave = useCallback((segment: Segment) => {
    setSegments((prev) => {
      const idx = prev.findIndex((s) => s.id === segment.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = segment;
        return next;
      }
      return [segment, ...prev];
    });
  }, []);

  const handleBackToList = useCallback(() => {
    setEditingSegment(null);
    setView('listing');
  }, []);

  if (view === 'listing') {
    return (
      <SegmentListing
        segments={segments}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onCreateNew={handleCreateNew}
      />
    );
  }

  return (
    <SegmentBuilder
      key={editingSegment?.id ?? props.initialGroups ? 'preloaded' : 'fresh'}
      initialGroups={editingSegment ? editingSegment.groups : props.initialGroups}
      initialGroupLogic={editingSegment ? editingSegment.groupLogic : props.initialGroupLogic}
      initialName={editingSegment ? editingSegment.name : props.initialName}
      editingId={editingSegment?.id}
      onClearInitial={props.onClearInitial}
      onBack={props.onBack ?? handleBackToList}
      onSave={handleSave}
    />
  );
}
