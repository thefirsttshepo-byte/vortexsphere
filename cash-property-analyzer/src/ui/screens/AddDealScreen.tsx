import React, { useState } from "react";
import { Calculator, AlertCircle, Check } from "lucide-react";
import {
  DealInput,
  StoredDeal,
  ScoringResult,
  DealStatus,
  Metrics,
  StressOutcome,
} from "../../core/types";
import { scoringEngine } from "../../core/scoring";
import { persistenceService } from "../../data/persistence/indexedDB";

export const AddDealScreen: React.FC = () => {
  const [step, setStep] = useState(1);
  const [deal, setDeal] = useState<Partial<DealInput>>({
    operatingExpenses: {
      ratesAndTaxes: 0,
      waterAndElectricity: 0,
      insurance: 0,
      managementFees: 0,
      repairsAndMaintenance: 0,
      other: 0,
    },
    vacancyRate: 5,
    location: {
      township: "",
      municipality: "",
    },
  });

  // Helper function to format number with commas
  const formatNumberWithCommas = (
    value: number | string | undefined
  ): string => {
    if (!value && value !== 0) return "";
    const numValue =
      typeof value === "string" ? value.replace(/,/g, "") : value;
    const num = Number(numValue);
    if (isNaN(num)) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper function to parse formatted number
  const parseFormattedNumber = (value: string): number => {
    const cleaned = value.replace(/,/g, "");
    return parseFloat(cleaned) || 0;
  };

  // Development-only logging
  if (process.env.NODE_ENV === "development") {
    console.log("Current deal state:", deal);
  }

  const [showModal, setShowModal] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScoringResult | null>(
    null
  );
  const [currentDeal, setCurrentDeal] = useState<StoredDeal | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Validation functions for each step
  const isStep1Valid = (): boolean => {
    return Boolean(
      deal.name?.trim() &&
        deal.purchasePrice !== undefined &&
        deal.purchasePrice !== null &&
        deal.purchasePrice > 0 &&
        deal.unitCount !== undefined &&
        deal.unitCount !== null &&
        deal.unitCount > 0 &&
        deal.annualGrossRent !== undefined &&
        deal.annualGrossRent !== null &&
        deal.annualGrossRent > 0
    );
  };

  const isStep2Valid = (): boolean => {
    return Boolean(
      deal.maintenanceReserve !== undefined &&
        deal.maintenanceReserve !== null &&
        deal.maintenanceReserve >= 0 &&
        deal.vacancyRate !== undefined &&
        deal.vacancyRate !== null &&
        deal.vacancyRate >= 0
    );
  };

  const isStep3Valid = (): boolean => {
    return Boolean(
      deal.location?.township?.trim() && deal.location?.municipality?.trim()
    );
  };

  const handleInputChange = (
    field:
      | keyof DealInput
      | `operatingExpenses.${keyof DealInput["operatingExpenses"]}`,
    value: any
  ) => {
    if (process.env.NODE_ENV === "development") {
      console.log("handleInputChange called:", field, value);
    }

    if ((field as string).startsWith("operatingExpenses.")) {
      const expenseField = (field as string).split(
        "."
      )[1] as keyof DealInput["operatingExpenses"];
      setDeal((prev: Partial<DealInput>) => ({
        ...prev,
        operatingExpenses: {
          ...prev.operatingExpenses!,
          [expenseField]: parseFormattedNumber(value),
        },
      }));
    } else {
      const fieldStr = field as string;
      const parsedValue =
        fieldStr.includes("Price") ||
        fieldStr.includes("Rent") ||
        fieldStr.includes("Count") ||
        fieldStr.includes("Reserve") ||
        fieldStr.includes("Rate")
          ? parseFormattedNumber(value)
          : value;

      setDeal((prev: Partial<DealInput>) => ({
        ...prev,
        [field]: parsedValue,
      }));
    }
  };

  // Calculate metrics from deal data
  const calculateMetrics = (dealInput: DealInput): Metrics => {
    // Calculate total operating expenses
    const totalOperatingExpenses = Object.values(
      dealInput.operatingExpenses
    ).reduce((sum, expense) => sum + expense, 0);

    // Calculate vacancy amount
    const vacancyAmount =
      (dealInput.vacancyRate / 100) * dealInput.annualGrossRent;

    // Calculate Net Operating Income (NOI)
    const noi =
      dealInput.annualGrossRent - totalOperatingExpenses - vacancyAmount;

    // Calculate Owner Earnings (after maintenance reserve)
    const ownerEarnings = noi - dealInput.maintenanceReserve;

    // Calculate Owner Earnings Yield (OEY)
    const oey =
      dealInput.purchasePrice > 0 ? ownerEarnings / dealInput.purchasePrice : 0;

    // Calculate Payback Years
    const paybackYears =
      ownerEarnings > 0 ? dealInput.purchasePrice / ownerEarnings : Infinity;

    // Calculate Stock Premium (OEY minus risk-free rate assumption of 10%)
    const stockPremium = oey - 0.1;

    // Simple stress test: check if owner earnings are positive under current conditions
    const stressOutcome: StressOutcome = {
      cashFlowAfterStress: ownerEarnings,
      totalStressesApplied: 1, // Basic stress test
      details:
        ownerEarnings >= 0
          ? ["Basic cash flow positive"]
          : ["Basic cash flow negative"],
    };

    return {
      oey,
      paybackYears,
      stockPremium,
      stressOutcome,
    };
  };

  const calculateDeal = async () => {
    if (process.env.NODE_ENV === "development") {
      console.log("calculateDeal called - Starting calculation...");
    }

    setIsCalculating(true);

    // Validate all required fields are filled
    const requiredFields = [
      "name",
      "location",
      "purchasePrice",
      "unitCount",
      "annualGrossRent",
      "maintenanceReserve",
    ] as const;

    const missingFields = requiredFields.filter((field) => {
      if (field === "location") {
        return !deal.location?.township || !deal.location?.municipality;
      }
      const value = deal[field];
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      if (process.env.NODE_ENV === "development") {
        console.log("Missing fields:", missingFields);
      }
      alert(`Please fill in the following fields: ${missingFields.join(", ")}`);
      setIsCalculating(false);
      return;
    }

    // Create complete deal object
    const completeDeal: DealInput = {
      id: `deal_${Date.now()}`,
      name: deal.name || "Unnamed Deal",
      location: {
        township: deal.location?.township || "",
        municipality: deal.location?.municipality || "",
      },
      purchasePrice: deal.purchasePrice || 0,
      unitCount: deal.unitCount || 0,
      annualGrossRent: deal.annualGrossRent || 0,
      operatingExpenses: {
        ratesAndTaxes: deal.operatingExpenses?.ratesAndTaxes || 0,
        waterAndElectricity: deal.operatingExpenses?.waterAndElectricity || 0,
        insurance: deal.operatingExpenses?.insurance || 0,
        managementFees: deal.operatingExpenses?.managementFees || 0,
        repairsAndMaintenance:
          deal.operatingExpenses?.repairsAndMaintenance || 0,
        other: deal.operatingExpenses?.other || 0,
      },
      maintenanceReserve: deal.maintenanceReserve || 0,
      vacancyRate: deal.vacancyRate || 5,
      createdAt: new Date(),
    };

    if (process.env.NODE_ENV === "development") {
      console.log("Complete deal object:", completeDeal);
    }

    // Calculate the result from scoring engine
    const scoringResult = scoringEngine(completeDeal);

    // Calculate metrics from deal data
    const metrics = calculateMetrics(completeDeal);

    // Combine scoring result with metrics
    const result: ScoringResult = {
      ...scoringResult,
      metrics,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("=== DEBUG: Scoring Engine Results ===");
      console.log("Scoring result status:", result.status);
      console.log("Rejection reasons:", result.rejectReasons);
      console.log("Component scores:", result.componentScores);
      console.log("Final score:", result.finalScore);
      console.log("Metrics:", result.metrics);
      console.log("=== END DEBUG ===");
    }

    // Create the full deal object
    const fullDeal: StoredDeal = {
      ...completeDeal,
      result,
    };

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Attempting to save deal to IndexedDB...");
      }
      // Save to IndexedDB
      await persistenceService.saveDeal(fullDeal);

      // 🔔 Notify the app that deals have been updated
      window.dispatchEvent(new Event("deals-updated"));

      if (process.env.NODE_ENV === "development") {
        console.log("Deal saved successfully and event dispatched");
      }

      // Show results to user
      if (process.env.NODE_ENV === "development") {
        console.log("Showing results modal...");
      }
      showResultsModal(result, fullDeal);
    } catch (error) {
      console.error("Error saving deal:", error);
      alert("Error saving deal. Please check console for details.");
    } finally {
      setIsCalculating(false);
    }
  };

  const showResultsModal = (result: ScoringResult, deal: StoredDeal) => {
    if (process.env.NODE_ENV === "development") {
      console.log("showResultsModal called with:", { result, deal });
    }
    setCurrentResult(result);
    setCurrentDeal(deal);
    setShowModal(true);
  };

  // Component max scores for progress bars
  const maxScores: Record<string, number> = {
    oey: 30,
    payback: 25,
    stressSurvival: 25,
    expenseQuality: 10,
    dealSimplicity: 10,
    stockPremium: 5,
  };

  // Type the expenseFields array with specific key types
  const expenseFields: {
    key: keyof DealInput["operatingExpenses"];
    label: string;
    icon: string;
  }[] = [
    { key: "ratesAndTaxes", label: "Rates & Taxes", icon: "🏛️" },
    { key: "waterAndElectricity", label: "Water & Electricity", icon: "💧" },
    { key: "insurance", label: "Insurance", icon: "🛡️" },
    { key: "managementFees", label: "Management Fees", icon: "👨‍💼" },
    {
      key: "repairsAndMaintenance",
      label: "Repairs & Maintenance",
      icon: "🔧",
    },
    { key: "other", label: "Other Expenses", icon: "📊" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Deal</h2>
            <p className="text-gray-600 mt-1">
              Step-by-step analysis • No leverage • No IRR • No overrides
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      s === step
                        ? "bg-primary-600 text-white"
                        : s < step
                        ? "bg-success-100 text-success-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {s < step ? <Check className="h-4 w-4" /> : s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`w-12 h-0.5 mx-2 ${
                        s < step ? "bg-success-300" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Property Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Name
                </label>
                <input
                  type="text"
                  value={deal.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 4-plex in Pretoria East"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Count
                </label>
                <input
                  type="number"
                  value={deal.unitCount || ""}
                  onChange={(e) =>
                    handleInputChange("unitCount", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Number of units"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Price (ZAR)
                </label>
                <input
                  type="text"
                  value={formatNumberWithCommas(deal.purchasePrice)}
                  onChange={(e) =>
                    handleInputChange("purchasePrice", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2,500,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Gross Rent (ZAR)
                </label>
                <input
                  type="text"
                  value={formatNumberWithCommas(deal.annualGrossRent)}
                  onChange={(e) =>
                    handleInputChange("annualGrossRent", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 360,000"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => isStep1Valid() && setStep(2)}
                disabled={!isStep1Valid()}
                className={`px-6 py-2.5 font-medium rounded-lg transition-colors ${
                  isStep1Valid()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next: Expenses
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Operating Expenses (Annual)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expenseFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mr-2">{field.icon}</span>
                    {field.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      R
                    </span>
                    <input
                      type="text"
                      value={formatNumberWithCommas(
                        deal.operatingExpenses?.[field.key] || ""
                      )}
                      onChange={(e) =>
                        handleInputChange(
                          `operatingExpenses.${field.key}`,
                          e.target.value
                        )
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance Reserve (Annual)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    R
                  </span>
                  <input
                    type="text"
                    value={formatNumberWithCommas(deal.maintenanceReserve)}
                    onChange={(e) =>
                      handleInputChange("maintenanceReserve", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 20,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vacancy Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={deal.vacancyRate || ""}
                    onChange={(e) =>
                      handleInputChange("vacancyRate", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 5"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => isStep2Valid() && setStep(3)}
                disabled={!isStep2Valid()}
                className={`px-6 py-2.5 font-medium rounded-lg transition-colors ${
                  isStep2Valid()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next: Location & Analysis
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Location & Final Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Township / Suburb
                </label>
                <input
                  type="text"
                  value={deal.location?.township || ""}
                  onChange={(e) =>
                    setDeal((prev: Partial<DealInput>) => ({
                      ...prev,
                      location: {
                        township: e.target.value,
                        municipality: prev.location?.municipality || "",
                      },
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Pretoria East, Sandton, Khayelitsha"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the commonly used suburb or township name
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Municipality
                </label>
                <input
                  type="text"
                  value={deal.location?.municipality || ""}
                  onChange={(e) =>
                    setDeal((prev: Partial<DealInput>) => ({
                      ...prev,
                      location: {
                        township: prev.location?.township || "",
                        municipality: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., City of Tshwane"
                />
              </div>
            </div>

            {/* Quick Analysis Preview */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-blue-600" />
                Quick Analysis Preview
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-sm text-gray-600">Gross Yield</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {deal.purchasePrice && deal.annualGrossRent
                      ? (
                          (deal.annualGrossRent / deal.purchasePrice) *
                          100
                        ).toFixed(1) + "%"
                      : "--"}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-sm text-gray-600">Rent Multiplier</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {deal.purchasePrice && deal.annualGrossRent
                      ? (deal.purchasePrice / deal.annualGrossRent).toFixed(1)
                      : "--"}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-sm text-gray-600">Monthly Rent</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {deal.annualGrossRent
                      ? "R " +
                        Math.round(deal.annualGrossRent / 12).toLocaleString()
                      : "--"}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-sm text-gray-600">Per Unit</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {deal.annualGrossRent && deal.unitCount
                      ? "R " +
                        Math.round(
                          deal.annualGrossRent / deal.unitCount / 12
                        ).toLocaleString()
                      : "--"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={calculateDeal}
                disabled={isCalculating || !isStep3Valid()}
                className={`px-6 py-2.5 font-medium rounded-lg transition-colors flex items-center ${
                  isStep3Valid() && !isCalculating
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-5 w-5 mr-2" />
                    Calculate Full Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rules Reminder */}
      <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 shrink-0" />
          <div>
            <h4 className="font-medium text-red-900">
              Auto-Reject Rules Active
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-red-700">
              <li>• OEY &lt; 12% → Reject</li>
              <li>• Payback &gt; 12 years → Reject</li>
              <li>• Negative cash flow under stress → Reject</li>
              <li>• Stock premium &lt; 3% → Reject</li>
            </ul>
            <p className="mt-2 text-xs text-red-600">
              These gates cannot be bypassed. No override functionality exists.
            </p>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Deal Analysis Results
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {currentResult ? (
                <>
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-xl mb-6 ${
                      currentResult.status === "ACCEPTED"
                        ? "bg-green-50 border border-green-200"
                        : currentResult.status === "BORDERLINE"
                        ? "bg-yellow-50 border border-yellow-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-lg">
                          {currentResult.status === "ACCEPTED"
                            ? "✅ Deal Accepted"
                            : currentResult.status === "BORDERLINE"
                            ? "⚠️ Deal Borderline"
                            : "❌ Deal Rejected"}
                        </h4>
                        <p className="text-sm mt-1">
                          {currentResult.status === "ACCEPTED"
                            ? "This deal meets all criteria and scores above 70 points."
                            : currentResult.status === "BORDERLINE"
                            ? "This deal meets minimum requirements but scores below 70 points."
                            : "This deal fails one or more auto-reject rules."}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">
                          {currentResult.finalScore}
                          <span className="text-sm font-normal text-gray-600">
                            /100
                          </span>
                        </div>
                      </div>
                    </div>

                    {currentResult.rejectReasons.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-semibold text-sm mb-2">
                          Rejection Reasons:
                        </h5>
                        <ul className="space-y-1">
                          {currentResult.rejectReasons.map(
                            (reason: string, index: number) => (
                              <li
                                key={index}
                                className="text-sm flex items-start"
                              >
                                <span className="text-red-500 mr-2">•</span>
                                {reason}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-600">
                        Owner Earnings Yield Score
                      </div>
                      <div className="text-xl font-bold">
                        {currentResult.componentScores.oey}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-600">Payback Score</div>
                      <div className="text-xl font-bold">
                        {currentResult.componentScores.payback}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-600">
                        Stock Premium Score
                      </div>
                      <div className="text-xl font-bold">
                        {currentResult.componentScores.stockPremium}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-600">Stress Test</div>
                      <div className="text-xl font-bold">
                        {currentResult.metrics?.stressOutcome
                          ?.cashFlowAfterStress ?? -1 >= 0
                          ? "Passed"
                          : "Failed"}
                      </div>
                    </div>
                  </div>

                  {/* Component Scores */}
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-900 mb-3">
                      Component Scores:
                    </h5>
                    <div className="space-y-3">
                      {currentResult.componentScores &&
                        Object.entries(currentResult.componentScores).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <div className="flex items-center">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mr-3">
                                  <div
                                    className={`h-full ${
                                      (value as number) >= 15
                                        ? "bg-green-500"
                                        : (value as number) >= 10
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        ((value as number) / maxScores[key] ||
                                          30) * 100,
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>
                                <span className="font-medium w-8 text-right">
                                  {value as number}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading results...</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setStep(1);
                    setDeal({
                      operatingExpenses: {
                        ratesAndTaxes: 0,
                        waterAndElectricity: 0,
                        insurance: 0,
                        managementFees: 0,
                        repairsAndMaintenance: 0,
                        other: 0,
                      },
                      vacancyRate: 5,
                      location: {
                        township: "",
                        municipality: "",
                      },
                    });
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Add Another Deal
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    // Navigate to ranking view
                    window.dispatchEvent(new Event("deals-updated"));
                    alert("View Deal Ranking screen to see all deals");
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View All Deals
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
