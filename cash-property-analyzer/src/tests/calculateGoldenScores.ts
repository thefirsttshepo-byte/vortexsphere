import { scoringEngine } from "../core/scoring";
import {
  calculateOEY,
  calculatePayback,
  calculateOwnerEarnings,
} from "../core/calculations";

const deals = [
  {
    id: "golden-1",
    name: "4-plex in Pretoria East",
    purchasePrice: 2000000,
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
  // Add more deals here
];

deals.forEach((dealInput: any) => {
  const deal = {
    ...dealInput,
    location: { township: "Test", municipality: "Test" },
    unitCount: 4,
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
