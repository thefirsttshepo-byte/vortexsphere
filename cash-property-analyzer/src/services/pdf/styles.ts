export interface PDFStyles {
  primaryColor: [number, number, number];
  secondaryColor: [number, number, number];
  successColor: [number, number, number];
  warningColor: [number, number, number];
  dangerColor: [number, number, number];
  textColors: {
    primary: [number, number, number];
    secondary: [number, number, number];
    muted: [number, number, number];
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  fontSizes: {
    h1: number;
    h2: number;
    h3: number;
    body: number;
    small: number;
    micro: number;
  };
}

export const STYLES: PDFStyles = {
  primaryColor: [41, 128, 185], // Blue
  secondaryColor: [52, 152, 219], // Lighter Blue
  successColor: [39, 174, 96], // Green
  warningColor: [243, 156, 18], // Yellow/Orange
  dangerColor: [231, 76, 60], // Red

  textColors: {
    primary: [44, 62, 80], // Dark blue-gray
    secondary: [127, 140, 141], // Gray
    muted: [189, 195, 199], // Light gray
  },

  fonts: {
    heading: "helvetica",
    body: "helvetica",
    mono: "courier",
  },

  fontSizes: {
    h1: 24,
    h2: 18,
    h3: 14,
    body: 11,
    small: 9,
    micro: 7,
  },
};

// Helper functions
export function setHeaderStyle(
  pdf: any,
  level: "h1" | "h2" | "h3" = "h1"
): void {
  const styles = STYLES;
  pdf.setFont(styles.fonts.heading, "bold");
  pdf.setTextColor(
    styles.textColors.primary[0],
    styles.textColors.primary[1],
    styles.textColors.primary[2]
  );
  pdf.setFontSize(styles.fontSizes[level]);
}

export function setBodyStyle(pdf: any): void {
  const styles = STYLES;
  pdf.setFont(styles.fonts.body, "normal");
  pdf.setTextColor(
    styles.textColors.primary[0],
    styles.textColors.primary[1],
    styles.textColors.primary[2]
  );
  pdf.setFontSize(styles.fontSizes.body);
}

export function setSecondaryStyle(pdf: any): void {
  const styles = STYLES;
  pdf.setFont(styles.fonts.body, "normal");
  pdf.setTextColor(
    styles.textColors.secondary[0],
    styles.textColors.secondary[1],
    styles.textColors.secondary[2]
  );
  pdf.setFontSize(styles.fontSizes.small);
}

export function setMonoStyle(pdf: any): void {
  const styles = STYLES;
  pdf.setFont(styles.fonts.mono, "normal");
  pdf.setTextColor(
    styles.textColors.primary[0],
    styles.textColors.primary[1],
    styles.textColors.primary[2]
  );
  pdf.setFontSize(styles.fontSizes.body);
}

export function drawStatusBox(
  pdf: any,
  x: number,
  y: number,
  width: number,
  height: number,
  status: string
): void {
  const styles = STYLES;

  let color: [number, number, number];
  switch (status) {
    case "ACCEPTED":
      color = styles.successColor;
      break;
    case "BORDERLINE":
      color = styles.warningColor;
      break;
    case "REJECTED":
      color = styles.dangerColor;
      break;
    default:
      color = styles.secondaryColor;
  }

  // Draw colored box
  pdf.setFillColor(color[0], color[1], color[2]);
  pdf.setDrawColor(color[0], color[1], color[2]);
  pdf.roundedRect(x, y, width, height, 2, 2, "FD");

  // Add white text
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(styles.fontSizes.h2);
  pdf.text(status, x + width / 2, y + height / 2 + 3, { align: "center" });
}

// Helper to set text color from array
export function setTextColorFromArray(
  pdf: any,
  color: [number, number, number]
): void {
  pdf.setTextColor(color[0], color[1], color[2]);
}
