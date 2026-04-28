/**
 * Mock AI engine that parses natural language prompts into segment conditions.
 * Uses keyword/pattern matching to simulate LLM-generated conditions.
 */
import type { Condition, LogicOperator } from '../types/segment-builder-types';

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

  // ── High value / whale / recharge ──
  if (/whale|high.?value|big\s*(spend|recharge)|top\s*spend|nạp\s*nhiều/i.test(lower)) {
    const amount = extractNumber(lower, /spend|recharge|nạp|value|whale/i, 5000000);
    conditions.push({ id: nextId('c'), property: 'total_recharge', operator: 'greater_than', value: amount });
    nameParts.push('Whale');
  }

  // ── Has recharged / paying users ──
  if (/paid|paying|recharg|buyer|purchas|bought|spender|monetiz|nạp tiền/i.test(lower) && !nameParts.includes('Whale')) {
    conditions.push({ id: nextId('c'), property: 'total_recharge', operator: 'greater_than', value: '0' });
    nameParts.push('Paying');
  }

  // ── Never recharged / free users ──
  if (/free\s*(user|player)|never\s*(paid|recharg|purchas|nạp)|no\s*(recharge|purchase|payment)|non.?pay|f2p|chưa nạp/i.test(lower)) {
    conditions.push({ id: nextId('c'), property: 'recharge_count', operator: 'equal', value: '0' });
    nameParts.push('Non-Payer');
  }

  // ── First-time recharge ──
  if (/first.?time\s*(recharg|buy|pay|purchas)|single\s*purchase|1st\s*(recharge|purchase)/i.test(lower)) {
    conditions.push({ id: nextId('c'), property: 'recharge_count', operator: 'equal', value: '1' });
    nameParts.push('First Recharge');
  }

  // ── Recent recharge ──
  if (/recent.?(recharg|pay|purchas|buy)|last\s*(recharg|pay|purchas|buy)/i.test(lower)) {
    const days = extractDaysNum(lower, 7);
    conditions.push({ id: nextId('c'), property: 'last_recharge', operator: 'within_x_days', value: days });
    nameParts.push('Recent Recharge');
  }

  // ── High ladder / rank ──
  if (/gold|platinum|diamond|master|ladder\s*(rank|level|high|top|>=?\s*\d)|rank\s*(high|top|\d+)|cao rank/i.test(lower)) {
    const level = extractNumber(lower, /ladder|rank|level/i, 5);
    conditions.push({ id: nextId('c'), property: 'ladder_level', operator: 'greater_equal', value: level });
    nameParts.push('High-Rank');
  }

  // ── Low ladder / beginner rank ──
  if (/bronze|silver|beginner|newbie|noob|starter|low\s*rank|thấp rank/i.test(lower)) {
    const level = extractNumber(lower, /ladder|rank|level/i, 3);
    conditions.push({ id: nextId('c'), property: 'ladder_level', operator: 'less_equal', value: level });
    nameParts.push('Low-Rank');
  }

  // ── High game level / veteran ──
  if (/high\s*level|endgame|end.?game|veteran|level\s*\d+|max\s*level/i.test(lower)) {
    const level = extractNumber(lower, /level/i, 50);
    conditions.push({ id: nextId('c'), property: 'ladder_level', operator: 'greater_than', value: level });
    nameParts.push('Veteran');
  }

  // ── Ping / lag / network issues ──
  if (/ping|lag|latency|network\s*issue|poor\s*conn|bad\s*connect|mạng kém/i.test(lower)) {
    const ms = extractNumber(lower, /ping|ms|latency/i, 300);
    conditions.push({ id: nextId('c'), property: 'avg_ping_max', operator: 'greater_than', value: ms });
    nameParts.push('High-Ping');
  }

  // ── Gacha / pull ──
  if (/gacha|pull|loot.?box|spin|quay|never\s*(gacha|pull|spin)|gacha.?virgin/i.test(lower)) {
    const isPristine = /never|virgin|zero|0\s*pull|chưa quay/i.test(lower);
    conditions.push({
      id: nextId('c'),
      property: 'gacha_pull_count',
      operator: isPristine ? 'equal' : 'greater_than',
      value: isPristine ? '0' : extractNumber(lower, /pull|gacha/i, 5),
    });
    nameParts.push(isPristine ? 'Gacha-Virgin' : 'Gacha-Active');
  }

  // ── Heavy session / long play ──
  if (/long\s*session|heavy\s*play|play\s*a\s*lot|daily\s*player|session\s*>\s*\d+|nhiều giờ/i.test(lower)) {
    const secs = extractNumber(lower, /session|minute|hour/i, 1800);
    conditions.push({ id: nextId('c'), property: 'avg_session', operator: 'greater_than', value: secs });
    nameParts.push('Heavy-Player');
  }

  // ── Many games / match count ──
  if (/\d+\s*\+?\s*games?|games?\s*(>\s*\d+|more\s*than)|match\s*count|total\s*games?/i.test(lower)) {
    const count = extractNumber(lower, /games?|match/i, 10);
    conditions.push({ id: nextId('c'), property: 'total_games', operator: 'greater_equal', value: count });
    nameParts.push('Experienced');
  }

  // ── VIP level ──
  if (/\bvip\s*\d+|vip\s*level|vip\s*(high|>=?)/i.test(lower)) {
    const level = extractNumber(lower, /vip/i, 3);
    conditions.push({ id: nextId('c'), property: 'vip_level', operator: 'greater_equal', value: level });
    nameParts.push('VIP');
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

  // ── Recharge in last 30 days ──
  if (/recharge.?d?30|30.?day.?recharge|recharge\s*last\s*month|nạp\s*30\s*ngày/i.test(lower)) {
    const amount = extractNumber(lower, /recharge|nạp/i, 200000);
    conditions.push({ id: nextId('c'), property: 'recharge_d30', operator: 'greater_than', value: amount });
    nameParts.push('Monthly Recharged');
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
  'Whale players churned 14 days, total recharge > 5000000',
  'New users registered 7 days ago, never recharged',
  'Gold+ ladder rank players who never recharged',
  'Active players with ping > 300ms, need network compensation',
  'Players with 10+ games and long sessions, never recharged',
  'Gacha-virgin active users last 7 days',
];

/** Simulate AI processing delay (200–600ms) */
export function simulateAiDelay(): Promise<void> {
  const ms = 200 + Math.random() * 400;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
