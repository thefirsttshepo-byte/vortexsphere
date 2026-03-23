import jsPDF from "jspdf";
import { DealReportData } from "../index";
import {
  STYLES,
  setHeaderStyle,
  setBodyStyle,
  setSecondaryStyle,
  drawStatusBox,
} from "../styles";

export function addPage1(
  pdf: jsPDF,
  data: DealReportData,
  startY: number
): number {
  const margin = 15;
  let y = startY;

  // Title
  setHeaderStyle(pdf, "h1");
  pdf.text("CASH-ONLY PROPERTY ANALYSIS REPORT", margin, y);
  y += 15;

  // Subtitle
  setSecondaryStyle(pdf);
  pdf.text("DOCTRINE-DRIVEN CAPITAL ALLOCATION", margin, y);
  y += 20;

  // Deal Identification Box
  setBodyStyle(pdf);
  pdf.rect(margin, y, 180, 40);

  pdf.setFontSize(STYLES.fontSizes.h3);
  pdf.text("DEAL IDENTIFICATION", margin + 5, y + 8);

  pdf.setFontSize(STYLES.fontSizes.body);
  pdf.text(`Property: ${data.deal.name}`, margin + 10, y + 18);
  pdf.text(
    `Location: ${data.deal.location.township}, ${data.deal.location.municipality}`,
    margin + 10,
    y + 23
  );
  pdf.text(
    `Analysis Date: ${data.analysisDate.toLocaleDateString()}`,
    margin + 10,
    y + 28
  );
  pdf.text(`Analyst: ${data.analystName}`, margin + 10, y + 33);

  y += 50;

  // VERDICT SECTION
  setHeaderStyle(pdf, "h2");
  pdf.text("ONE-PAGE VERDICT", margin, y);
  y += 10;

  // Status Box
  drawStatusBox(pdf, margin, y, 180, 25, data.result.status);

  setBodyStyle(pdf);
  pdf.setTextColor(255, 255, 255);
  pdf.text(`SCORE: ${data.result.finalScore}/100`, margin + 90, y + 18, {
    align: "center",
  });

  // Reset text color
  pdf.setTextColor(...STYLES.textColors.primary);
  y += 35;

  // Auto-Reject Gates
  setHeaderStyle(pdf, "h3");
  pdf.text("AUTO-REJECT GATES", margin, y);
  y += 8;

  // Get OEY from component scores or calculate
  const oeyScore = data.result.componentScores?.oey || 0;
  const oeyPercent = (oeyScore / 30) * 12; // Convert back to percentage
  const oeyPass = oeyPercent >= 12;

  // Get payback (simplified - you'd need actual payback calculation)
  const paybackPass =
    data.result.rejectReasons?.every((r) => !r.includes("Payback")) ?? true;

  // Get stress test result
  const stressPass =
    data.result.rejectReasons?.every((r) => !r.includes("stress")) ?? true;

  // Get stock premium (simplified)
  const stockPremiumPass =
    data.result.rejectReasons?.every((r) => !r.includes("Stock premium")) ??
    true;

  const gates = [
    { label: "OEY ≥ 12%", passed: oeyPass, value: `${oeyPercent.toFixed(1)}%` },
    {
      label: "Payback ≤ 12 years",
      passed: paybackPass,
      value: "Check calculations",
    },
    {
      label: "Positive cash flow under stress",
      passed: stressPass,
      value: stressPass ? "PASS" : "FAIL",
    },
    {
      label: "Stock premium ≥ +3%",
      passed: stockPremiumPass,
      value: "Check calculations",
    },
  ];

  setBodyStyle(pdf);
  gates.forEach((gate, i) => {
    const symbol = gate.passed ? "✓" : "✗";
    const color = gate.passed ? STYLES.successColor : STYLES.dangerColor;

    pdf.setTextColor(...color);
    pdf.text(`${symbol} ${gate.label}`, margin + 5, y);
    pdf.setTextColor(...STYLES.textColors.secondary);
    pdf.text(`(${gate.value})`, margin + 120, y);
    y += 7;
  });

  y += 10;

  // Capital Allocation Decision
  setHeaderStyle(pdf, "h3");
  pdf.setTextColor(...STYLES.textColors.primary);
  pdf.text("CAPITAL ALLOCATION DECISION:", margin, y);
  y += 8;

  setBodyStyle(pdf);
  const decisionText = getDecisionText(
    data.result.status,
    data.result.finalScore
  );
  pdf.text(decisionText, margin, y, { maxWidth: 180 });

  return y + 30;
}

function getDecisionText(status: string, score: number): string {
  switch (status) {
    case "ACCEPTED":
      return `Capital allocated: This deal meets all minimum requirements and scores ${score}/100. It produces observable owner earnings today, recovers capital within acceptable timeframe, and outperforms passive alternatives. Proceed with due diligence.`;
    case "BORDERLINE":
      return `Capital allocation paused: This deal scores ${score}/100, indicating marginal viability. Requires additional due diligence or negotiation improvement. Review stress test results carefully before proceeding.`;
    case "REJECTED":
      return `Capital not allocated: This deal fails minimum requirements for capital protection. The rejection gates protect against overpayment, excessive risk, or inadequate returns. Review rejection reasons and seek better opportunities.`;
    default:
      return "Analysis incomplete.";
  }
}
