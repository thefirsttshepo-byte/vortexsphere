// EPIC 1: Doctrine & Guardrails
export const INVESTMENT_DOCTRINE = `
Capital is allocated only to assets that produce observable owner earnings today,
recover capital quickly under conservative assumptions, and outperform passive
alternatives by a wide margin. Survival precedes growth. Compounding is allowed
only after safety is assured.

NON-NEGOTIABLE RULES:
1. No leverage or debt assumptions
2. No IRR or appreciation projections
3. No override of rejection gates
4. Cash-only analysis only
`.trim();

// EPIC 3: Core Domain Model
export interface DealInput {
  id: string;
  name: string;
  location: {
    township: string;
    municipality: string;
  };
  purchasePrice: number;
  unitCount: number;
  annualGrossRent: number;
  operatingExpenses: {
    ratesAndTaxes: number;
    waterAndElectricity: number;
    insurance: number;
    managementFees: number;
    repairsAndMaintenance: number;
    other: number;
  };
  maintenanceReserve: number;
  vacancyRate: number; // Percentage, e.g., 5 for 5%
  createdAt: Date;
}

// Type aliases for consistency
export type DealStatus = "REJECTED" | "BORDERLINE" | "ACCEPTED";

// Scoring related types
export type StressOutcome = {
  cashFlowAfterStress: number;
  totalStressesApplied: number;
  details: string[];
};

export type ComponentScores = {
  oey: number;
  payback: number;
  stressSurvival: number;
  expenseQuality: number;
  dealSimplicity: number;
  stockPremium: number;
};

export type Metrics = {
  oey: number;
  paybackYears: number;
  stockPremium: number;
  stressOutcome: StressOutcome;
};

// This matches what the scoring engine actually returns
export type ScoringResult = {
  finalScore: number;
  status: DealStatus;
  rejectReasons: string[];
  componentScores: ComponentScores;
  // metrics is optional because the scoring engine doesn't return it
  metrics?: Metrics;
};

// The complete deal that gets stored in IndexedDB
export type StoredDeal = DealInput & {
  result: ScoringResult;
};

// Legacy type (keep for backward compatibility)
export interface DealResult {
  // Core metrics
  grossRentalYield: number;
  grossRentMultiplier: number;
  noi: number;
  ownerEarnings: number;
  oey: number;
  paybackYears: number;

  // Stress test results
  stressTests: {
    vacancy: {
      originalOwnerEarnings: number;
      stressedOwnerEarnings: number;
      passed: boolean;
    };
    municipalUtilities: {
      originalOwnerEarnings: number;
      stressedOwnerEarnings: number;
      passed: boolean;
    };
    maintenanceSurge: {
      originalOwnerEarnings: number;
      stressedOwnerEarnings: number;
      passed: boolean;
    };
    worstCase: {
      scenario: "vacancy" | "municipal" | "maintenance" | "none";
      ownerEarnings: number;
      passed: boolean;
    };
  };

  // Scores
  componentScores: {
    oey: number;
    payback: number;
    stressSurvival: number;
    expenseQuality: number;
    dealSimplicity: number;
    stockPremium: number;
  };

  // Final results
  finalScore: number;
  status: DealStatus;
  autoRejectReasons: string[];
  stockYieldPremium: number;
}
