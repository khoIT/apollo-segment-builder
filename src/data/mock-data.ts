/**
 * CFL (Cross Fire Legends) — demo data cho Segment Builder
 * Properties, templates, playbooks đều map từ CFL_Liveops_Playbook_1.
 * izoneareaid = '101' / timezone = Asia/Ho_Chi_Minh
 */
import type {
  PropertyDef,
  DataType,
  SegmentTemplate,
  Playbook,
  PlaybookRun,
  OperatorType,
} from '../types/segment-builder-types';

/* ── CFL User-profile Properties (Apollo Platform) ─────────────────── */

export const PROPERTIES: PropertyDef[] = [
  // ── Login / Account ──────────────────────────────────────────────
  { key: 'last_login',       label: 'Last Login',          category: 'Login',   dataType: 'datetime' },
  { key: 'register_time',    label: 'Register Time',       category: 'Login',   dataType: 'datetime' },
  { key: 'vip_level',        label: 'VIP Level',           category: 'Login',   dataType: 'int64'    },
  { key: 'country_code',     label: 'Country Code',        category: 'Login',   dataType: 'string'   },
  { key: 'os_platform',      label: 'OS Platform',         category: 'Login',   dataType: 'string'   },
  { key: 'network_type',     label: 'Network Type',        category: 'Login',   dataType: 'string'   },
  { key: 'is_back_flow',     label: 'Is Returning User',   category: 'Login',   dataType: 'boolean'  },
  { key: 'novice_flag',      label: 'Novice Flag',         category: 'Login',   dataType: 'boolean'  },
  // ── Payment / Recharge ───────────────────────────────────────────
  { key: 'total_recharge',   label: 'Total Recharge (VNĐ)', category: 'Payment', dataType: 'float64'  },
  { key: 'recharge_count',   label: 'Recharge Count',      category: 'Payment', dataType: 'int64'    },
  { key: 'last_recharge',    label: 'Last Recharge Time',  category: 'Payment', dataType: 'datetime' },
  { key: 'first_recharge',   label: 'First Recharge Time', category: 'Payment', dataType: 'datetime' },
  { key: 'recharge_d30',     label: 'Recharge (Last 30d)', category: 'Payment', dataType: 'float64'  },
  { key: 'gold_balance',     label: 'Gold Balance',        category: 'Payment', dataType: 'float64'  },
  { key: 'diamond_balance',  label: 'Diamond Balance',     category: 'Payment', dataType: 'float64'  },
  // ── Item / Gacha ─────────────────────────────────────────────────
  { key: 'gacha_pull_count', label: 'Gacha Pull Count',   category: 'Item',    dataType: 'int64'    },
  // ── Profile / Gameplay ───────────────────────────────────────────
  { key: 'ladder_level',     label: 'Ladder Level (1–8)', category: 'Profile', dataType: 'int64'    },
  { key: 'total_games',      label: 'Total Games Played', category: 'Profile', dataType: 'int64'    },
  { key: 'win_rate',         label: 'Win Rate (%)',        category: 'Profile', dataType: 'float64'  },
  { key: 'avg_session',      label: 'Avg Session (s)',     category: 'Profile', dataType: 'int64'    },
  { key: 'drop_rate',        label: 'Drop Match Rate (%)', category: 'Profile', dataType: 'float64'  },
  { key: 'avg_ping_max',     label: 'Avg Max Ping (ms)',  category: 'Profile', dataType: 'float64'  },
  { key: 'ai_host_duration', label: 'AI托管 Duration (s)', category: 'Profile', dataType: 'float64'  },
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

/* ── CFL Segment Templates (từ CFL Liveops Playbook 3.x) ─────────── */

export const MOCK_TEMPLATES: SegmentTemplate[] = [
  // ── 3.8 Cross-Segment: Whale × Churned ──────────────────────────
  {
    id: 'tpl-cfl-1',
    name: 'Whale × Churned — Win-back VIP',
    description: 'User nạp nhiều (Whale) nhưng không login ≥ 14 ngày. Win-back campaign ưu tiên cao nhất — exclusive VIP offer, direct contact.',
    groups: [
      {
        id: 'g1', negated: false, logic: 'AND',
        conditions: [
          { id: 'c1', property: 'total_recharge',  operator: 'greater_than', value: '5000000' },
          { id: 'c2', property: 'last_login',       operator: 'after_x_days', value: '14' },
        ],
      },
    ],
    groupLogic: 'AND',
    abTestResult: { ctrUplift: 18, conversionUplift: 25 },
    tags: ['Churn', 'Monetization', 'Retention'],
    contributedBy: 'CFL LiveOps Team',
  },
  // ── 3.1 Lifecycle: At-Risk (5–13 ngày) ──────────────────────────
  {
    id: 'tpl-cfl-2',
    name: 'At-Risk — Sắp Churn (5–13 ngày)',
    description: 'User không login trong 5–13 ngày. Trigger re-engage popup khi họ login lại, hoặc soft reminder trước khi thực sự churn.',
    groups: [
      {
        id: 'g1', negated: false, logic: 'AND',
        conditions: [
          { id: 'c1', property: 'last_login', operator: 'after_x_days',  value: '5'  },
          { id: 'c2', property: 'last_login', operator: 'within_x_days', value: '13' },
        ],
      },
    ],
    groupLogic: 'AND',
    abTestResult: { ctrUplift: 22, conversionUplift: 12 },
    tags: ['Churn', 'Retention'],
    contributedBy: 'CFL LiveOps Team',
  },
  // ── 3.4 Tutorial: New User × Onboarding Drop-off ────────────────
  {
    id: 'tpl-cfl-3',
    name: 'New User × Tutorial Drop-off',
    description: 'User đăng ký trong 7 ngày nhưng chưa hoàn thành onboarding (dưới 3 trận). Emergency onboarding reward + simplified flow.',
    groups: [
      {
        id: 'g1', negated: false, logic: 'AND',
        conditions: [
          { id: 'c1', property: 'register_time', operator: 'within_x_days', value: '7' },
          { id: 'c2', property: 'total_games',   operator: 'less_than',     value: '3' },
        ],
      },
    ],
    groupLogic: 'AND',
    abTestResult: { ctrUplift: 30 },
    tags: ['Engagement', 'Retention'],
    contributedBy: 'CFL Growth',
  },
  // ── 3.8 Cross: High Skill × Non-payer ───────────────────────────
  {
    id: 'tpl-cfl-4',
    name: 'High Skill × Non-payer — Cosmetic Offer',
    description: 'Player Gold+ (Ladder ≥ 5) nhưng chưa nạp tiền. Cosmetic-only offer — không ảnh hưởng gameplay, đánh vào pride của skilled player.',
    groups: [
      {
        id: 'g1', negated: false, logic: 'AND',
        conditions: [
          { id: 'c1', property: 'ladder_level',   operator: 'greater_equal', value: '5' },
          { id: 'c2', property: 'total_recharge',  operator: 'less_equal',    value: '0' },
        ],
      },
    ],
    groupLogic: 'AND',
    abTestResult: { ctrUplift: 15 },
    tags: ['Monetization'],
    contributedBy: 'CFL Monetization',
  },
  // ── 3.8 Cross: Lag-prone × Active ───────────────────────────────
  {
    id: 'tpl-cfl-5',
    name: 'Lag-prone × Active — Network Compensation',
    description: 'User active (7 ngày gần nhất) nhưng avg ping > 300ms. Experience compensation + đề nghị low-ping server. Giảm churn do lag.',
    groups: [
      {
        id: 'g1', negated: false, logic: 'AND',
        conditions: [
          { id: 'c1', property: 'avg_ping_max', operator: 'greater_than',  value: '300' },
          { id: 'c2', property: 'last_login',   operator: 'within_x_days', value: '7'   },
        ],
      },
    ],
    groupLogic: 'AND',
    abTestResult: { conversionUplift: 10 },
    tags: ['Retention', 'Engagement'],
    contributedBy: 'CFL QoS Team',
  },
  // ── 3.8 Cross: Mission Completionist × Non-payer ────────────────
  {
    id: 'tpl-cfl-6',
    name: 'Mission Completionist × Non-payer — BP Upsell',
    description: 'User chơi nhiều (10+ trận, session ≥ 30 phút) nhưng chưa nạp. Đây là thời điểm tốt nhất để push Battle Pass — user đang engaged cao nhất.',
    groups: [
      {
        id: 'g1', negated: false, logic: 'AND',
        conditions: [
          { id: 'c1', property: 'avg_session',    operator: 'greater_equal', value: '1800' },
          { id: 'c2', property: 'total_games',    operator: 'greater_equal', value: '10'   },
          { id: 'c3', property: 'total_recharge', operator: 'less_equal',    value: '0'    },
        ],
      },
    ],
    groupLogic: 'AND',
    abTestResult: { ctrUplift: 35, conversionUplift: 18 },
    tags: ['Monetization', 'Engagement'],
    contributedBy: 'CFL LiveOps Team',
  },
  // ── 3.2 + 3.3 Cross: Fragger × Dolphin ─────────────────────────
  {
    id: 'tpl-cfl-7',
    name: 'Fragger × Dolphin — Weapon Skin Upsell',
    description: 'Player thắng nhiều (win rate > 50%) và là Dolphin (5M > total_recharge > 500k). Upsell weapon performance skin — value prop rõ ràng với player này.',
    groups: [
      {
        id: 'g1', negated: false, logic: 'AND',
        conditions: [
          { id: 'c1', property: 'win_rate',       operator: 'greater_than', value: '50'      },
          { id: 'c2', property: 'total_recharge', operator: 'greater_than', value: '500000'  },
          { id: 'c3', property: 'total_recharge', operator: 'less_than',    value: '5000000' },
        ],
      },
    ],
    groupLogic: 'AND',
    abTestResult: { ctrUplift: 28, conversionUplift: 15 },
    tags: ['Monetization', 'Upsell'],
    contributedBy: 'CFL Monetization',
  },
];

/* ── CFL Playbooks ──────────────────────────────────────────────────── */

export const MOCK_PLAYBOOKS: Playbook[] = [
  {
    id: 'pb-cfl-1',
    name: 'CFL Whale Win-back Campaign',
    description: 'Push notification campaign cho Whale bị churn — cá nhân hóa offer với gem pack + exclusive item.',
    template: MOCK_TEMPLATES[0],
    action: {
      type: 'Push',
      title: 'Chào mừng trở lại Vương Đấu! 🎮',
      body: 'Bạn đã bỏ lỡ 2 mùa giải. Claim ngay gói VIP Exclusive — 1000 kim cương + 1 súng Epic chỉ dành cho bạn trong 48h.',
    },
    expectedKpi: { ctrUplift: 18, conversionUplift: 25 },
  },
  {
    id: 'pb-cfl-2',
    name: 'CFL New Player Onboarding Push',
    description: 'In-app message hỗ trợ newbie hoàn thành tutorial và chơi trận đầu tiên.',
    template: MOCK_TEMPLATES[2],
    action: {
      type: 'In-app Message',
      title: 'Chào Tân Binh! Hoàn thành nhiệm vụ ngay 🎯',
      body: 'Thắng 1 trận ngay hôm nay để nhận Starter Pack miễn phí: 200 gold + trang bị cơ bản. Nhiệm vụ còn hiệu lực 24h!',
    },
    expectedKpi: { ctrUplift: 30 },
  },
  {
    id: 'pb-cfl-3',
    name: 'CFL Lag Compensation SMS',
    description: 'SMS + Push cho user có mạng kém đang active — đền bù trải nghiệm và offer server ít lag.',
    template: MOCK_TEMPLATES[4],
    action: {
      type: 'SMS',
      title: 'Cải thiện trải nghiệm chơi game của bạn',
      body: 'Chúng tôi ghi nhận bạn đang gặp lag. Nhận 100 gold bồi thường + chuyển sang server VN-HCM ít lag hơn.',
    },
    expectedKpi: { conversionUplift: 10 },
  },
];

/* ── CFL Playbook Run History ───────────────────────────────────────── */

export const MOCK_PLAYBOOK_RUNS: PlaybookRun[] = [
  {
    id: 'run-cfl-1',
    playbookId: 'pb-cfl-1',
    productCode: 'cfl-vn',
    status: 'Completed',
    startedAt: '2026-04-01T03:00:00Z',
    metricsActual:    { ctrUplift: 21.4, conversionUplift: 27.8 },
    metricsBenchmark: { ctrUplift: 18,   conversionUplift: 25 },
    audienceReached: 8_750,
  },
  {
    id: 'run-cfl-2',
    playbookId: 'pb-cfl-2',
    productCode: 'cfl-vn',
    status: 'Active',
    startedAt: '2026-04-15T03:00:00Z',
    metricsActual:    { ctrUplift: 24.1 },
    metricsBenchmark: { ctrUplift: 30 },
    audienceReached: 34_200,
  },
  {
    id: 'run-cfl-3',
    playbookId: 'pb-cfl-3',
    productCode: 'cfl-vn',
    status: 'Scheduled',
    startedAt: '2026-05-01T03:00:00Z',
    metricsActual:    { ctrUplift: 0, conversionUplift: 0 },
    metricsBenchmark: { conversionUplift: 10 },
    audienceReached: 0,
  },
];

/* ── Products ───────────────────────────────────────────────────────── */

export const MOCK_PRODUCTS = [
  { code: 'cfl-vn', name: 'Cross Fire Legends (VN)' },
];

/* ── Pre-seeded Saved Segments ──────────────────────────────────────── */

export const MOCK_SAVED_SEGMENTS: import('../types/segment-builder-types').Segment[] = [
  {
    id: 'seg-cfl-1',
    name: 'CFL Whale Win-back 14d',
    segmentType: 'dynamic',
    groups: [{
      id: 'g-s1', negated: false, logic: 'AND',
      conditions: [
        { id: 'cs-1', property: 'total_recharge', operator: 'greater_than', value: '5000000' },
        { id: 'cs-2', property: 'last_login',      operator: 'after_x_days', value: '14' },
      ],
    }],
    groupLogic: 'AND',
    estimatedAudience: 8_750,
  },
  {
    id: 'seg-cfl-2',
    name: 'New Users Stuck in Tutorial (<3 trận)',
    segmentType: 'static',
    groups: [{
      id: 'g-s2', negated: false, logic: 'AND',
      conditions: [
        { id: 'cs-3', property: 'register_time', operator: 'within_x_days', value: '7' },
        { id: 'cs-4', property: 'total_games',   operator: 'less_than',     value: '3' },
      ],
    }],
    groupLogic: 'AND',
    estimatedAudience: 47_300,
  },
  {
    id: 'seg-cfl-3',
    name: 'Active Ranked Gold+ Players',
    segmentType: 'realtime',
    groups: [{
      id: 'g-s3', negated: false, logic: 'AND',
      conditions: [
        { id: 'cs-5', property: 'ladder_level', operator: 'greater_equal',  value: '5' },
        { id: 'cs-6', property: 'last_login',   operator: 'within_x_days',  value: '7' },
      ],
    }],
    groupLogic: 'AND',
    estimatedAudience: 142_300,
  },
];
