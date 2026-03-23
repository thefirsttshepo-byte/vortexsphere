import React from "react";
import { Download } from "lucide-react";
import { generateDealReportPDF, DealReportData } from "../services/pdf";
import { StoredDeal } from "../core/types";

interface PDFExportButtonProps {
  storedDeal: StoredDeal; // Changed from deal: DealInput
  analystName?: string;
  notes?: string;
  className?: string;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  storedDeal,
  analystName = "Investment Analyst",
  notes = "",
  className = "",
}) => {
  const handleGeneratePDF = () => {
    const { result, ...deal } = storedDeal; // Destructure to get deal and result
    
    const reportData: DealReportData = {
      deal,
      result,
      analysisDate: new Date(),
      analystName,
      notes,
      propertyCondition: "Good", // These would come from your UI
      tenantQuality: "B",
      followUpActions:
        result.status === "ACCEPTED"
          ? [
              "Complete due diligence",
              "Arrange payment",
              "Schedule property inspection",
            ]
          : result.status === "BORDERLINE"
          ? ["Re-negotiate purchase price", "Verify expense assumptions"]
          : ["File for reference", "Look for better opportunities"],
    };

    try {
      generateDealReportPDF(reportData);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <button
      onClick={handleGeneratePDF}
      className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`}
    >
      <Download size={18} />
      Export PDF Report
    </button>
  );
};
