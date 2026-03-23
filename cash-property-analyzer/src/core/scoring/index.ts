// EPIC 6: Scoring Engine
import { DealInput } from "../types";
import { saConfig } from "../../config/saConfig";
import {
  calculateOEY,
  calculatePayback,
  calculateStockPremium,
} from "../calculations";
import { evaluateWorstCaseStress } from "../stressTests";

/**
 * Auto-Reject Gates
 * Returns array of rejection reasons, empty array if passes all gates
 */
export const applyAutoRejectGates = (
  input: DealInput,
  oey: number,
  payback: number,
  stressPassed: boolean,
  stockPremium: number
): string[] => {
  const rejectReasons: string[] = [];

  // REMOVED: Duplicate check for OEY vs stock benchmark
  // We keep only the stockPremium check below which is mathematically equivalent
  // but clearer in intent

  if (payback > 12) {
    rejectReasons.push(
      `Payback ${payback.toFixed(1)} years > maximum 12 years`
    );
  }

  if (!stressPassed) {
    rejectReasons.push("Negative cash flow under combined stress");
  }

  if (stockPremium < 0.03) {
    rejectReasons.push(
      `Stock premium ${(stockPremium * 100).toFixed(1)}% < minimum 3%`
    );
  }

  return rejectReasons;
};

/**
 * Score OEY based on locked thresholds
 */
export const scoreOEY = (oey: number): number => {
  const { oeyScoring } = saConfig;

  for (const band of oeyScoring) {
    if (oey >= band.threshold) {
      return band.score;
    }
  }

  return 0;
};

/**
 * Score Payback Period based on locked thresholds
 */
export const scorePayback = (payback: number): number => {
  const { paybackScoring } = saConfig;

  for (const band of paybackScoring) {
    if (payback <= band.threshold) {
      return band.score;
    }
  }

  return 0;
};

/**
 * Score Stress Survival
 * Returns 25 if passed, 0 if failed
 */
export const scoreStressSurvival = (passed: boolean): number => {
  return passed ? 25 : 0;
};

/**
 * Score Expense Quality (simplified - would be more complex in reality)
 */
export const scoreExpenseQuality = (input: DealInput): number => {
  const totalExpenses = Object.values(input.operatingExpenses).reduce(
    (sum, expense) => sum + (Number.isFinite(expense) ? expense : 0),
    0
  );

  // Handle edge cases
  if (input.annualGrossRent <= 0 || !Number.isFinite(totalExpenses)) {
    return 0;
  }

  const expenseRatio = totalExpenses / input.annualGrossRent;

  // Simple scoring based on expense ratio
  if (expenseRatio <= 0.35) return 10;
  if (expenseRatio <= 0.45) return 7;
  if (expenseRatio <= 0.55) return 4;
  return 1;
};

/**
 * Score Deal Simplicity & Control
 */
export const scoreDealSimplicity = (input: DealInput): number => {
  // Full control (single owner) scores max
  // Complex/shared arrangements score lower
  // Simplified for example
  if (input.unitCount <= 4) return 10;
  if (input.unitCount <= 8) return 7;
  if (input.unitCount <= 12) return 4;
  return 1;
};

/**
 * Score Stock Yield Premium
 */
export const scoreStockPremium = (premium: number): number => {
  if (premium >= 0.1) return 5;
  if (premium >= 0.08) return 4;
  if (premium >= 0.06) return 3;
  if (premium >= 0.04) return 2;
  if (premium >= 0.03) return 1;
  return 0;
};

/**
 * Scoring Engine Result Type
 * Explicit type definition for UI integration safety
 */
export interface ScoringResult {
  status: "ACCEPTED" | "BORDERLINE" | "REJECTED";
  finalScore: number;
  componentScores: {
    oey: number;
    payback: number;
    stressSurvival: number;
    expenseQuality: number;
    dealSimplicity: number;
    stockPremium: number;
  };
  rejectReasons: string[];
}

/**
 * Scoring Orchestrator
 * Runs all scoring components in correct order
 */
export const scoringEngine = (input: DealInput): ScoringResult => {
  // Calculate core metrics
  const oey = calculateOEY(input);
  const payback = calculatePayback(input);
  const stockPremium = calculateStockPremium(oey);

  // CRITICAL: Handle NaN OEY early to prevent silent bypass of reject gates
  if (!Number.isFinite(oey)) {
    return {
      status: "REJECTED",
      finalScore: 0,
      componentScores: {
        oey: 0,
        payback: 0,
        stressSurvival: 0,
        expenseQuality: 0,
        dealSimplicity: 0,
        stockPremium: 0,
      },
      rejectReasons: ["Invalid purchase price (OEY is not a valid number)"],
    };
  }

  // Run stress tests
  const stressResult = evaluateWorstCaseStress(input);

  // Apply auto-reject gates
  const rejectReasons = applyAutoRejectGates(
    input,
    oey,
    payback,
    stressResult.passed,
    stockPremium
  );

  // If rejected, return early
  if (rejectReasons.length > 0) {
    return {
      status: "REJECTED",
      finalScore: 0,
      componentScores: {
        oey: 0,
        payback: 0,
        stressSurvival: 0,
        expenseQuality: 0,
        dealSimplicity: 0,
        stockPremium: 0,
      },
      rejectReasons,
    };
  }

  // Calculate component scores
  const componentScores = {
    oey: scoreOEY(oey),
    payback: scorePayback(payback),
    stressSurvival: scoreStressSurvival(stressResult.passed),
    expenseQuality: scoreExpenseQuality(input),
    dealSimplicity: scoreDealSimplicity(input),
    stockPremium: scoreStockPremium(stockPremium),
  };

  // Calculate final score
  const finalScore = Object.values(componentScores).reduce(
    (sum, score) => sum + score,
    0
  );

  // Determine status
  let status: "BORDERLINE" | "ACCEPTED";
  if (finalScore >= 70) {
    status = "ACCEPTED";
  } else {
    status = "BORDERLINE";
  }

  return {
    status,
    finalScore,
    componentScores,
    rejectReasons: [],
  };
};
