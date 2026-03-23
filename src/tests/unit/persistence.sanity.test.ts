import { describe, test, expect } from "vitest";
import { persistenceService } from "../../data/persistence/indexedDB";

describe("Persistence Layer – Sanity", () => {
  test("Saving and retrieving a deal works", async () => {
    const deal = { id: "test", createdAt: new Date().toISOString() };

    await persistenceService.saveDeal(deal);
    const fetched = await persistenceService.getDeal("test");

    expect(fetched).toBeTruthy();
  });
});
