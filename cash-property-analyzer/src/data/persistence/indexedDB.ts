// EPIC 8: Persistence Layer
import localforage from "localforage";

const DEAL_STORE = "property_deals";

// Configure localforage
localforage.config({
  name: "CashPropertyAnalyzer",
  storeName: DEAL_STORE,
  description: "Offline storage for property deals",
});

export const persistenceService = {
  // Save a deal
  async saveDeal(deal: any): Promise<void> {
    await localforage.setItem(deal.id, deal);
  },

  // Get all deals
  async getAllDeals(): Promise<any[]> {
    const deals: any[] = [];
    await localforage.iterate((value) => {
      deals.push(value);
    });
    return deals.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Get deal by ID
  async getDeal(id: string): Promise<any | null> {
    return await localforage.getItem(id);
  },

  // Delete deal
  async deleteDeal(id: string): Promise<void> {
    await localforage.removeItem(id);
  },

  // Export all deals as JSON
  async exportDeals(): Promise<string> {
    const deals = await this.getAllDeals();
    const exportData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      dealCount: deals.length,
      deals,
    };
    return JSON.stringify(exportData, null, 2);
  },

  // Export all deals as CSV
  async exportDealsCSV(): Promise<string> {
    const deals = await this.getAllDeals();

    if (deals.length === 0) return "";

    // Define CSV headers
    const headers = [
      "Name",
      "Location",
      "Purchase Price",
      "Annual Gross Rent",
      "OEY",
      "Payback Years",
      "Stock Premium",
      "Status",
      "Score",
      "Created At",
    ];

    // Map deals to CSV rows
    const rows = deals.map((deal) => [
      deal.name || "",
      `${deal.location?.township || ""}, ${deal.location?.municipality || ""}`,
      deal.purchasePrice?.toString() || "0",
      deal.annualGrossRent?.toString() || "0",
      deal.result?.metrics?.oey?.toString() || "0",
      deal.result?.metrics?.paybackYears?.toString() || "0",
      deal.result?.metrics?.stockPremium?.toString() || "0",
      deal.result?.status || "",
      deal.result?.finalScore?.toString() || "0",
      new Date(deal.createdAt).toLocaleDateString(),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return csvContent;
  },

  // Import deals from JSON
  async importDeals(
    jsonString: string
  ): Promise<{ success: boolean; count: number }> {
    try {
      const data = JSON.parse(jsonString);

      if (!data.deals || !Array.isArray(data.deals)) {
        throw new Error("Invalid import format");
      }

      // Clear existing data
      await localforage.clear();

      // Import new deals
      for (const deal of data.deals) {
        await this.saveDeal(deal);
      }

      return { success: true, count: data.deals.length };
    } catch (error) {
      console.error("Import failed:", error);
      return { success: false, count: 0 };
    }
  },

  // Get statistics
  async getStats(): Promise<{
    totalDeals: number;
    accepted: number;
    rejected: number;
    borderline: number;
  }> {
    const deals = await this.getAllDeals();
    return {
      totalDeals: deals.length,
      accepted: deals.filter((d) => d.result?.status === "ACCEPTED").length,
      rejected: deals.filter((d) => d.result?.status === "REJECTED").length,
      borderline: deals.filter((d) => d.result?.status === "BORDERLINE").length,
    };
  },
};
