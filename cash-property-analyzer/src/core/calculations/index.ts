// EPIC 4: Calculation Engine
import { DealInput } from "../types";
import { saConfig } from "../../config/saConfig";

/**
 * RATE CONVENTIONS (LOCKED)
 * - All calculated yields return DECIMALS (0.15 = 15%)
 * - All input rates are PERCENTAGES (8 = 8%)
 * - All config values (stockBenchmarkYield) are DECIMALS
 */

/**
 * Calculate Net Operating Income (NOI)
 * Pure function with no side effects
 */
export const calculateNOI = (input: DealInput): number => {
  const totalExpenses = Object.values(input.operatingExpenses).reduce(
    (sum, expense) => sum + (Number.isFinite(expense) ? expense : 0),
    0
  );
  const effectiveRent = input.annualGrossRent * (1 - input.vacancyRate / 100);

  return effectiveRent - totalExpenses;
};

/**
 * Calculate Owner Earnings
 * Deducts maintenance reserve from NOI
 */
export const calculateOwnerEarnings = (input: DealInput): number => {
  const noi = calculateNOI(input);
  return noi - input.maintenanceReserve;
};

/**
 * Calculate Owner Earnings Yield (OEY)
 * Returns decimal percentage (e.g., 0.15 for 15%)
 */
export const calculateOEY = (input: DealInput): number => {
  const ownerEarnings = calculateOwnerEarnings(input);

  // Handle division by zero explicitly
  if (input.purchasePrice <= 0) {
    return 0;
  }

  return ownerEarnings / input.purchasePrice;
};

/**
 * Calculate Payback Period in years
 * Returns Infinity if owner earnings <= 0
 */
export const calculatePayback = (input: DealInput): number => {
  const ownerEarnings = calculateOwnerEarnings(input);

  if (ownerEarnings <= 0) {
    return Infinity;
  }

  return input.purchasePrice / ownerEarnings;
};

/**
 * NOTE: GRY and GRM are diagnostic metrics only.
 * They are NOT used in scoring or rejection logic.
 * Used for property valuation comparison only.
 */

/**
 * Calculate Gross Rental Yield
 * Returns decimal percentage (e.g., 0.08 for 8%)
 */
export const calculateGrossRentalYield = (input: DealInput): number => {
  if (input.purchasePrice <= 0) return NaN;
  return input.annualGrossRent / input.purchasePrice;
};

/**
 * Calculate Gross Rent Multiplier
 * Diagnostic metric for property valuation
 */
export const calculateGRM = (input: DealInput): number => {
  if (input.annualGrossRent <= 0) return Infinity;
  return input.purchasePrice / input.annualGrossRent;
};

/**
 * Calculate Stock Yield Premium
 * Premium of property yield over stock benchmark
 * Both oey and stockBenchmarkYield are DECIMALS
 */
export const calculateStockPremium = (oey: number): number => {
  return oey - saConfig.stockBenchmarkYield;
};
