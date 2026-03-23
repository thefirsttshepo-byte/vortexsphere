import { StoredDeal } from "../types";

export type RankedDeal = {
  id: string;
  name: string;
  location: string;
  score: number;
  oey: number;
  payback: number;
  stressResult: "Passed" | "Failed";
  stockPremium: number;
  status: "ACCEPTED" | "BORDERLINE" | "REJECTED";
};

export const getStoredDealById = (
  id: string,
  deals: StoredDeal[]
): StoredDeal | undefined => {
  return deals.find((deal) => deal.id === id);
};

export const mapDealToRankingRow = (deal: StoredDeal): RankedDeal => ({
  id: deal.id,
  name: deal.name,
  location: `${deal.location.township}, ${deal.location.municipality}`,
  score: deal.result.finalScore,
  oey: deal.result.metrics?.oey ?? 0,
  payback: deal.result.metrics?.paybackYears ?? 0,
  stressResult:
    (deal.result.metrics?.stressOutcome.cashFlowAfterStress ?? 0) >= 0
      ? "Passed"
      : "Failed",
  stockPremium: deal.result.metrics?.stockPremium ?? 0,
  status: deal.result.status,
});
