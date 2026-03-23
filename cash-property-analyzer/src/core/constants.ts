/*
 * EPIC 1: Doctrine & Guardrails
 * Locked non-negotiable rules in code comments
 */

/**
 * NON-NEGOTIABLE INVESTMENT RULES
 *
 * 1. NO LEVERAGE: This app analyzes CASH-ONLY purchases only.
 *    Debt, mortgages, refinancing assumptions are prohibited.
 *
 * 2. NO IRR: Internal Rate of Return calculations are forbidden.
 *    We analyze CURRENT owner earnings only, not future appreciation.
 *
 * 3. NO OVERRIDES: Rejection gates are absolute and cannot be bypassed.
 *    If a deal fails any auto-reject rule, it must be rejected.
 *
 * 4. CASH FLOW FOCUS: Only observable, repeatable cash flows are considered.
 *    Speculative gains are excluded from analysis.
 */

export const AUTO_REJECT_RULES = {
  MIN_OEY: 0.12, // 12%
  MAX_PAYBACK: 12, // years
  MIN_STOCK_PREMIUM: 0.03, // 3%
} as const;

export const SCORING_WEIGHTS = {
  OEY: 30,
  PAYBACK: 20,
  STRESS_SURVIVAL: 25,
  EXPENSE_QUALITY: 10,
  DEAL_SIMPLICITY: 10,
  STOCK_PREMIUM: 5,
} as const;

export const TOTAL_SCORE = 100;
