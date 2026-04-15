/* ── Segment Builder Types ── */

export type OperatorType =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'between'
  | 'contains'
  | 'is_null'
  | 'is_not_null'
  | 'in'
  | 'not_in';

export type LogicOperator = 'AND' | 'OR';

export type PropertyCategory = 'Login' | 'Payment' | 'Item' | 'Profile';

export interface PropertyDef {
  key: string;
  label: string;
  category: PropertyCategory;
  type: 'string' | 'number' | 'date' | 'multi_value';
}

export interface Condition {
  id: string;
  property: string;
  operator: OperatorType;
  value: string;
  valueTo?: string; // for 'between' operator
}

export interface ConditionGroup {
  id: string;
  negated: boolean; // NOT block-level negation
  logic: LogicOperator;
  conditions: Condition[];
}

export interface Segment {
  id: string;
  name: string;
  groups: ConditionGroup[];
  groupLogic: LogicOperator;
  estimatedAudience: number;
}

/* ── Template Types ── */

export type TemplateTag =
  | 'Churn'
  | 'Monetization'
  | 'Engagement'
  | 'Retention'
  | 'Upsell';

export interface ABTestResult {
  ctrUplift?: number;
  conversionUplift?: number;
}

export interface SegmentTemplate {
  id: string;
  name: string;
  description: string;
  groups: ConditionGroup[];
  groupLogic: LogicOperator;
  abTestResult: ABTestResult;
  tags: TemplateTag[];
  contributedBy?: string;
}

/* ── Playbook Types ── */

export type ActionType = 'Push' | 'In-app Message' | 'SMS';
export type PlaybookStatus = 'Scheduled' | 'Active' | 'Completed';

export interface PlaybookAction {
  type: ActionType;
  title: string;
  body: string;
}

export interface PlaybookRun {
  id: string;
  playbookId: string;
  productCode: string;
  status: PlaybookStatus;
  startedAt: string;
  metricsActual: ABTestResult;
  metricsBenchmark: ABTestResult;
  audienceReached: number;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  template: SegmentTemplate;
  action: PlaybookAction;
  expectedKpi: ABTestResult;
}

/* ── Navigation ── */

export type Phase = 'builder' | 'templates' | 'playbooks';
