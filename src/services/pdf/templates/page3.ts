import jsPDF from "jspdf";
import { DealReportData } from "../index";
import { STYLES, setHeaderStyle, setBodyStyle } from "../styles";
import { formatCurrency } from "../utils";

export function addPage3(
  pdf: jsPDF,
  data: DealReportData,
  startY: number
): number {
  const margin = 15;
  let y = startY;

  setHeaderStyle(pdf, "h1");
  pdf.text("STRESS TEST RESULTS", margin, y);
  y += 15;

  setBodyStyle(pdf);
  const stressText = `
All deals must survive three stress scenarios to ensure capital protection.
These scenarios represent realistic adverse conditions based on historical data.
  `.trim();

  pdf.text(stressText, margin, y, { maxWidth: 180 });
  y += 20;

  // This would use your actual stress test calculations
  // For now, placeholder
  const stressScenarios = [
    {
      name: "Vacancy Shock",
      description: "+20% vacancy rate applied",
      original: 85000,
      stressed: 68000,
      change: -17000,
    },
    {
      name: "Municipal Increase",
      description: "+15% rates & utilities",
      original: 85000,
      stressed: 72000,
      change: -13000,
    },
    {
      name: "Maintenance Surge",
      description: "2× maintenance reserve",
      original: 85000,
      stressed: 75000,
      change: -10000,
    },
  ];

  stressScenarios.forEach((scenario, i) => {
    setHeaderStyle(pdf, "h3");
    pdf.text(`${i + 1}. ${scenario.name}`, margin, y);
    y += 8;

    setBodyStyle(pdf);
    pdf.text(scenario.description, margin + 5, y);
    y += 7;

    pdf.text(
      `Original cash flow: ${formatCurrency(scenario.original)}`,
      margin + 10,
      y
    );
    y += 7;
    pdf.text(
      `Stressed cash flow: ${formatCurrency(scenario.stressed)}`,
      margin + 10,
      y
    );
    y += 7;

    const passed = scenario.stressed > 0;
    pdf.setTextColor(...(passed ? STYLES.successColor : STYLES.dangerColor));
    pdf.text(
      `${passed ? "✓ PASS" : "✗ FAIL"} (Change: ${formatCurrency(
        scenario.change
      )})`,
      margin + 10,
      y
    );
    pdf.setTextColor(...STYLES.textColors.primary);

    y += 12;
  });

  return y;
}
