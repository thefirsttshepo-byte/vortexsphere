import jsPDF from "jspdf";
import { DealReportData } from "../index";
import {
  calculateNOI,
  calculateOwnerEarnings,
  calculateOEY,
  calculatePayback,
  calculateGrossRentalYield,
  calculateGRM,
} from "../../../core/calculations";
import {
  STYLES,
  setHeaderStyle,
  setBodyStyle,
  setSecondaryStyle,
  setMonoStyle,
  setTextColorFromArray,
} from "../styles";

export function addPage2(
  pdf: jsPDF,
  data: DealReportData,
  startY: number
): number {
  const margin = 15;
  let y = startY;

  // Page Title
  setHeaderStyle(pdf, "h1");
  pdf.text("FINANCIAL METRICS", margin, y);
  y += 15;

  // Input Data Section
  setHeaderStyle(pdf, "h2");
  pdf.text("INPUT DATA SUMMARY", margin, y);
  y += 10;

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `R ${amount.toLocaleString("en-ZA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Input Data Table
  setBodyStyle(pdf);

  // Create arrays with proper typing
  const inputs: [string, string][] = [
    ["Purchase Price:", formatCurrency(data.deal.purchasePrice)],
    ["Annual Gross Rent:", formatCurrency(data.deal.annualGrossRent)],
    ["Monthly Gross Rent:", formatCurrency(data.deal.annualGrossRent / 12)],
    ["Vacancy Assumption:", formatPercentage(data.deal.vacancyRate)],
    ["Unit Count:", `${data.deal.unitCount} units`],
  ];

  inputs.forEach(([label, value]) => {
    pdf.text(label, margin + 5, y);
    setMonoStyle(pdf);
    pdf.text(value, margin + 120, y);
    setBodyStyle(pdf);
    y += 7;
  });

  y += 10;

  // Operating Expenses
  setHeaderStyle(pdf, "h3");
  pdf.text("OPERATING EXPENSES (Annual)", margin, y);
  y += 8;

  const expenses = data.deal.operatingExpenses;

  // Define expense items with proper typing
  const expenseItems: [string, number][] = [
    ["Rates & Taxes:", expenses.ratesAndTaxes],
    ["Water & Electricity:", expenses.waterAndElectricity],
    ["Insurance:", expenses.insurance],
    ["Management Fees:", expenses.managementFees],
    ["Repairs & Maintenance:", expenses.repairsAndMaintenance],
    ["Other:", expenses.other],
  ];

  let totalExpenses = 0;

  expenseItems.forEach(([label, amount]) => {
    pdf.text(label, margin + 5, y);
    setMonoStyle(pdf);
    pdf.text(formatCurrency(amount), margin + 120, y);
    setBodyStyle(pdf);
    totalExpenses += amount; // Now TypeScript knows amount is a number
    y += 7;
  });

  // Total Expenses
  pdf.setFont(STYLES.fonts.body, "bold");
  pdf.text("TOTAL OPERATING EXPENSES:", margin + 5, y);
  setMonoStyle(pdf);
  pdf.setFont(STYLES.fonts.mono, "bold");
  pdf.text(formatCurrency(totalExpenses), margin + 120, y);
  setBodyStyle(pdf);
  pdf.setFont(STYLES.fonts.body, "normal");

  y += 10;
  pdf.text(
    `Maintenance Reserve: ${formatCurrency(data.deal.maintenanceReserve)}/year`,
    margin + 5,
    y
  );
  y += 15;

  // CALCULATED METRICS
  setHeaderStyle(pdf, "h2");
  pdf.text("CALCULATED METRICS", margin, y);
  y += 10;

  // Calculate metrics
  const noi = calculateNOI(data.deal);
  const ownerEarnings = calculateOwnerEarnings(data.deal);
  const oey = calculateOEY(data.deal) * 100; // Convert to percentage
  const payback = calculatePayback(data.deal);
  const gry = calculateGrossRentalYield(data.deal) * 100;
  const grm = calculateGRM(data.deal);

  // Create metrics with proper typing
  const metrics: [string, string][] = [
    ["Net Operating Income (NOI):", formatCurrency(noi)],
    ["Owner Earnings:", formatCurrency(ownerEarnings)],
    ["Owner Earnings Yield (OEY):", formatPercentage(oey)],
    ["Payback Period:", `${payback.toFixed(1)} years`],
    ["Gross Rental Yield:", formatPercentage(gry)],
    ["Gross Rent Multiplier:", `${grm.toFixed(1)} years`],
  ];

  metrics.forEach(([label, value], i) => {
    pdf.text(label, margin + 5, y);
    setMonoStyle(pdf);

    // Highlight key metrics
    if (label.includes("OEY")) {
      setTextColorFromArray(
        pdf,
        oey >= 12 ? STYLES.successColor : STYLES.dangerColor
      );
    } else if (label.includes("Payback")) {
      setTextColorFromArray(
        pdf,
        payback <= 12 ? STYLES.successColor : STYLES.dangerColor
      );
    } else {
      setTextColorFromArray(pdf, STYLES.textColors.primary);
    }

    pdf.text(value, margin + 120, y);
    setBodyStyle(pdf);
    setTextColorFromArray(pdf, STYLES.textColors.primary);
    y += 7;
  });

  y += 10;

  // Interpretation
  setHeaderStyle(pdf, "h3");
  pdf.text("INTERPRETATION", margin, y);
  y += 8;

  setBodyStyle(pdf);
  const interpretation = `
• OEY ${oey >= 12 ? "meets" : "fails"} the 12% minimum requirement
• Payback period ${payback <= 12 ? "meets" : "exceeds"} 12-year maximum
• Every R1 of purchase price generates R${(oey / 100).toFixed(
    3
  )} in annual owner earnings
• Property price is ${grm.toFixed(1)} times annual gross rent
  `.trim();

  pdf.text(interpretation, margin, y, { maxWidth: 180 });

  return y + 30;
}
