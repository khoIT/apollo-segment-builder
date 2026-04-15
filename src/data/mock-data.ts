import type {
  PropertyDef,
  DataType,
  SegmentTemplate,
  Playbook,
  PlaybookRun,
  OperatorType,
} from '../types/segment-builder-types';

/* ── Property Definitions (Apollo Platform data types) ── */

export const PROPERTIES: PropertyDef[] = [
  // Login
  { key: 'last_login', label: 'Last Login', category: 'Login', dataType: 'datetime' },
  { key: 'register_time', label: 'Register Time', category: 'Login', dataType: 'datetime' },
  { key: 'login_channel', label: 'Login Channel', category: 'Login', dataType: 'string' },
  { key: 'country_code', label: 'Country Code', category: 'Login', dataType: 'string' },
  // Payment
  { key: 'total_payment', label: 'Total Payment', category: 'Payment', dataType: 'float64' },
  { key: 'total_trans', label: 'Total Transactions', category: 'Payment', dataType: 'int64' },
  { key: 'last_purchase_time', label: 'Last Purchase Time', category: 'Payment', dataType: 'datetime' },
  { key: 'first_purchase_time', label: 'First Purchase Time', category: 'Payment', dataType: 'datetime' },
  { key: 'payment_d30', label: 'Payment (30 days)', category: 'Payment', dataType: 'float64' },
  { key: 'payment_d90', label: 'Payment (90 days)', category: 'Payment', dataType: 'float64' },
  // Item
  { key: 'purchased_item_ids', label: 'Purchased Item IDs', category: 'Item', dataType: 'array_string' },
  // Profile
  { key: 'role_level', label: 'Role Level', category: 'Profile', dataType: 'int64' },
  { key: 'os_platform', label: 'OS Platform', category: 'Profile', dataType: 'string' },
  { key: 'device_id', label: 'Device ID', category: 'Profile', dataType: 'string' },
];

/* ── All operators with labels (Apollo Platform spec) ── */

export const ALL_OPERATORS: { value: OperatorType; label: string }[] = [
  // common
  { value: 'equal', label: '=' },
  { value: 'not_equal', label: '≠' },
  { value: 'contains', label: 'contains' },
  // numeric
  { value: 'less_than', label: '<' },
  { value: 'greater_than', label: '>' },
  { value: 'less_equal', label: '≤' },
  { value: 'greater_equal', label: '≥' },
  { value: 'between', label: 'between' },
  // datetime
  { value: 'before', label: 'before' },
  { value: 'after', label: 'after' },
  { value: 'within_x_days', label: 'within X days' },
  { value: 'within_x_hours', label: 'within X hours' },
  { value: 'within_x_minutes', label: 'within X minutes' },
  { value: 'after_x_days', label: 'after X days' },
  { value: 'after_x_hours', label: 'after X hours' },
  { value: 'after_x_minutes', label: 'after X minutes' },
  // array
  { value: 'in', label: 'in' },
  { value: 'not_in', label: 'not in' },
  // array_datetime
  { value: 'on_nth_day', label: 'on nth day' },
];

/** Operators allowed per data type — from Apollo Journey Misc spec */
export const OPERATORS_BY_TYPE: Record<DataType, OperatorType[]> = {
  string:         ['equal', 'not_equal', 'contains'],
  int64:          ['equal', 'not_equal', 'less_than', 'greater_than', 'less_equal', 'greater_equal', 'between'],
  float64:        ['equal', 'not_equal', 'less_than', 'greater_than', 'less_equal', 'greater_equal', 'between'],
  datetime:       ['equal', 'not_equal', 'before', 'after', 'between', 'within_x_days', 'within_x_hours', 'within_x_minutes', 'after_x_days', 'after_x_hours', 'after_x_minutes'],
  boolean:        ['equal', 'not_equal'],
  array_int64:    ['in', 'not_in'],
  array_float64:  ['in', 'not_in'],
  array_string:   ['in', 'not_in'],
  array_object:   ['in', 'not_in'],
  array_datetime: ['in', 'not_in', 'on_nth_day'],
};

