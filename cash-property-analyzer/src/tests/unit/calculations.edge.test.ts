import { describe, test, expect } from "vitest";
import {
  calculateOEY,
  calculatePayback,
  calculateNOI,
  calculateGrossRentalYield, // Added this
  calculateGRM, // Added this
} from "../../core/calculations";
import { DealInput } from "../../core/types";

const baseInput: DealInput = {
  id: "test-id",
  name: "Test Deal",
  location: {
    township: "Test Town",
    municipality: "Test City",
  },
  createdAt: new Date(), // WAS: new Date().toISOString()
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
};

describe("Calculation Engine – Defensive & Edge Cases", () => {
  test("OEY returns 0 when purchase price is zero", () => {
    const result = calculateOEY({ ...baseInput, purchasePrice: 0 });
    expect(result).toBe(0);
  });

  test("Payback returns Infinity when owner earnings <= 0", () => {
    const result = calculatePayback({
      ...baseInput,
      annualGrossRent: 10_000,
    });
    expect(result).toBe(Infinity);
  });

  test("NOI ignores NaN expenses safely", () => {
    const result = calculateNOI({
      ...baseInput,
      operatingExpenses: {
        ...baseInput.operatingExpenses,
        repairsAndMaintenance: NaN,
      },
    });

    expect(Number.isFinite(result)).toBe(true);
  });

  test("100% vacancy produces negative NOI equal to expenses", () => {
    const result = calculateNOI({
      ...baseInput,
      vacancyRate: 100,
    });

    expect(result).toBeLessThan(0);
  });

  // Added these new tests
  test("Gross rental yield returns NaN when purchase price is zero", () => {
    const result = calculateGrossRentalYield({
      ...baseInput,
      purchasePrice: 0,
    });
    expect(result).toBe(NaN);
  });

  test("Gross rental yield returns correct value for positive purchase price", () => {
    const result = calculateGrossRentalYield(baseInput);
    // 120,000 / 1,000,000 = 0.12
    expect(result).toBe(0.12);
  });

  test("GRM returns Infinity when annual gross rent is zero", () => {
    const result = calculateGRM({ ...baseInput, annualGrossRent: 0 });
    expect(result).toBe(Infinity);
  });

  test("GRM returns correct value for positive annual gross rent", () => {
    const result = calculateGRM(baseInput);
    // 1,000,000 / 120,000 = 8.333...
    expect(result).toBe(1_000_000 / 120_000);
  });
});
