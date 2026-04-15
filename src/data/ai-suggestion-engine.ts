/**
 * Mock AI engine that parses natural language prompts into segment conditions.
 * Uses keyword/pattern matching to simulate LLM-generated conditions.
 */
import type { ConditionGroup, Condition, LogicOperator } from '../types/segment-builder-types';

let idCounter = 500;
function nextId(prefix: string) { return `${prefix}-${Date.now()}-${++idCounter}`; }

interface ParsedIntent {
  conditions: Condition[];
  logic: LogicOperator;
  segmentName: string;
}

/* ── Keyword pattern matchers ── */

/** Extract a number followed by "day(s)" from text, returns just the number string */
function extractDaysNum(text: string, fallback: number): string {
  const match = text.match(/(\d+)\s*(?:days?|d)/i);
  return match ? match[1] : String(fallback);
}

/** Extract a raw number from text near a keyword */
function extractNumber(text: string, keyword: RegExp, fallback: number): string {
  // Look for number near the keyword
  const around = text.match(new RegExp(`(?:${keyword.source})\\s*(?:>|>=|than|of)?\\s*(\\d[\\d,.]*)`, 'i'))
    || text.match(new RegExp(`(\\d[\\d,.]*)\\s*(?:${keyword.source})`, 'i'));
  if (around) return around[1].replace(/,/g, '');
  return String(fallback);
}

/** Detect country codes from text */
function detectCountry(text: string): string | null {
  const map: Record<string, string> = {
    'vietnam': 'VN', 'vn': 'VN', 'việt nam': 'VN',
    'thailand': 'TH', 'th': 'TH', 'thái': 'TH',
    'indonesia': 'ID', 'indo': 'ID',
    'philippines': 'PH', 'ph': 'PH',
    'malaysia': 'MY', 'my': 'MY',
    'japan': 'JP', 'jp': 'JP',
    'korea': 'KR', 'kr': 'KR',
    'us': 'US', 'usa': 'US', 'united states': 'US',
  };
  const lower = text.toLowerCase();
  for (const [keyword, code] of Object.entries(map)) {
    if (lower.includes(keyword)) return code;
  }
  return null;
}

/** Detect OS platform from text */
function detectPlatform(text: string): string | null {
  const lower = text.toLowerCase();
  if (/\bios\b|iphone|ipad|apple/i.test(lower)) return 'iOS';
  if (/\bandroid\b/i.test(lower)) return 'Android';
  if (/\bweb\b|browser|pc/i.test(lower)) return 'web';
  return null;
}

/* ── Main parser ── */

