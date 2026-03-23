// EPIC 7: Configuration Layer
export const saConfig = {
  version: "1.0.0",

  // Stress test assumptions
  stressTests: {
    vacancyShock: 0.2, // 20% vacancy increase
    municipalIncrease: 0.15, // 15% increase in rates & utilities
    maintenanceSurge: 2.0, // 2x maintenance reserve
  },

  // Stock benchmark (SA Top 40 dividend yield)
  stockBenchmarkYield: 0.042, // 4.2%

  // OEY scoring table (locked thresholds)
  oeyScoring: [
    { threshold: 0.25, score: 30 },
    { threshold: 0.22, score: 27 },
    { threshold: 0.2, score: 24 },
    { threshold: 0.18, score: 21 },
    { threshold: 0.16, score: 18 },
    { threshold: 0.14, score: 15 },
    { threshold: 0.12, score: 12 },
    { threshold: 0.1, score: 9 },
    { threshold: 0.08, score: 6 },
    { threshold: 0.06, score: 3 },
    { threshold: 0, score: 0 },
  ],

  // Payback scoring table
  paybackScoring: [
    { threshold: 5, score: 20 },
    { threshold: 6, score: 18 },
    { threshold: 7, score: 16 },
    { threshold: 8, score: 14 },
    { threshold: 9, score: 12 },
    { threshold: 10, score: 10 },
    { threshold: 11, score: 8 },
    { threshold: 12, score: 6 },
    { threshold: 15, score: 4 },
    { threshold: 20, score: 2 },
    { threshold: Infinity, score: 0 },
  ],

  // Township modifiers (example)
  townshipModifiers: {
    Sandton: 1.0,
    "Pretoria East": 1.0,
    "Cape Town Southern Suburbs": 1.0,
    "Durban North": 1.0,
    // Add more as needed
  },
} as const;
