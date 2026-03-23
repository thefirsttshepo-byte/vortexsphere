import { DealInput, StoredDeal } from "../types";

export function extractDealInput(storedDeal: StoredDeal): DealInput {
  const { result, ...dealInput } = storedDeal;
  return dealInput;
}
