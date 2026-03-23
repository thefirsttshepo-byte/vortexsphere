import { Deal } from "../../data/models/dealModel";
import { ScoringResult } from "../../core/types";

const baseMockResult: ScoringResult = {
  finalScore: 70,
  status: "ACCEPTED",
  rejectReasons: [],
  componentScores: {
    oey: 12,
    payback: 12,
    stressSurvival: 25,
    expenseQuality: 10,
    dealSimplicity: 10,
    stockPremium: 3,
  },
  metrics: {
    // metrics is optional in ScoringResult
    oey: 0.15,
    paybackYears: 10,
    stockPremium: 0.05,
    stressOutcome: {
      cashFlowAfterStress: 10_000,
      totalStressesApplied: 3,
      details: ["Test stress detail"],
    },
  },
};

export const baseMockDeal: Deal = {
  id: "test-id",
  name: "Test Deal",
  createdAt: new Date(), // Changed from string to Date
  location: {
    township: "Test Town",
    municipality: "Test City",
  },
  purchasePrice: 1_000_000,
  annualGrossRent: 120_000,
  vacancyRate: 10,
  maintenanceReserve: 10_000,
  unitCount: 4,
  operatingExpenses: {
    ratesAndTaxes: 12_000,
    waterAndElectricity: 6_000,
    insurance: 3_000,
    managementFees: 0,
    repairsAndMaintenance: 5_000,
    other: 0,
  },
  result: baseMockResult,
  lastUpdated: new Date(),
  tags: [],
  notes: "",
};

export const mockDealWithScore = (score: number): Deal => ({
  ...baseMockDeal,
  result: {
    ...baseMockResult,
    finalScore: score,
    status: score >= 70 ? "ACCEPTED" : score >= 50 ? "BORDERLINE" : "REJECTED",
  },
});

export const mockDealWithStockPremium = (premium: number): Deal => ({
  ...baseMockDeal,
  result: {
    ...baseMockResult,
    componentScores: {
      ...baseMockResult.componentScores,
      stockPremium:
        premium >= 0.1
          ? 5
          : premium >= 0.08
          ? 4
          : premium >= 0.06
          ? 3
          : premium >= 0.04
          ? 2
          : premium >= 0.03
          ? 1
          : 0,
    },
    metrics: {
      ...baseMockResult.metrics!,
      stockPremium: premium,
    },
  },
});

export const mockDealWithStressCashFlow = (cashFlow: number): Deal => ({
  ...baseMockDeal,
  result: {
    ...baseMockResult,
    metrics: {
      ...baseMockResult.metrics!,
      stressOutcome: {
        cashFlowAfterStress: cashFlow,
        totalStressesApplied: 3,
        details: ["Test stress detail"],
      },
    },
  },
});
