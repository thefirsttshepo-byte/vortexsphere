import { describe, it, expect } from "vitest";
import {
  calculateNOI,
  calculateOwnerEarnings,
  calculateOEY,
  calculatePayback,
} from "../../core/calculations";

describe("Calculation Engine", () => {
  const mockDeal = {
    id: "test",
    name: "Test Deal",
    location: { township: "Test", municipality: "Test" },
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

  it("calculates NOI correctly", () => {
    const noi = calculateNOI(mockDeal);
    const effectiveRent = 120000 * 0.95; // 5% vacancy
    const totalExpenses = 12000 + 8000 + 4000 + 6000 + 5000 + 2000;
    expect(noi).toBe(effectiveRent - totalExpenses);
  });

  it("calculates owner earnings correctly", () => {
    const noi = calculateNOI(mockDeal);
    const ownerEarnings = calculateOwnerEarnings(mockDeal);
    expect(ownerEarnings).toBe(noi - mockDeal.maintenanceReserve);
  });

  it("calculates OEY correctly", () => {
    const ownerEarnings = calculateOwnerEarnings(mockDeal);
    const oey = calculateOEY(mockDeal);
    expect(oey).toBe(ownerEarnings / mockDeal.purchasePrice);
  });

  it("handles division by zero in OEY", () => {
    const zeroPriceDeal = { ...mockDeal, purchasePrice: 0 };
    const oey = calculateOEY(zeroPriceDeal);
    expect(oey).toBe(0);
  });

  it("calculates payback period correctly", () => {
    const ownerEarnings = calculateOwnerEarnings(mockDeal);
    const payback = calculatePayback(mockDeal);
    expect(payback).toBe(mockDeal.purchasePrice / ownerEarnings);
  });

  it("returns Infinity for negative owner earnings in payback", () => {
    const negativeDeal = { ...mockDeal, maintenanceReserve: 1000000 };
    const payback = calculatePayback(negativeDeal);
    expect(payback).toBe(Infinity);
  });
});
