// EPIC 5: Stress Testing Engine
import { DealInput } from "../types";
import { calculateOwnerEarnings } from "../calculations";
import { saConfig } from "../../config/saConfig";

/**
 * Vacancy Stress Test
 * Applies vacancy shock to gross rent
 */
export const vacancyStressTest = (input: DealInput): number => {
  const shockedInput = {
    ...input,
    vacancyRate: input.vacancyRate + saConfig.stressTests.vacancyShock * 100,
  };

  return calculateOwnerEarnings(shockedInput);
};

/**
 * Municipal & Utilities Stress Test
 * Applies percentage increase to rates and utilities
 */
export const municipalUtilitiesStressTest = (input: DealInput): number => {
  const shockedInput = {
    ...input,
    operatingExpenses: {
      ...input.operatingExpenses,
      ratesAndTaxes:
        input.operatingExpenses.ratesAndTaxes *
        (1 + saConfig.stressTests.municipalIncrease),
      waterAndElectricity:
        input.operatingExpenses.waterAndElectricity *
        (1 + saConfig.stressTests.municipalIncrease),
    },
  };

  return calculateOwnerEarnings(shockedInput);
};

/**
 * Maintenance Surge Stress Test
 * Applies 2x maintenance reserve
 */
export const maintenanceSurgeStressTest = (input: DealInput): number => {
  const shockedInput = {
    ...input,
    maintenanceReserve:
      input.maintenanceReserve * saConfig.stressTests.maintenanceSurge,
  };

  return calculateOwnerEarnings(shockedInput);
};

/**
 * Combined Worst-Case Stress Evaluator
 * Returns the worst outcome from all stress tests
 */
export const evaluateWorstCaseStress = (
  input: DealInput
): { scenario: string; stressedEarnings: number; passed: boolean } => {
  const originalEarnings = calculateOwnerEarnings(input);

  const tests = [
    {
      scenario: "vacancy",
      earnings: vacancyStressTest(input),
    },
    {
      scenario: "municipal",
      earnings: municipalUtilitiesStressTest(input),
    },
    {
      scenario: "maintenance",
      earnings: maintenanceSurgeStressTest(input),
    },
  ];

  const worstCase = tests.reduce((worst, current) =>
    current.earnings < worst.earnings ? current : worst
  );

  return {
    scenario: worstCase.scenario,
    stressedEarnings: worstCase.earnings,
    passed: worstCase.earnings > 0,
  };
};