/** Get filtered operators for a given data type */
export function getOperatorsForType(dataType: DataType): { value: OperatorType; label: string }[] {
  const allowed = OPERATORS_BY_TYPE[dataType] ?? ['equal', 'not_equal'];
  return ALL_OPERATORS.filter((op) => allowed.includes(op.value));
}

/** Backward-compat alias used by template card, preview, etc. */
export const OPERATORS = ALL_OPERATORS;

/* ── Segment Templates ── */

export const MOCK_TEMPLATES: SegmentTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Churn Win-back',
    description: 'Target players who haven\'t logged in for 30+ days but have payment history. Win them back with personalized offers.',
    groups: [
      {
        id: 'g1',
        negated: false,
        logic: 'AND',
        conditions: [
          { id: 'c1', property: 'last_login', operator: 'after_x_days', value: '30' },
          { id: 'c2', property: 'total_payment', operator: 'greater_than', value: '0' },
        ],
      },
    ],
    groupLogic: 'AND',
    abTestResult: { ctrUplift: 15, conversionUplift: 8 },
    tags: ['Churn', 'Retention'],
    contributedBy: 'VNG ZingPlay Studio',
  },
  {
    id: 'tpl-2',
    name: 'First-time Payer Upsell',
    description: 'Engage players who made their first purchase recently. Push personalized bundle offers to boost second purchase.',
    groups: [
      {
        id: 'g1',
        negated: false,
        logic: 'AND',
        conditions: [
          { id: 'c1', property: 'total_trans', operator: 'equal', value: '1' },
          { id: 'c2', property: 'last_purchase_time', operator: 'within_x_days', value: '7' },
        ],
      },
    ],
    groupLogic: 'AND',
    abTestResult: { ctrUplift: 22 },
    tags: ['Monetization', 'Upsell'],
    contributedBy: 'VNG Esports Division',
  },
  {
    id: 'tpl-3',
    name: 'High-Value At-Risk',
    description: 'Identify high-spending players showing early churn signals. Prioritize retention with VIP treatment.',
    groups: [
      {
        id: 'g1',
        negated: false,
        logic: 'AND',
        conditions: [
          { id: 'c1', property: 'total_payment', operator: 'greater_than', value: '500000' },
          { id: 'c2', property: 'last_login', operator: 'after_x_days', value: '14' },
        ],
      },
    ],
    groupLogic: 'AND',
    abTestResult: { conversionUplift: 12 },
    tags: ['Churn', 'Monetization', 'Retention'],
    contributedBy: 'VNG Mobile Games',
  },
  {
    id: 'tpl-4',
    name: 'New User Activation',
    description: 'Target new registrations with zero transactions. Drive first purchase with onboarding incentives.',
    groups: [
      {
        id: 'g1',
        negated: false,
        logic: 'AND',
        conditions: [
          { id: 'c1', property: 'register_time', operator: 'within_x_days', value: '7' },
          { id: 'c2', property: 'total_trans', operator: 'equal', value: '0' },
        ],
      },
    ],
    groupLogic: 'AND',
    abTestResult: { ctrUplift: 30 },
    tags: ['Engagement', 'Monetization'],
    contributedBy: 'VNG Growth Team',
  },
  {
    id: 'tpl-5',
    name: 'Lapsed Whale Recovery',
    description: 'Re-engage top 1% spenders who dropped off. Offer exclusive comeback packages and VIP status restoration.',
    groups: [
      {
        id: 'g1',
        negated: false,
        logic: 'AND',
        conditions: [
          { id: 'c1', property: 'payment_d90', operator: 'greater_than', value: '2000000' },
          { id: 'c2', property: 'last_login', operator: 'after_x_days', value: '21' },
        ],
      },
      {
        id: 'g2',
        negated: true,
        logic: 'AND',
        conditions: [
          { id: 'c3', property: 'os_platform', operator: 'equal', value: 'Web' },
        ],
      },
    ],
    groupLogic: 'AND',
    abTestResult: { ctrUplift: 18, conversionUplift: 25 },
    tags: ['Churn', 'Monetization', 'Retention'],
  },
];

/* ── Playbooks ── */

