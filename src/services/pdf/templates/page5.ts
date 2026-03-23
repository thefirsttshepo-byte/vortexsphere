import jsPDF from "jspdf";
import { DealReportData } from "../index";
import {
  STYLES,
  setHeaderStyle,
  setBodyStyle,
  setSecondaryStyle,
} from "../styles";

export function addPage5(
  pdf: jsPDF,
  data: DealReportData,
  startY: number
): number {
  const margin = 15;
  let y = startY;

  // Page Title
  setHeaderStyle(pdf, "h1");
  pdf.text("QUALITATIVE ANALYSIS & NOTES", margin, y);
  y += 15;

  // Property Assessment
  setHeaderStyle(pdf, "h2");
  pdf.text("PROPERTY ASSESSMENT", margin, y);
  y += 10;

  setBodyStyle(pdf);
  const assessmentItems = [
    {
      label: "Building Condition:",
      value: data.propertyCondition || "Not assessed",
    },
    { label: "Tenant Quality:", value: data.tenantQuality || "Not assessed" },
    {
      label: "Location Risk:",
      value: data.deal.location.township === "A-grade" ? "Low" : "Medium",
    },
    { label: "Market Demand:", value: "Stable" },
    { label: "Regulatory Environment:", value: "Standard" },
  ];

  assessmentItems.forEach((item) => {
    pdf.text(item.label, margin + 5, y);
    pdf.text(item.value, margin + 120, y);
    y += 7;
  });

  y += 12; // Increased spacing

  // Analyst Notes
  setHeaderStyle(pdf, "h2");
  pdf.text("ANALYST NOTES", margin, y);
  y += 10;

  setBodyStyle(pdf);
  if (data.notes && data.notes.trim()) {
    const lines = pdf.splitTextToSize(data.notes, 170);
    pdf.text(lines, margin, y);
    y += 7 * lines.length + 10;
  } else {
    setSecondaryStyle(pdf);
    pdf.text("No additional notes provided for this analysis.", margin, y);
    y += 20;
  }

  // Negotiation History - COMPRESSED FORMAT
  setHeaderStyle(pdf, "h2");
  pdf.text("NEGOTIATION & DEAL CONTEXT", margin, y);
  y += 10;

  setBodyStyle(pdf);
  const context = [
    `Purchase: ${
      data.deal.unitCount
    } units at R${data.deal.purchasePrice.toLocaleString()}`,
    `Target: ${
      (data.result.componentScores?.oey || 0) > 0
        ? "✓ Achieved"
        : "✗ Not achieved"
    }`,
    `Market: R${Math.round(
      data.deal.purchasePrice / data.deal.unitCount
    ).toLocaleString()}/unit`,
    `Growth: 3-5% annually, Vacancy: ${data.deal.vacancyRate}%`,
    `Due Diligence: Title (Pending), Plans (Pending), Accounts (Pending)`,
  ];

  context.forEach((line) => {
    pdf.text(line, margin, y, { maxWidth: 180 });
    y += 7;
  });

  y += 12; // Increased spacing

  // Check if we need a new page for Follow-up Actions
  if (y > 240) {
    pdf.addPage();
    y = 20;
    setHeaderStyle(pdf, "h2");
    pdf.text("FOLLOW-UP ACTIONS", margin, y);
    y += 10;
  } else {
    setHeaderStyle(pdf, "h2");
    pdf.text("FOLLOW-UP ACTIONS", margin, y);
    y += 10;
  }

  setBodyStyle(pdf);
  const actions = data.followUpActions || getDefaultActions(data.result.status);

  actions.forEach((action, index) => {
    pdf.text(`${index + 1}. ${action}`, margin + 5, y);
    y += 7;
  });

  return y + 10;
}

function getDefaultActions(status: string): string[] {
  switch (status) {
    case "ACCEPTED":
      return [
        "Complete due diligence",
        "Arrange payment",
        "Schedule property inspection",
      ];
    case "BORDERLINE":
      return ["Re-negotiate purchase price", "Verify expense assumptions"];
    case "REJECTED":
      return ["File for reference", "Look for better opportunities"];
    default:
      return ["No actions defined"];
  }
}
