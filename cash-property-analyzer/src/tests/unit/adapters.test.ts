import { describe, test, expect } from "vitest";
import { mapDealToRankingRow } from "../../core/adapters/mapDealToRankingRow";
import { Deal } from "../../data/models/dealModel";

const mockStoredDeal: Deal = {
  id: "1",
  name: "Test Deal",
  createdAt: new Date(), // Date, not string
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
  result: {
    finalScore: 75,
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
      oey: 0.15,
      paybackYears: 10,
      stockPremium: 0.05,
      stressOutcome: {
        cashFlowAfterStress: 5_000,
        totalStressesApplied: 3,
        details: ["Test stress"],
      },
    },
  },
  lastUpdated: new Date(),
  tags: [],
  notes: "",
};

describe("Deal Ranking Adapter", () => {
  test("Maps stored deal to ranking row correctly", () => {
    const ranked = mapDealToRankingRow(mockStoredDeal);

    expect(ranked.id).toBe("1");
    expect(ranked.name).toBe("Test Deal");
    expect(ranked.location).toBe("Test Town, Test City");
    expect(ranked.score).toBe(75);
    expect(ranked.status).toBe("ACCEPTED");
    expect(ranked.stressResult).toBe("Passed");
  });
});
