// Create a debug file: src/tests/debug.ts
import { scoringEngine } from "../core/scoring";

// Golden Deal 1
const goldenDeal1 = {
  id: "golden-1",
  name: "4-plex in Pretoria East",
  location: {
    township: "Pretoria East",
    municipality: "City of Tshwane",
  },
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
  createdAt: new Date("2024-01-15"),
};

// Golden Deal 2
const goldenDeal2 = {
  id: "golden-2",
  name: "Duplex in Randburg",
  location: {
    township: "Randburg",
    municipality: "City of Johannesburg",
  },
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
  createdAt: new Date("2024-02-20"),
};

console.log("Golden Deal 1 Results:");
const result1 = scoringEngine(goldenDeal1);
console.log("Status:", result1.status);
console.log("Score:", result1.finalScore);
console.log("Reject Reasons:", result1.rejectReasons);
console.log("Component Scores:", result1.componentScores);

console.log("\nGolden Deal 2 Results:");
const result2 = scoringEngine(goldenDeal2);
console.log("Status:", result2.status);
console.log("Score:", result2.finalScore);
console.log("Reject Reasons:", result2.rejectReasons);
console.log("Component Scores:", result2.componentScores);
