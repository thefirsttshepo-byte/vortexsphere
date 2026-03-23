import { describe, it } from "vitest";
import fc from "fast-check";
import { scoringEngine } from "../../core/scoring";
import { DealInput } from "../../core/types";
import {
  calculateNOI,
  calculateOwnerEarnings,
  calculateOEY,
  calculatePayback,
} from "../../core/calculations";
import { evaluateWorstCaseStress } from "../../core/stressTests";

// Helper to create complete DealInput
function createDealInput(partial: Partial<DealInput>): DealInput {
  return {
    id: partial.id || `id-${Math.random()}`,
    name: partial.name || "Test Deal",
    location: partial.location || { township: "Test", municipality: "Test" },
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

// Arbitrary for operating expenses
const operatingExpensesArbitrary = fc.record({
  ratesAndTaxes: fc.float({ min: 0, max: 1000000 }),
  waterAndElectricity: fc.float({ min: 0, max: 1000000 }),
  insurance: fc.float({ min: 0, max: 1000000 }),
  managementFees: fc.float({ min: 0, max: 1000000 }),
  repairsAndMaintenance: fc.float({ min: 0, max: 1000000 }),
  other: fc.float({ min: 0, max: 1000000 }),
});

describe("Edge case property tests", () => {
  // Test with extreme values
  const extremeValuesArbitrary = fc
    .record({
      purchasePrice: fc.oneof(
        fc.constant(0),
        fc.constant(1),
        fc.constant(Number.MAX_SAFE_INTEGER),
        fc.float({ min: 0, max: 1000000000 })
      ),
      annualGrossRent: fc.oneof(
        fc.constant(0),
        fc.constant(0.01),
        fc.float({ min: 0, max: 1000000000 })
      ),
      operatingExpenses: operatingExpensesArbitrary,
      maintenanceReserve: fc.float({ min: 0, max: 1000000000 }),
      unitCount: fc.oneof(
        fc.constant(1),
        fc.constant(100),
        fc.integer({ min: 1, max: 1000 })
      ),
      vacancyRate: fc.float({ min: 0, max: 100 }),
    })
    .map((data) =>
      createDealInput({
        ...data,
        name: "Extreme Deal",
        location: { township: "Extreme", municipality: "Extreme" },
      })
    );

  it("No crashes with extreme inputs", () => {
    fc.assert(
      fc.property(extremeValuesArbitrary, (deal) => {
        try {
          scoringEngine(deal);
          return true; // No crash
        } catch {
          return false; // Crashed
        }
      }),
      { numRuns: 200 }
    );
  });

  it("Scoring is deterministic", () => {
    fc.assert(
      fc.property(extremeValuesArbitrary, (deal) => {
        const result1 = scoringEngine(deal);
        const result2 = scoringEngine(deal);
        return (
          result1.finalScore === result2.finalScore &&
          result1.status === result2.status
        );
      }),
      { numRuns: 100 }
    );
  });
});

describe("Business-specific properties", () => {
  // PROPERTY: Zero purchase price should have predictable metrics
  it("Zero purchase price deals have correct metrics", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1000000 }),
        operatingExpensesArbitrary,
        fc.float({ min: 0, max: 100 }),
        fc.float({ min: 0, max: 100000 }),
        (
          annualGrossRent,
          operatingExpenses,
          vacancyRate,
          maintenanceReserve
        ) => {
          const deal = createDealInput({
            purchasePrice: 0,
            annualGrossRent,
            operatingExpenses,
            vacancyRate,
            maintenanceReserve,
          });

          // Calculate metrics
          const oey = calculateOEY(deal);
          const payback = calculatePayback(deal);
          const ownerEarnings = calculateOwnerEarnings(deal);

          // OEY should be 0 for zero purchase price (as per your implementation)
          const oeyCorrect = oey === 0;

          // Payback logic:
          // - If ownerEarnings > 0: payback = 0 / positive = 0
          // - If ownerEarnings <= 0: payback = Infinity
          let paybackCorrect = false;
          if (ownerEarnings > 0) {
            paybackCorrect = payback === 0;
          } else {
            paybackCorrect = payback === Infinity;
          }

          return oeyCorrect && paybackCorrect;
        }
      ),
      { verbose: true }
    );
  });

  // Create a deal input arbitrary
  const dealInputArbitrary = fc
    .record({
      name: fc.string(),
      purchasePrice: fc.float({ min: 100000, max: 5000000 }),
      annualGrossRent: fc.float({ min: 0, max: 1000000 }),
      operatingExpenses: operatingExpensesArbitrary,
      maintenanceReserve: fc.float({ min: 0, max: 100000 }),
      unitCount: fc.integer({ min: 1, max: 20 }),
      vacancyRate: fc.float({ min: 0, max: 50 }), // percentage
    })
    .map((data) =>
      createDealInput({
        ...data,
        location: { township: "Test", municipality: "Test" },
      })
    );

  // PROPERTY: Negative cash flow under stress causes rejection
  it("Negative stress cash flow triggers auto-reject", () => {
    fc.assert(
      fc.property(dealInputArbitrary, (deal) => {
        const stressResult = evaluateWorstCaseStress(deal);
        const scoringResult = scoringEngine(deal);

        // If stress cash flow is negative, deal should be rejected
        if (stressResult.stressedEarnings < 0) {
          return scoringResult.status === "REJECTED";
        }
        return true; // If stress passes, could be any status
      })
    );
  });

  // PROPERTY: High vacancy rate (100%) results in zero effective rent
  it("100% vacancy results in zero effective rent", () => {
    fc.assert(
      fc.property(dealInputArbitrary, (deal) => {
        const dealWith100Vacancy = {
          ...deal,
          vacancyRate: 100,
        };
        const noi = calculateNOI(dealWith100Vacancy);
        // NOI should be negative (or zero) because effective rent is zero but expenses remain
        return noi <= 0;
      })
    );
  });

  // PROPERTY: Negative NOI results in negative owner earnings
  it("Negative NOI leads to negative owner earnings", () => {
    fc.assert(
      fc.property(dealInputArbitrary, (deal) => {
        // Create a deal with expenses > rent
        const badDeal = {
          ...deal,
          operatingExpenses: {
            ...deal.operatingExpenses,
            ratesAndTaxes: deal.annualGrossRent * 2, // Guarantee negative NOI
          },
        };
        const ownerEarnings = calculateOwnerEarnings(badDeal);
        return ownerEarnings < 0;
      })
    );
  });
});