export function parsePromptToConditions(prompt: string): ParsedIntent {
  const lower = prompt.toLowerCase();
  const conditions: Condition[] = [];
  let logic: LogicOperator = 'AND';
  const nameParts: string[] = [];

  // ── Churn / Inactive patterns ──
  if (/churn|inactive|lapsed|haven'?t\s*logged|not\s*login|quit|left|gone|drop.?off|absent/i.test(lower)) {
    const days = extractDaysNum(lower, 30);
    conditions.push({ id: nextId('c'), property: 'last_login', operator: 'after_x_days', value: days });
    nameParts.push('Churned');
  }

  // ── Recently active ──
  if (/active\s*recently|recently\s*active|logged\s*in\s*recently|daily\s*active/i.test(lower)) {
    const days = extractDaysNum(lower, 7);
    conditions.push({ id: nextId('c'), property: 'last_login', operator: 'within_x_days', value: days });
    nameParts.push('Active');
  }

  // ── New user ──
  if (/new\s*(user|player|register|account)|recently\s*(register|sign|join)|just\s*(join|register)/i.test(lower)) {
    const days = extractDaysNum(lower, 7);
    conditions.push({ id: nextId('c'), property: 'register_time', operator: 'within_x_days', value: days });
    nameParts.push('New Users');
  }

  // ── High value / whale ──
  if (/whale|high.?value|big\s*spend|heavy\s*spend|vip|top\s*spend|high\s*pay/i.test(lower)) {
    const amount = extractNumber(lower, /spend|pay|value|whale/i, 500000);
    conditions.push({ id: nextId('c'), property: 'total_payment', operator: 'greater_than', value: amount });
    nameParts.push('High-Value');
  }

  // ── Has paid / paying users ──
  if (/paid|paying|buyer|purchas|bought|spender|monetiz/i.test(lower) && !nameParts.includes('High-Value')) {
    conditions.push({ id: nextId('c'), property: 'total_payment', operator: 'greater_than', value: '0' });
    nameParts.push('Paying');
  }

  // ── Never paid / free users ──
  if (/free\s*(user|player)|never\s*(paid|purchas|bought)|no\s*(purchase|payment|transaction)|non.?pay|f2p/i.test(lower)) {
    conditions.push({ id: nextId('c'), property: 'total_trans', operator: 'equal', value: '0' });
    nameParts.push('Free Players');
  }

  // ── First-time buyer ──
  if (/first.?time\s*(buy|pay|purchas)|single\s*purchase|one\s*transaction|1st\s*purchase/i.test(lower)) {
    conditions.push({ id: nextId('c'), property: 'total_trans', operator: 'equal', value: '1' });
    nameParts.push('First-time Buyer');
  }

  // ── Recent payment ──
  if (/recent.?(pay|purchas|buy|trans)|last\s*(pay|purchas|buy)/i.test(lower)) {
    const days = extractDaysNum(lower, 7);
    conditions.push({ id: nextId('c'), property: 'last_purchase_time', operator: 'within_x_days', value: days });
    nameParts.push('Recent Buyer');
  }

  // ── High level ──
  if (/high\s*level|endgame|end.?game|veteran|level\s*\d+|max\s*level/i.test(lower)) {
    const level = extractNumber(lower, /level/i, 50);
    conditions.push({ id: nextId('c'), property: 'role_level', operator: 'greater_than', value: level });
    nameParts.push('High-Level');
  }

  // ── Low level / beginner ──
  if (/low\s*level|beginner|newbie|noob|starter/i.test(lower)) {
    const level = extractNumber(lower, /level/i, 10);
    conditions.push({ id: nextId('c'), property: 'role_level', operator: 'less_than', value: level });
    nameParts.push('Beginner');
  }

  // ── Platform detection ──
  const platform = detectPlatform(lower);
  if (platform) {
    conditions.push({ id: nextId('c'), property: 'os_platform', operator: 'equal', value: platform });
    nameParts.push(platform);
  }

  // ── Country detection ──
  const country = detectCountry(lower);
  if (country) {
    conditions.push({ id: nextId('c'), property: 'country_code', operator: 'equal', value: country });
    nameParts.push(country);
  }

  // ── Payment amount thresholds ──
  if (/payment.?d?30|30.?day.?pay|monthly\s*pay/i.test(lower)) {
    const amount = extractNumber(lower, /payment|pay/i, 100000);
    conditions.push({ id: nextId('c'), property: 'payment_d30', operator: 'greater_than', value: amount });
    nameParts.push('Monthly Payers');
  }
  if (/payment.?d?90|90.?day.?pay|quarterly\s*pay/i.test(lower)) {
    const amount = extractNumber(lower, /payment|pay/i, 500000);
    conditions.push({ id: nextId('c'), property: 'payment_d90', operator: 'greater_than', value: amount });
    nameParts.push('Quarterly Payers');
  }

  // ── OR logic detection ──
  if (/\bor\b|either|any\s*of/i.test(lower)) {
    logic = 'OR';
  }

  // ── Fallback if nothing matched ──
  if (conditions.length === 0) {
    conditions.push({ id: nextId('c'), property: '', operator: 'equal', value: '' });
    return { conditions, logic, segmentName: '' };
  }

  const segmentName = nameParts.join(' ') + ' Segment';
  return { conditions, logic, segmentName };
}

/* ── Pre-built suggestion chips ── */

export const AI_SUGGESTION_CHIPS = [
  'Players churned over 30 days who have paid before',
  'New users registered in 7 days, never purchased',
  'High-value whales on iOS inactive 14 days',
  'First-time buyers in Vietnam within 7 days',
  'Active Android players level above 30',
  'Free players in Thailand registered 3 days ago',
];

/** Simulate AI processing delay (200–600ms) */
export function simulateAiDelay(): Promise<void> {
  const ms = 200 + Math.random() * 400;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
