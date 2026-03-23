import jsPDF from "jspdf";
import { DealReportData } from "../index";
import {
  STYLES,
  setHeaderStyle,
  setBodyStyle,
  setSecondaryStyle,
} from "../styles";

export function addPage6(
  pdf: jsPDF,
  data: DealReportData,
  startY: number
): number {
  const margin = 15;
  let y = startY;

  // Page Title
  setHeaderStyle(pdf, "h1");
  pdf.text("INVESTMENT DOCTRINE", margin, y);
  y += 15;

  // Core Principles Box
  pdf.setFillColor(240, 248, 255);
  pdf.rect(margin, y, 180, 50, "F"); // Reduced height
  pdf.setDrawColor(41, 128, 185);
  pdf.rect(margin, y, 180, 50);

  setHeaderStyle(pdf, "h2");
  pdf.text("CORE PRINCIPLES", margin + 5, y + 10);

  setBodyStyle(pdf);
  const principles = [
    "✓ 100% cash-only analysis",
    "✓ No leverage, debt, or refinancing",
    "✓ No IRR or appreciation projections",
    "✓ Compare only against stocks",
    "✓ Auto-reject gates are absolute",
  ];

  principles.forEach((principle, index) => {
    pdf.text(principle, margin + 10, y + 20 + index * 7);
  });

  y += 60; // Adjusted based on reduced box height

  // Non-Negotiable Rules - SINGLE LINE FORMAT
  setHeaderStyle(pdf, "h2");
  pdf.text("NON-NEGOTIABLE RULES", margin, y);
  y += 10;

  const rules = [
    { rule: "OEY ≥ 12%", reason: "Minimum return requirement" },
    { rule: "Payback ≤ 12 years", reason: "Capital recovery timeframe" },
    {
      rule: "Positive cash flow under stress",
      reason: "Survival precedes growth",
    },
    { rule: "Stock premium ≥ +3%", reason: "Outperform passive alternatives" },
  ];

  setBodyStyle(pdf);
  rules.forEach((item) => {
    pdf.setFont(STYLES.fonts.body, "bold");
    pdf.text(`• ${item.rule}:`, margin + 5, y);
    pdf.setFont(STYLES.fonts.body, "normal");
    pdf.text(item.reason, margin + 60, y);
    y += 8;
  });

  y += 10;

  // Philosophy Statement - COMPACT VERSION
  setHeaderStyle(pdf, "h3");
  pdf.text("CAPITAL ALLOCATION PHILOSOPHY", margin, y);
  y += 10;

  setBodyStyle(pdf);
  const philosophyLines = [
    '"Capital is allocated only to assets that produce',
    "observable owner earnings today, recover capital",
    "quickly under conservative assumptions, and",
    "outperform passive alternatives by a wide margin.",
    'Survival precedes growth."',
    "",
    "- Cash-Only Property Analysis Doctrine",
  ];

  philosophyLines.forEach((line) => {
    pdf.text(line, margin, y, { maxWidth: 180 });
    y += 7;
  });

  y += 10;

  // Audit Trail
  setHeaderStyle(pdf, "h3");
  pdf.text("AUDIT TRAIL", margin, y);
  y += 10;

  setSecondaryStyle(pdf);
  const auditInfo = [
    `Report Generated: ${data.analysisDate.toLocaleString()}`,
    `Analyst: ${data.analystName}`,
    `Deal ID: ${data.deal.id}`,
    `Analysis Method: Deterministic scoring engine`,
    `Version: 1.0.0`,
    `Configuration: South Africa specific`,
    "",
    "DATA PROVENANCE:",
    "• Calculations reproducible from input data",
    "• No subjective adjustments applied",
    "• Stress test parameters from historical data",
    "• Stock benchmark: JSE Top 40 dividend yield",
    "",
    "DISCLAIMER:",
    "This analysis is for capital allocation decisions only.",
    "Not financial advice. Conduct your own due diligence.",
  ];

  auditInfo.forEach((line) => {
    pdf.text(line, margin, y, { maxWidth: 180 });
    y += 7;
  });

  // Final Note
  pdf.setTextColor(...STYLES.primaryColor);
  pdf.setFont(STYLES.fonts.heading, "italic");
  pdf.text("Capital protected when discipline is encoded.", margin, y + 10);
  pdf.setTextColor(...STYLES.textColors.primary);

  return y + 20;
}
