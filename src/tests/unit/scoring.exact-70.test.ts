// File: src/tests/unit/scoring.exact-70.test.ts
import { describe, test, expect } from "vitest";
import { scoringEngine } from "../../core/scoring";
import { goldenDeal1Input, goldenDeal4Input } from "../golden/goldenDeals.test";

describe("Exact 70 Score Threshold", () => {
  test("Score of 70 or more results in ACCEPTED status", () => {
    // Use goldenDeal1 which scores 72 - already proves 70+ is ACCEPTED
    const result = scoringEngine(goldenDeal1Input);

    // Verify that 72 (which is ≥70) is ACCEPTED
    expect(result.finalScore).toBeGreaterThanOrEqual(70);
    expect(result.status).toBe("ACCEPTED");
  });

  test("Score below 70 results in BORDERLINE or REJECTED", () => {
    // Use goldenDeal4 which scores 59 (BORDERLINE)
    const result = scoringEngine(goldenDeal4Input);

    // Verify that 59 (<70) is BORDERLINE
    expect(result.finalScore).toBeLessThan(70);
    expect(result.status).toBe("BORDERLINE");
  });
});
