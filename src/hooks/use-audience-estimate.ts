import { useState, useEffect } from 'react';
import type { ConditionGroup } from '../types/segment-builder-types';

/**
 * Generates a pseudo-random audience estimate (10,000–500,000)
 * based on condition group state. Re-calculates on any condition change.
 */
export function useAudienceEstimate(groups: ConditionGroup[]): number {
  const [estimate, setEstimate] = useState(0);

  useEffect(() => {
    // Build a fingerprint from the current conditions to seed the estimate
    const fingerprint = JSON.stringify(
      groups.map((g) => ({
        logic: g.logic,
        negated: g.negated,
        conditions: g.conditions.map((c) => `${c.property}|${c.operator}|${c.value}`),
      }))
    );

    // Simple hash-based random from fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      hash = (hash << 5) - hash + fingerprint.charCodeAt(i);
      hash |= 0;
    }

    const hasConditions = groups.some((g) => g.conditions.length > 0);
    if (!hasConditions) {
      setEstimate(0);
      return;
    }

    // Map hash to range 10,000–500,000
    const normalized = Math.abs(hash % 490001) + 10000;
    setEstimate(normalized);
  }, [groups]);

  return estimate;
}
