import React, { useEffect, useState } from "react";
import {
  ArrowUpDown,
  Filter,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileDown,
} from "lucide-react";
import { persistenceService } from "../../data/persistence/indexedDB";
import {
  mapDealToRankingRow,
  RankedDeal,
} from "../../core/adapters/mapDealToRankingRow";
import { PDFExportButton } from "../../components/PDFExportButton";
import { StoredDeal } from "../../core/types"; // Import StoredDeal

export const DealRankingScreen: React.FC = () => {
  const [storedDeals, setStoredDeals] = useState<StoredDeal[]>([]); // Changed to StoredDeal[]
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"score" | "oey" | "payback">("score");
  const [filter, setFilter] = useState<
    "ALL" | "ACCEPTED" | "BORDERLINE" | "REJECTED"
  >("ALL");

  // Load deals from IndexedDB and set up event listener
  useEffect(() => {
    const loadDeals = async () => {
      setIsLoading(true);
      try {
        const deals = await persistenceService.getAllDeals();
        setStoredDeals(deals);
      } catch (error) {
        console.error("Failed to load deals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeals();

    // Listen for deals-updated event from AddDealScreen
    const handleDealsUpdated = () => {
      loadDeals();
    };

    window.addEventListener("deals-updated", handleDealsUpdated);

    return () => {
      window.removeEventListener("deals-updated", handleDealsUpdated);
    };
  }, []);

  // Create ranked deals for display
  const rankedDeals = storedDeals.map(mapDealToRankingRow);

  const sortedRankedDeals = [...rankedDeals]
    .filter((deal) => filter === "ALL" || deal.status === filter)
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "oey") return b.oey - a.oey;
      return a.payback - b.payback;
    });

  // Find the corresponding StoredDeal for each RankedDeal
  const getStoredDealById = (id: string) => {
    return storedDeals.find((deal) => deal.id === id);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </span>
        );
      case "BORDERLINE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Borderline
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading deal rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deal Ranking</h2>
          <p className="text-gray-600 mt-1">
            Sorted by risk-adjusted owner earnings quality • No overrides
            allowed
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Filters */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="ALL">All Deals</option>
              <option value="ACCEPTED">Accepted Only</option>
              <option value="BORDERLINE">Borderline</option>
              <option value="REJECTED">Rejected Only</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="score">Sort by Score</option>
              <option value="oey">Sort by OEY</option>
              <option value="payback">Sort by Payback</option>
            </select>
          </div>

          {/* Export All Deals Button */}
          {sortedRankedDeals.length > 0 && (
            <button
              className="flex items-center space-x-2 text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onClick={() => {
                // This would need to be implemented - perhaps using your PDF services
                console.log("Export all deals:", sortedRankedDeals);
                // You would call your PDF generation service here
              }}
            >
              <FileDown className="h-4 w-4 text-gray-400" />
              <span>Export All</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Deal Name / Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Total Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  OEY
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Payback
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Stress Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Stock Premium
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Export
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedRankedDeals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      {rankedDeals.length === 0
                        ? "No deals have been analyzed yet. Add a deal to see rankings."
                        : "No deals match the selected filter."}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedRankedDeals.map((rankedDeal, index) => {
                  const storedDeal = getStoredDealById(rankedDeal.id);

                  return (
                    <tr
                      key={rankedDeal.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0
                                ? "bg-success-100 text-success-700 border-2 border-success-300"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            <span className="font-bold">{index + 1}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {rankedDeal.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {rankedDeal.location}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`w-24 h-2 bg-gray-200 rounded-full overflow-hidden`}
                          >
                            <div
                              className={`h-full ${
                                rankedDeal.score >= 70
                                  ? "bg-success-500"
                                  : rankedDeal.score >= 50
                                  ? "bg-warning-500"
                                  : "bg-danger-500"
                              }`}
                              style={{ width: `${rankedDeal.score}%` }}
                            />
                          </div>
                          <span className="ml-3 font-bold text-gray-900">
                            {rankedDeal.score}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {rankedDeal.oey >= 0.12 ? (
                            <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-danger-500 mr-1" />
                          )}
                          <span className="font-medium">
                            {(rankedDeal.oey * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium">
                          {rankedDeal.payback.toFixed(1)} yrs
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            rankedDeal.stressResult === "Passed"
                              ? "bg-success-100 text-success-800"
                              : "bg-danger-100 text-danger-800"
                          }`}
                        >
                          {rankedDeal.stressResult}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`font-medium ${
                            rankedDeal.stockPremium >= 0.03
                              ? "text-success-700"
                              : "text-danger-700"
                          }`}
                        >
                          +{(rankedDeal.stockPremium * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={rankedDeal.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {storedDeal ? (
                          <PDFExportButton
                            storedDeal={storedDeal}
                            analystName="Your Name Here"
                            notes={`Deal ranking position: ${index + 1}`}
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No export data
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-600">
            <div>
              Showing {sortedRankedDeals.length} deal
              {sortedRankedDeals.length !== 1 ? "s" : ""}
              {rankedDeals.length > 0 && ` of ${rankedDeals.length} total`}
            </div>
            <div className="mt-2 sm:mt-0 flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-success-500 mr-2"></div>
                <span>Accepted (≥70)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-warning-500 mr-2"></div>
                <span>Borderline</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-danger-500 mr-2"></div>
                <span>Rejected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
          <h4 className="font-medium text-primary-900 mb-2">
            Scoring Components
          </h4>
          <ul className="space-y-1 text-sm text-primary-700">
            <li>• OEY Score: 30 points</li>
            <li>• Payback Score: 20 points</li>
            <li>• Stress Survival: 25 points</li>
            <li>• Expense Quality: 10 points</li>
            <li>• Deal Simplicity: 10 points</li>
            <li>• Stock Premium: 5 points</li>
          </ul>
        </div>

        <div className="p-4 bg-success-50 border border-success-200 rounded-xl">
          <h4 className="font-medium text-success-900 mb-2">
            Acceptance Criteria
          </h4>
          <ul className="space-y-1 text-sm text-success-700">
            <li>• Pass all auto-reject gates</li>
            <li>• Final score ≥ 70</li>
            <li>• Positive cash flow under all stresses</li>
            <li>• Stock premium ≥ 3%</li>
          </ul>
        </div>

        <div className="p-4 bg-danger-50 border border-danger-200 rounded-xl">
          <h4 className="font-medium text-danger-900 mb-2">
            Auto-Reject Rules
          </h4>
          <ul className="space-y-1 text-sm text-danger-700">
            <li>• OEY &lt; 12% → Reject</li>
            <li>• Payback &gt; 12 years → Reject</li>
            <li>• Negative stress cash flow → Reject</li>
            <li>• Stock premium &lt; 3% → Reject</li>
          </ul>
        </div>
      </div>

      {/* Documentation & Reporting Section */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Documentation & Reporting</h3>
          {sortedRankedDeals.length > 0 && (
            <button
              className="flex items-center space-x-2 text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onClick={() => {
                // This would need to be implemented - perhaps using your PDF services
                console.log("Export comprehensive report:", sortedRankedDeals);
                // You would call your PDF generation service here with all deals
              }}
            >
              <FileDown className="h-4 w-4 text-gray-400" />
              <span>Export Full Report</span>
            </button>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Why save rejected deals?</strong> They create an audit trail
            of your discipline. Reviewing rejected deals helps identify market
            patterns and improves your investment criteria over time.
          </p>
        </div>
      </div>
    </div>
  );
};
