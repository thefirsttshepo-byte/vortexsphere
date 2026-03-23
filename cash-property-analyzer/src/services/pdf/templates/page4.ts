import jsPDF from "jspdf";
import { DealReportData } from "../index";
import {
  STYLES,
  setHeaderStyle,
  setBodyStyle,
  setSecondaryStyle,
} from "../styles";
import { createCheckmark, drawTableRow } from "../utils";

export function addPage4(
  pdf: jsPDF,
  data: DealReportData,
  startY: number
): number {
  const margin = 15;
  let y = startY;

  // Page Title
  setHeaderStyle(pdf, "h1");
  pdf.text("SCORING BREAKDOWN", margin, y);
  y += 15;

  // Score Summary
  setHeaderStyle(pdf, "h2");
  pdf.text("FINAL SCORE ANALYSIS", margin, y);
  y += 10;

  setBodyStyle(pdf);
  const score = data.result.finalScore;
  let scoreInterpretation = "";
  let scoreColor = STYLES.textColors.primary;

  if (score >= 70) {
    scoreInterpretation =
      "STRONG ACCEPT: Meets all criteria with margin of safety";
    scoreColor = STYLES.successColor;
  } else if (score >= 60) {
    scoreInterpretation = "BORDERLINE: Marginal pass, requires careful review";
    scoreColor = STYLES.warningColor;
  } else if (score > 0) {
    scoreInterpretation = "WEAK: Below acceptance threshold";
    scoreColor = STYLES.dangerColor;
  } else {
    scoreInterpretation = "AUTO-REJECTED: Failed one or more gates";
    scoreColor = STYLES.dangerColor;
  }

  pdf.setTextColor(...scoreColor);
  pdf.text(`FINAL SCORE: ${score}/100 - ${scoreInterpretation}`, margin, y);
  pdf.setTextColor(...STYLES.textColors.primary);
  y += 15;

  // Component Scores Table - ADJUSTED WIDTHS
  const componentScores = data.result.componentScores;
  if (componentScores) {
    setHeaderStyle(pdf, "h3");
    pdf.text("COMPONENT SCORE DETAILS", margin, y);
    y += 8;

    // Table Header - ADJUSTED COLUMN WIDTHS
    y = drawTableRow(
      pdf,
      margin,
      y,
      [
        { text: "COMPONENT", width: 65, align: "left" },
        { text: "SCORE", width: 25, align: "center" },
        { text: "WEIGHT", width: 25, align: "center" },
        { text: "CONTRIB", width: 30, align: "center" },
        { text: "NOTES", width: 50, align: "left" },
      ],
      true
    );

    // Component rows
    const components = [
      {
        key: "oey" as const,
        label: "Owner Earnings Yield",
        weight: 30,
        maxScore: 30,
      },
      {
        key: "payback" as const,
        label: "Payback Period",
        weight: 20,
        maxScore: 20,
      },
      {
        key: "stressSurvival" as const,
        label: "Stress Survival",
        weight: 25,
        maxScore: 25,
      },
      {
        key: "expenseQuality" as const,
        label: "Expense Quality",
        weight: 10,
        maxScore: 10,
      },
      {
        key: "dealSimplicity" as const,
        label: "Deal Simplicity",
        weight: 10,
        maxScore: 10,
      },
      {
        key: "stockPremium" as const,
        label: "Stock Premium",
        weight: 5,
        maxScore: 5,
      },
    ];

    components.forEach((component) => {
      const score = componentScores[component.key] || 0;
      const contribution = (score / component.maxScore) * component.weight;

      let notes = "";
      switch (component.key) {
        case "oey":
          notes = `≥12% = ${score}/${component.maxScore}`;
          break;
        case "payback":
          notes = `≤12yrs = ${score}/${component.maxScore}`;
          break;
        case "stressSurvival":
          notes = score === 25 ? "Passed all" : "Failed some";
          break;
        case "expenseQuality":
          notes = "Opex ratio";
          break;
        case "dealSimplicity":
          notes = `${data.deal.unitCount} units`;
          break;
        case "stockPremium":
          notes = "vs JSE";
          break;
      }

      y = drawTableRow(
        pdf,
        margin,
        y,
        [
          { text: component.label, width: 65, align: "left" },
          {
            text: `${score}/${component.maxScore}`,
            width: 25,
            align: "center",
          },
          { text: `${component.weight}%`, width: 25, align: "center" },
          { text: contribution.toFixed(1), width: 30, align: "center" },
          { text: notes, width: 50, align: "left" },
        ],
        false
      );
    });

    y += 15; // Increased spacing
  }

  // Rejection Reasons (if any)
  const rejectReasons = data.result.rejectReasons;
  if (rejectReasons && rejectReasons.length > 0) {
    // Check if we need a new page
    if (y > 250) {
      pdf.addPage();
      y = 20;
    }

    setHeaderStyle(pdf, "h3");
    pdf.text("AUTO-REJECTION DETAILS", margin, y);
    y += 8;

    setBodyStyle(pdf);
    pdf.setTextColor(...STYLES.dangerColor);
    rejectReasons.forEach((reason, index) => {
      pdf.text(`${index + 1}. ${reason}`, margin + 5, y);
      y += 7;
    });
    pdf.setTextColor(...STYLES.textColors.primary);
    y += 10;
  }

  // Scoring Methodology - ADJUSTED TO FIT
  setHeaderStyle(pdf, "h3");
  pdf.text("SCORING METHODOLOGY", margin, y);
  y += 8;

  setSecondaryStyle(pdf);
  const methodology = [
    "• Scores calculated deterministically from input data",
    "• Auto-reject gates checked first (OEY <12%, Payback >12yrs)",
    "• Component scores use explicit threshold tables",
    "• Final score = weighted sum of component scores",
    "• Acceptance: ≥70/100",
    "• Borderline: 60-69/100",
    "• Reject: <60/100 or auto-reject gate failure",
  ];

  methodology.forEach((line) => {
    pdf.text(line, margin, y, { maxWidth: 180 });
    y += 7;
  });

  return y + 10;
}
