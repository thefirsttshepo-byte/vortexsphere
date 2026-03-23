import { DealInput, ScoringResult } from "../../core/types"; // Changed from DealResult to ScoringResult

/**
 * Complete deal object with both input and calculated results
 */
export interface Deal extends DealInput {
  result: ScoringResult; // Changed from DealResult to ScoringResult
  lastUpdated: Date;
  tags: string[];
  notes?: string;
}

/**
 * Deal comparison result
 */
export interface DealComparison {
  deal1: Deal;
  deal2: Deal;
  differences: {
    field: string;
    deal1Value: any;
    deal2Value: any;
    difference: number;
    differencePercentage?: number;
  }[];
  summary: {
    betterDeal: "deal1" | "deal2" | "tie";
    reason: string;
    scoreDifference: number;
  };
}

/**
 * Deal filter criteria
 */
export interface DealFilter {
  status?: ("ACCEPTED" | "BORDERLINE" | "REJECTED")[];
  minScore?: number;
  maxScore?: number;
  minOEY?: number;
  maxOEY?: number;
  maxPayback?: number;
  location?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

/**
 * Deal statistics
 */
export interface DealStats {
  totalDeals: number;
  accepted: number;
  rejected: number;
  borderline: number;
  averageScore: number;
  averageOEY: number;
  averagePayback: number;
  bestDeal?: Deal;
  worstDeal?: Deal;
  scoreDistribution: Record<number, number>; // score range -> count
}

/**
 * Create a new deal object
 */
export const createDeal = (input: DealInput, result: ScoringResult): Deal => {
  return {
    ...input,
    result,
    lastUpdated: new Date(),
    tags: [],
    notes: "",
  };
};

/**
 * Update an existing deal
 */
export const updateDeal = (deal: Deal, updates: Partial<DealInput>): Deal => {
  return {
    ...deal,
    ...updates,
    lastUpdated: new Date(),
  };
};

/**
 * Calculate deal statistics
 */
export const calculateStats = (deals: Deal[]): DealStats => {
  if (deals.length === 0) {
    return {
      totalDeals: 0,
      accepted: 0,
      rejected: 0,
      borderline: 0,
      averageScore: 0,
      averageOEY: 0,
      averagePayback: 0,
      scoreDistribution: {},
    };
  }

  const accepted = deals.filter((d) => d.result.status === "ACCEPTED").length;
  const rejected = deals.filter((d) => d.result.status === "REJECTED").length;
  const borderline = deals.filter(
    (d) => d.result.status === "BORDERLINE"
  ).length;

  const totalScore = deals.reduce((sum, d) => sum + d.result.finalScore, 0);

  // Access oey from metrics (with fallback)
  const totalOEY = deals.reduce((sum, d) => {
    const oey = d.result.metrics?.oey || 0;
    return sum + oey;
  }, 0);

  // Access paybackYears from metrics (with fallback)
  const totalPayback = deals
    .filter((d) => {
      const payback = d.result.metrics?.paybackYears;
      return payback !== undefined && payback !== Infinity;
    })
    .reduce((sum, d) => {
      const payback = d.result.metrics?.paybackYears || 0;
      return sum + payback;
    }, 0);

  const scoreDistribution: Record<number, number> = {};
  deals.forEach((deal) => {
    const range = Math.floor(deal.result.finalScore / 10) * 10;
    scoreDistribution[range] = (scoreDistribution[range] || 0) + 1;
  });

  const bestDeal = deals.reduce((best, current) =>
    current.result.finalScore > best.result.finalScore ? current : best
  );

  const worstDeal = deals.reduce((worst, current) =>
    current.result.finalScore < worst.result.finalScore ? current : worst
  );

  const validPaybackDeals = deals.filter((d) => {
    const payback = d.result.metrics?.paybackYears;
    return payback !== undefined && payback !== Infinity;
  }).length;

  return {
    totalDeals: deals.length,
    accepted,
    rejected,
    borderline,
    averageScore: totalScore / deals.length,
    averageOEY: totalOEY / deals.length,
    averagePayback:
      validPaybackDeals > 0 ? totalPayback / validPaybackDeals : 0,
    bestDeal,
    worstDeal,
    scoreDistribution,
  };
};
