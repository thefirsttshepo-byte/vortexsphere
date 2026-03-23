import { STYLES } from "./styles";

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `R ${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `R ${(amount / 1000).toFixed(1)}k`;
  }
  return `R ${amount.toFixed(0)}`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function drawTableRow(
  pdf: any,
  x: number,
  y: number,
  columns: {
    text: string;
    width: number;
    align?: "left" | "center" | "right";
  }[],
  isHeader: boolean = false
): number {
  const rowHeight = 8;

  if (isHeader) {
    pdf.setFont(STYLES.fonts.body, "bold");
    pdf.setFillColor(240, 240, 240);
    pdf.rect(
      x,
      y - 4,
      columns.reduce((sum, col) => sum + col.width, 0),
      rowHeight + 2,
      "F"
    );
  } else {
    pdf.setFont(STYLES.fonts.body, "normal");
  }

  let currentX = x;
  columns.forEach((col, i) => {
    pdf.text(
      col.text,
      currentX +
        (col.align === "center"
          ? col.width / 2
          : col.align === "right"
          ? col.width - 2
          : 2),
      y,
      {
        align: col.align || "left",
      }
    );

    // Draw vertical line
    if (i < columns.length - 1) {
      pdf.setDrawColor(200, 200, 200);
      pdf.line(
        currentX + col.width,
        y - 4,
        currentX + col.width,
        y + rowHeight - 2
      );
    }

    currentX += col.width;
  });

  // Draw horizontal line
  pdf.setDrawColor(200, 200, 200);
  pdf.line(x, y + rowHeight - 2, currentX, y + rowHeight - 2);

  return y + rowHeight;
}

export function createCheckmark(passed: boolean): string {
  return passed ? "✓" : "✗";
}

export function getStatusColor(status: string): number[] {
  const styles = STYLES;
  switch (status) {
    case "ACCEPTED":
      return styles.successColor;
    case "BORDERLINE":
      return styles.warningColor;
    case "REJECTED":
      return styles.dangerColor;
    default:
      return styles.textColors.secondary;
  }
}
