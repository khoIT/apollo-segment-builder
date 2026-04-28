/* ── Segment Builder Types ── */

/** Apollo Platform data types (from Journey - Misc spec) */
export type DataType =
  | 'string'
  | 'int64'
  | 'float64'
  | 'datetime'
  | 'boolean'
  | 'array_int64'
  | 'array_float64'
  | 'array_string'
  | 'array_object'
  | 'array_datetime';

/** Operators aligned with Apollo Platform spec */
export type OperatorType =
  // string
  | 'equal'
  | 'not_equal'
  | 'contains'
  // numeric (int64 / float64)
  | 'less_than'
  | 'greater_than'
  | 'less_equal'
  | 'greater_equal'
  | 'between'
  // datetime
  | 'before'
  | 'after'
  | 'within_x_days'
  | 'within_x_hours'
  | 'within_x_minutes'
  | 'after_x_days'
  | 'after_x_hours'
  | 'after_x_minutes'
  // array
  | 'in'
  | 'not_in'
  // array_datetime
  | 'on_nth_day';

export type LogicOperator = 'AND' | 'OR';

export type PropertyCategory = 'Login' | 'Payment' | 'Item' | 'Profile';

export interface PropertyDef {
  key: string;
  label: string;
  category: PropertyCategory;
  dataType: DataType;
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

/** How the segment audience is evaluated */
export type SegmentType = 'dynamic' | 'static' | 'realtime';

export interface Segment {
  id: string;
  name: string;
  /** Default: 'dynamic' when not set */
  segmentType: SegmentType;
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

export type Phase = 'builder' | 'templates' | 'playbooks' | 'analysis' | 'campaign-stats' | 'journeys';
