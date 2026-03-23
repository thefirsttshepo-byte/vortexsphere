/**
 * Validate deal input data
 */
import { DealInput } from "../core/types";

export const validateDealInput = (input: Partial<DealInput>): string[] => {
  const errors: string[] = [];

  if (!input.name || input.name.trim().length === 0) {
    errors.push("Deal name is required");
  }

  if (
    !input.location?.township ||
    input.location.township.trim().length === 0
  ) {
    errors.push("Township is required");
  }

  if (!input.purchasePrice || input.purchasePrice <= 0) {
    errors.push("Purchase price must be greater than 0");
  }

  if (!input.unitCount || input.unitCount <= 0) {
    errors.push("Unit count must be greater than 0");
  }

  if (!input.annualGrossRent || input.annualGrossRent <= 0) {
    errors.push("Annual gross rent must be greater than 0");
  }

  if (
    input.vacancyRate === undefined ||
    input.vacancyRate < 0 ||
    input.vacancyRate > 100
  ) {
    errors.push("Vacancy rate must be between 0 and 100");
  }

  // Validate operating expenses
  if (input.operatingExpenses) {
    const expenses = Object.values(input.operatingExpenses);
    const hasNegativeExpense = expenses.some((expense) => expense < 0);
    if (hasNegativeExpense) {
      errors.push("Operating expenses cannot be negative");
    }
  }

  return errors;
};

/**
 * Validate that a number is positive
 */
export const validatePositiveNumber = (
  value: number,
  fieldName: string
): string | null => {
  if (value <= 0) {
    return `${fieldName} must be greater than 0`;
  }
  return null;
};

/**
 * Validate percentage range
 */
export const validatePercentage = (
  value: number,
  fieldName: string
): string | null => {
  if (value < 0 || value > 100) {
    return `${fieldName} must be between 0 and 100`;
  }
  return null;
};

/**
 * Validate required field
 */
export const validateRequired = (
  value: any,
  fieldName: string
): string | null => {
  if (value === undefined || value === null || value === "") {
    return `${fieldName} is required`;
  }
  return null;
};
