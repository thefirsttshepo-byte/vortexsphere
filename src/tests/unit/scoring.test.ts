import { describe, it, expect } from "vitest";
import { scoringEngine } from "../../core/scoring";

describe("Scoring Engine", () => {
  const goodDeal = {
    id: "test-good",
    name: "Good Deal",
    location: { township: "Test", municipality: "Test" },
    purchasePrice: 1000000,
    unitCount: 4,
    annualGrossRent: 180000, // 18% yield
    operatingExpenses: {
      ratesAndTaxes: 12000,
      waterAndElectricity: 8000,
      insurance: 4000,
      managementFees: 6000,
      repairsAndMaintenance: 5000,
      other: 2000,
    },
    maintenanceReserve: 10000,
    vacancyRate: 5,
    createdAt: new Date(),
  };

  it("should accept a good deal", () => {
    const result = scoringEngine(goodDeal);
    expect(result.status).toBe("ACCEPTED");
    expect(result.finalScore).toBeGreaterThanOrEqual(70);
  });
});
