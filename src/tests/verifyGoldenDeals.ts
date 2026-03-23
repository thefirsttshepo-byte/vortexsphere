// Create this file: src/tests/verifyGoldenDeals.ts
import { scoringEngine } from "../core/scoring";
import {
  calculateOEY,
  calculatePayback,
  calculateOwnerEarnings,
} from "../core/calculations";

const goldenDeals = [
  {
    id: "golden-1",
    name: "4-plex in Pretoria East",
    purchasePrice: 2000000,
    unitCount: 4,
    annualGrossRent: 360000,
    operatingExpenses: {
      ratesAndTaxes: 24000,
      waterAndElectricity: 16000,
      insurance: 8000,
      managementFees: 18000,
      repairsAndMaintenance: 12000,
      other: 4000,
    },
    maintenanceReserve: 20000,
    vacancyRate: 5,
  },
  {
    id: "golden-2",
    name: "Duplex in Randburg",
    purchasePrice: 1500000,
    unitCount: 2,
    annualGrossRent: 210000,
    operatingExpenses: {
      ratesAndTaxes: 18000,
      waterAndElectricity: 12000,
      insurance: 6000,
      managementFees: 10500,
      repairsAndMaintenance: 9000,
      other: 3000,
    },
    maintenanceReserve: 15000,
    vacancyRate: 8,
  },
  {
    id: "golden-3",
    name: "Single Unit in Expensive Area",
    purchasePrice: 8000000,
    unitCount: 1,
    annualGrossRent: 480000,
    operatingExpenses: {
      ratesAndTaxes: 60000,
      waterAndElectricity: 24000,
      insurance: 12000,
      managementFees: 24000,
      repairsAndMaintenance: 20000,
      other: 8000,
    },
    maintenanceReserve: 40000,
    vacancyRate: 15,
  },
  {
    id: "golden-4",
    name: "Triplex in Moderate Area",
    purchasePrice: 2250000,
    unitCount: 3,
    annualGrossRent: 315000,
    operatingExpenses: {
      ratesAndTaxes: 25200,
      waterAndElectricity: 16800,
      insurance: 8400,
      managementFees: 15750,
      repairsAndMaintenance: 12600,
      other: 4200,
    },
    maintenanceReserve: 22500,
    vacancyRate: 7,
  },
  {
    id: "golden-5",
    name: "6-Plex in Growth Area",
    purchasePrice: 3000000,
    unitCount: 6,
    annualGrossRent: 540000,
    operatingExpenses: {
      ratesAndTaxes: 36000,
      waterAndElectricity: 24000,
      insurance: 12000,
      managementFees: 27000,
      repairsAndMaintenance: 18000,
      other: 6000,
    },
    maintenanceReserve: 30000,
    vacancyRate: 4,
  },
];

console.log("=== VERIFYING GOLDEN DEALS SCORES ===\n");

goldenDeals.forEach((dealInput: any) => {
  const deal = {
    ...dealInput,
    location: { township: "Test", municipality: "Test" },
    createdAt: new Date(),
    id: dealInput.id,
    name: dealInput.name,
  };

  console.log(`\n=== ${deal.name} ===`);

  // Calculate manually for verification
  const ownerEarnings = calculateOwnerEarnings(deal);
  const oey = calculateOEY(deal);
  const payback = calculatePayback(deal);

  console.log("Owner Earnings:", ownerEarnings);
  console.log("OEY:", (oey * 100).toFixed(2) + "%");
  console.log("Payback:", payback.toFixed(2), "years");

  const result = scoringEngine(deal);
  console.log("Status:", result.status);
  console.log("Score:", result.finalScore);

  if (result.status !== "REJECTED") {
    console.log("Component Scores:", result.componentScores);
  } else {
    console.log("Reject Reasons:", result.rejectReasons);
  }
});
