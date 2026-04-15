import type {
  PropertyDef,
  SegmentTemplate,
  Playbook,
  PlaybookRun,
  OperatorType,
} from '../types/segment-builder-types';

/* ── Property Definitions ── */

export const PROPERTIES: PropertyDef[] = [
  // Login
  { key: 'last_login', label: 'Last Login', category: 'Login', type: 'date' },
  { key: 'register_time', label: 'Register Time', category: 'Login', type: 'date' },
  { key: 'login_channel', label: 'Login Channel', category: 'Login', type: 'string' },
  { key: 'country_code', label: 'Country Code', category: 'Login', type: 'string' },
  // Payment
  { key: 'total_payment', label: 'Total Payment', category: 'Payment', type: 'number' },
  { key: 'total_trans', label: 'Total Transactions', category: 'Payment', type: 'number' },
  { key: 'last_purchase_time', label: 'Last Purchase Time', category: 'Payment', type: 'date' },
  { key: 'first_purchase_time', label: 'First Purchase Time', category: 'Payment', type: 'date' },
  { key: 'payment_d30', label: 'Payment (30 days)', category: 'Payment', type: 'number' },
  { key: 'payment_d90', label: 'Payment (90 days)', category: 'Payment', type: 'number' },
  // Item
  { key: 'purchased_item_ids', label: 'Purchased Item IDs', category: 'Item', type: 'multi_value' },
  // Profile
  { key: 'role_level', label: 'Role Level', category: 'Profile', type: 'number' },
  { key: 'os_platform', label: 'OS Platform', category: 'Profile', type: 'string' },
  { key: 'device_id', label: 'Device ID', category: 'Profile', type: 'string' },
];

/* ── Operators ── */

export const OPERATORS: { value: OperatorType; label: string }[] = [
  { value: 'equals', label: '=' },
  { value: 'not_equals', label: '≠' },
  { value: 'greater_than', label: '>' },
  { value: 'less_than', label: '<' },
  { value: 'between', label: 'between' },
  { value: 'contains', label: 'contains' },
  { value: 'is_null', label: 'is null' },
  { value: 'is_not_null', label: 'is not null' },
  { value: 'in', label: 'in' },
  { value: 'not_in', label: 'not in' },
];

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
          { id: 'c1', property: 'last_login', operator: 'greater_than', value: '30 days ago' },
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
          { id: 'c1', property: 'total_trans', operator: 'equals', value: '1' },
          { id: 'c2', property: 'last_purchase_time', operator: 'less_than', value: '7 days ago' },
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
          { id: 'c2', property: 'last_login', operator: 'greater_than', value: '14 days ago' },
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
          { id: 'c1', property: 'register_time', operator: 'less_than', value: '7 days ago' },
          { id: 'c2', property: 'total_trans', operator: 'equals', value: '0' },
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
          { id: 'c2', property: 'last_login', operator: 'greater_than', value: '21 days ago' },
        ],
      },
      {
        id: 'g2',
        negated: true,
        logic: 'AND',
        conditions: [
          { id: 'c3', property: 'os_platform', operator: 'equals', value: 'web' },
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