export const MOCK_PLAYBOOKS: Playbook[] = [
  {
    id: 'pb-1',
    name: 'Churn Win-back Campaign',
    description: 'Automated push notification campaign targeting churned paying users with a comeback reward.',
    template: MOCK_TEMPLATES[0],
    action: { type: 'Push', title: 'We miss you! 🎮', body: 'Come back and claim your exclusive reward pack — 500 gems + 3 epic items waiting for you!' },
    expectedKpi: { ctrUplift: 15, conversionUplift: 8 },
  },
  {
    id: 'pb-2',
    name: 'First Purchase Nudge',
    description: 'In-app message targeting first-time payers with a limited-time bundle offer.',
    template: MOCK_TEMPLATES[1],
    action: { type: 'In-app Message', title: 'Special Offer Just for You!', body: 'As a valued first-time buyer, unlock this exclusive bundle at 40% off — available for 48 hours only.' },
    expectedKpi: { ctrUplift: 22 },
  },
  {
    id: 'pb-3',
    name: 'VIP Rescue Mission',
    description: 'SMS + Push campaign for high-value at-risk players with personalized VIP offers.',
    template: MOCK_TEMPLATES[2],
    action: { type: 'SMS', title: 'VIP Player Alert', body: 'Your VIP status is about to expire. Log in now to maintain your rank and claim exclusive VIP rewards.' },
    expectedKpi: { conversionUplift: 12 },
  },
];

/* ── Playbook Run History ── */

export const MOCK_PLAYBOOK_RUNS: PlaybookRun[] = [
  {
    id: 'run-1',
    playbookId: 'pb-1',
    productCode: 'zingspeed-mobile',
    status: 'Completed',
    startedAt: '2026-04-01T10:00:00Z',
    metricsActual: { ctrUplift: 17.2, conversionUplift: 9.1 },
    metricsBenchmark: { ctrUplift: 15, conversionUplift: 8 },
    audienceReached: 142500,
  },
  {
    id: 'run-2',
    playbookId: 'pb-2',
    productCode: 'dead-rivals',
    status: 'Active',
    startedAt: '2026-04-10T08:00:00Z',
    metricsActual: { ctrUplift: 19.8 },
    metricsBenchmark: { ctrUplift: 22 },
    audienceReached: 67300,
  },
  {
    id: 'run-3',
    playbookId: 'pb-3',
    productCode: 'zingplay-portal',
    status: 'Scheduled',
    startedAt: '2026-04-20T06:00:00Z',
    metricsActual: { ctrUplift: 0, conversionUplift: 0 },
    metricsBenchmark: { conversionUplift: 12 },
    audienceReached: 0,
  },
];

/* ── Mock Product Codes ── */

export const MOCK_PRODUCTS = [
  { code: 'zingspeed-mobile', name: 'ZingSpeed Mobile' },
  { code: 'dead-rivals', name: 'Dead Rivals' },
  { code: 'zingplay-portal', name: 'ZingPlay Portal' },
  { code: 'garena-free-fire', name: 'Garena Free Fire' },
  { code: 'lien-quan-mobile', name: 'Lien Quan Mobile' },
];

/* ── Pre-seeded Saved Segments ── */

export const MOCK_SAVED_SEGMENTS: import('../types/segment-builder-types').Segment[] = [
  {
    id: 'seg-seed-1',
    name: 'Churned Paying Players (30d)',
    groups: MOCK_TEMPLATES[0].groups,
    groupLogic: 'AND',
    estimatedAudience: 142300,
  },
  {
    id: 'seg-seed-2',
    name: 'New Users — Zero Purchases',
    groups: MOCK_TEMPLATES[3].groups,
    groupLogic: 'AND',
    estimatedAudience: 387200,
  },
  {
    id: 'seg-seed-3',
    name: 'VIP iOS Whales At Risk',
    groups: [{
      id: 'g-seed-3a', negated: false, logic: 'AND',
      conditions: [
        { id: 'cs-1', property: 'total_payment', operator: 'greater_than', value: '1000000' },
        { id: 'cs-2', property: 'last_login', operator: 'after_x_days', value: '14' },
        { id: 'cs-3', property: 'os_platform', operator: 'equal', value: 'iOS' },
      ],
    }],
    groupLogic: 'AND',
    estimatedAudience: 8750,
  },
];
