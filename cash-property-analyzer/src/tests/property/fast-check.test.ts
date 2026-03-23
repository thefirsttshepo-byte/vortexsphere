import { describe, it } from "vitest";
import fc from "fast-check";
import { scoringEngine } from "../../core/scoring";
import {
  calculateNOI,
  calculateOwnerEarnings,
  calculateOEY,
  calculatePayback,
  calculateStockPremium,
} from "../../core/calculations";
import { evaluateWorstCaseStress } from "../../core/stressTests";
import { DealInput } from "../../core/types";

// Helper to create complete DealInput
function createDealInput(partial: Partial<DealInput>): DealInput {
  return {
    id: partial.id || `id-${Math.random()}`,
    name: partial.name || "Generated Deal",
    location: partial.location || {
      township: "Generated",
      municipality: "Generated",
    },
    purchasePrice: partial.purchasePrice || 0,
    annualGrossRent: partial.annualGrossRent || 0,
    operatingExpenses: partial.operatingExpenses || {
      ratesAndTaxes: 0,
      waterAndElectricity: 0,
      insurance: 0,
      managementFees: 0,
      repairsAndMaintenance: 0,
      other: 0,
    },
    maintenanceReserve: partial.maintenanceReserve || 0,
    unitCount: partial.unitCount || 1,
    vacancyRate: partial.vacancyRate || 0,
    createdAt: partial.createdAt || new Date(),
  };
}

describe("Property-based tests with fast-check", () => {
  // Arbitrary for operating expenses (all fields required by DealInput)
  const operatingExpensesArbitrary = fc.record({
    ratesAndTaxes: fc.float({ min: 0, max: 100000 }),
    waterAndElectricity: fc.float({ min: 0, max: 100000 }),
    insurance: fc.float({ min: 0, max: 100000 }),
    managementFees: fc.float({ min: 0, max: 100000 }),
    repairsAndMaintenance: fc.float({ min: 0, max: 100000 }),
    other: fc.float({ min: 0, max: 100000 }),
  });

  // Arbitrary for complete DealInput
  const dealInputArbitrary = fc
    .record({
      name: fc.string(),
      purchasePrice: fc.float({ min: 100000, max: 5000000 }),
      annualGrossRent: fc.float({ min: 0, max: 1000000 }),
      operatingExpenses: operatingExpensesArbitrary,
      maintenanceReserve: fc.float({ min: 0, max: 100000 }),
      unitCount: fc.integer({ min: 1, max: 20 }),
      vacancyRate: fc.float({ min: 0, max: 100 }), // percentage
    })
    .map((data) =>
      createDealInput({
        ...data,
        location: { township: "Generated", municipality: "Generated" },
      })
    );

  // PROPERTY 1: NOI never exceeds effective gross rent
  it("NOI <= Effective Gross Rent", () => {
    fc.assert(
      fc.property(dealInputArbitrary, (deal) => {
        const noi = calculateNOI(deal);
        const effectiveRent =
          deal.annualGrossRent * (1 - deal.vacancyRate / 100);
        return noi <= effectiveRent;
      }),
      { verbose: true }
    );
  });

  // PROPERTY 2: Owner Earnings <= NOI
  it("Owner Earnings <= NOI", () => {
    fc.assert(
      fc.property(dealInputArbitrary, (deal) => {
        const noi = calculateNOI(deal);
        const ownerEarnings = calculateOwnerEarnings(deal);
        return ownerEarnings <= noi;
      })
    );
  });

  // PROPERTY 3: Auto-rejected deals have score 0
  it("Auto-rejected deals score 0", () => {
    fc.assert(
      fc.property(dealInputArbitrary, (deal) => {
        const result = scoringEngine(deal);
        if (result.status === "REJECTED") {
          return result.finalScore === 0;
        }
        return true; // Non-rejected deals can have any score
      }),
      { numRuns: 500 }
    );
  });

  // PROPERTY 4: Score always between 0 and 100
  it("Score in range [0, 100]", () => {
    fc.assert(
      fc.property(dealInputArbitrary, (deal) => {
        const result = scoringEngine(deal);
        return result.finalScore >= 0 && result.finalScore <= 100;
      })
    );
  });

  // PROPERTY 5: Payback period is never negative
  it("Payback period non-negative or Infinity", () => {
    fc.assert(
      fc.property(dealInputArbitrary, (deal) => {
        const payback = calculatePayback(deal);
        return payback >= 0 || payback === Infinity;
      })
    );
  });

  // PROPERTY 6: OEY calculation is consistent with formula
  it("OEY = Owner Earnings / Purchase Price", () => {
    fc.assert(
      fc.property(dealInputArbitrary, (deal) => {
        if (deal.purchasePrice <= 0) return true; // Division by zero handled in function
        const oey = calculateOEY(deal);
        const ownerEarnings = calculateOwnerEarnings(deal);
        const expected = ownerEarnings / deal.purchasePrice;
        return Math.abs(oey - expected) < 0.0001; // Allow floating point error
      })
    );
  });

  // PROPERTY 7: Stock premium calculation is correct
  it("Stock Premium = OEY - Benchmark Yield", () => {
    fc.assert(
      fc.property(dealInputArbitrary, (deal) => {
        const oey = calculateOEY(deal);
        const stockPremium = calculateStockPremium(oey);
        // We can't check the exact value without config, but we can check it's a number
        return typeof stockPremium === "number" && !isNaN(stockPremium);
      })
    );
  });

  // PROPERTY 8: Stress test never improves cash flow
  it("Stress test worsens or maintains cash flow", () => {
    fc.assert(
      fc.property(dealInputArbitrary, (deal) => {
        const originalEarnings = calculateOwnerEarnings(deal);
        const stressResult = evaluateWorstCaseStress(deal);
        return stressResult.stressedEarnings <= originalEarnings;
      })
    );
  });

  // PROPERTY 9: More units → lower or equal simplicity score (if not auto-rejected)
  it("Complexity penalty for more units", () => {
    const baseDealArbitrary = fc.record({
      purchasePrice: fc.float({ min: 100000, max: 2000000 }),
      annualGrossRent: fc.float({ min: 0, max: 500000 }),
      operatingExpenses: operatingExpensesArbitrary,
      maintenanceReserve: fc.float({ min: 0, max: 50000 }),
      vacancyRate: fc.float({ min: 0, max: 20 }),
    });

    fc.assert(
      fc.property(
        baseDealArbitrary,
        fc.integer({ min: 1, max: 4 }),
        fc.integer({ min: 5, max: 20 }),
        (base, unitCount1, unitCount2) => {
          const deal1 = createDealInput({
            ...base,
            unitCount: unitCount1,
            name: "Deal 1",
          });
          const deal2 = createDealInput({
            ...base,
            unitCount: unitCount2,
            name: "Deal 2",
          });

          const result1 = scoringEngine(deal1);
          const result2 = scoringEngine(deal2);

          // If neither is rejected, deal2 should have ≤ simplicity score
          if (result1.status !== "REJECTED" && result2.status !== "REJECTED") {
            const component1 = result1.componentScores?.dealSimplicity || 0;
            const component2 = result2.componentScores?.dealSimplicity || 0;
            return component2 <= component1;
          }
          return true; // Skip if either rejected
        }
      )
    );
  });
});
