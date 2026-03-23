import { describe, it, expect } from "vitest";
import { DealInput } from "../../core/types";
import { scoringEngine } from "../../core/scoring";
import { persistenceService } from "../../data/persistence/indexedDB";

describe("Full Pipeline Integration Test", () => {
  it("should process input → calculate → score → persist end-to-end", async () => {
    // Test deal input
    const dealInput: DealInput = {
      id: "integration-test-1",
      name: "Integration Test Deal",
      location: {
        township: "Test Township",
        municipality: "Test Municipality",
      },
      purchasePrice: 1000000,
      unitCount: 4,
      annualGrossRent: 120000,
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

    // Step 1: Calculate and score
    const result = scoringEngine(dealInput);

    // Verify scoring worked
    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("finalScore");
    expect(result).toHaveProperty("componentScores");

    // Step 2: Create complete deal object
    const completeDeal = {
      ...dealInput,
      result,
    };

    // Step 3: Test persistence (in-memory test)
    await persistenceService.saveDeal(completeDeal);
    const retrievedDeals = await persistenceService.getAllDeals();

    // Verify deal was processed
    expect(retrievedDeals.length).toBeGreaterThan(0);

    // Clean up (for test environment)
    await persistenceService.deleteDeal(dealInput.id);
  });

  it("should handle auto-reject gates correctly", () => {
    // Deal that should be rejected
    const badDeal: DealInput = {
      id: "reject-test-1",
      name: "Rejected Deal",
      location: {
        township: "Test",
        municipality: "Test",
      },
      purchasePrice: 1000000,
      unitCount: 2,
      annualGrossRent: 50000, // Very low yield
      operatingExpenses: {
        ratesAndTaxes: 20000,
        waterAndElectricity: 10000,
        insurance: 5000,
        managementFees: 5000,
        repairsAndMaintenance: 10000,
        other: 5000,
      },
      maintenanceReserve: 20000,
      vacancyRate: 10,
      createdAt: new Date(),
    };

    const result = scoringEngine(badDeal);
    expect(result.status).toBe("REJECTED");
    expect(result.rejectReasons.length).toBeGreaterThan(0);
  });
});
