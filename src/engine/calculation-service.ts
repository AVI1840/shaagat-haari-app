import type { CitizenProfile } from "@/schemas/citizen-profile";

export interface CalculationOutput {
  calculation_id: string;
  result: Record<string, unknown>;
  description: string;
}

export function executeSeniorGrant(
  profile: CitizenProfile
): CalculationOutput {
  const wages = profile.wage_months_preceding_6 || [];
  if (wages.length === 0) {
    return {
      calculation_id: "CALC_SENIOR_GRANT",
      result: { error: "no_wage_data", daily_grant_final: 0 },
      description: "No wage data provided for senior grant calculation",
    };
  }

  const sorted = [...wages].sort((a, b) => b - a);
  const top3 = sorted.slice(0, 3);
  const totalTop3 = top3.reduce((s, v) => s + v, 0);
  const averageDailyWage = totalTop3 / 90;
  const dailyGrantUncapped = averageDailyWage * 0.75;
  const dailyGrantFinal = Math.min(dailyGrantUncapped, 134);

  return {
    calculation_id: "CALC_SENIOR_GRANT",
    result: {
      top_3_months: top3,
      total_top_3: totalTop3,
      average_daily_wage: Math.round(averageDailyWage * 100) / 100,
      daily_grant_uncapped: Math.round(dailyGrantUncapped * 100) / 100,
      daily_grant_final: Math.round(dailyGrantFinal * 100) / 100,
      max_daily_cap_nis: 134,
    },
    description: `Senior grant: ${Math.round(dailyGrantFinal * 100) / 100} NIS/day`,
  };
}

export function executeEmployerReserveComp(
  profile: CitizenProfile
): CalculationOutput {
  const avgWage = profile.average_daily_wage_3_months || 0;
  const days = profile.employee_reserve_days_march_2026 || 0;
  const dailyRate = avgWage * 0.2;
  const total = dailyRate * days;

  return {
    calculation_id: "CALC_EMPLOYER_RESERVE_COMP",
    result: {
      average_daily_wage: avgWage,
      reserve_days: days,
      compensation_rate: 0.2,
      daily_compensation_rate: Math.round(dailyRate * 100) / 100,
      total_employer_compensation: Math.round(total * 100) / 100,
    },
    description: `Employer compensation: ${Math.round(total * 100) / 100} NIS`,
  };
}

export function executeDualStatusDeduction(
  profile: CitizenProfile
): CalculationOutput {
  const independentIncome = profile.independent_income_declared || 0;
  return {
    calculation_id: "CALC_DUAL_STATUS_DEDUCTION",
    result: {
      independent_income_declared: independentIncome,
      deduction_amount: independentIncome,
      note: "Deducted from unemployment payout after CPA certification",
    },
    description: `Dual status deduction: ${independentIncome} NIS from independent income`,
  };
}

export function executeNiPremiumLiability(
  profile: CitizenProfile
): CalculationOutput {
  const months = profile.chalath_months_continuous || 0;
  const receiving = profile.receiving_unemployment_benefits;

  let liability: string;
  if (months <= 2) {
    liability = "employer_direct_remittance";
  } else if (receiving) {
    liability = "bituach_leumi_auto_deduct_from_payout";
  } else {
    liability = "employee_direct_payment_portal";
  }

  return {
    calculation_id: "CALC_NI_PREMIUM_LIABILITY",
    result: {
      chalath_months: months,
      receiving_unemployment: receiving,
      liability_assignment: liability,
    },
    description: `NI premium liability: ${liability}`,
  };
}

export function executeCalculation(
  calculationRef: string,
  profile: CitizenProfile
): CalculationOutput | null {
  switch (calculationRef) {
    case "CALC_SENIOR_GRANT":
      return executeSeniorGrant(profile);
    case "CALC_EMPLOYER_RESERVE_COMP":
      return executeEmployerReserveComp(profile);
    case "CALC_DUAL_STATUS_DEDUCTION":
      return executeDualStatusDeduction(profile);
    case "CALC_NI_PREMIUM_LIABILITY":
      return executeNiPremiumLiability(profile);
    case "CALC_UNEMPLOYMENT_STANDARD":
      return {
        calculation_id: "CALC_UNEMPLOYMENT_STANDARD",
        result: {
          waiting_days_waived: true,
          vacation_exhaustion_waived: true,
          payment_starts_from: "day_1",
          permitted_labor_days: profile.permitted_labor_days,
        },
        description:
          "Standard emergency unemployment: payment from day 1, no waiting period",
      };
    case "CALC_SPOUSAL_ABSENCE":
      return {
        calculation_id: "CALC_SPOUSAL_ABSENCE",
        result: { daily_early_departure_hours: 1, wage_deduction: false },
        description: "1-hour daily early departure without wage deduction",
      };
    case "CALC_SPOUSAL_LEAVE_TIER1":
      return {
        calculation_id: "CALC_SPOUSAL_LEAVE_TIER1",
        result: {
          granted_paid_leave_days: 3,
          deduction_prohibited: ["sick_leave", "vacation"],
        },
        description: "3 days paid leave, not deducted from sick/vacation",
      };
    case "CALC_SPOUSAL_LEAVE_TIER2":
      return {
        calculation_id: "CALC_SPOUSAL_LEAVE_TIER2",
        result: {
          granted_paid_leave_days: 4,
          deduction_prohibited: ["sick_leave", "vacation"],
        },
        description: "4 days paid leave, not deducted from sick/vacation",
      };
    case "CALC_MATERNITY_TRANSPORT":
      return {
        calculation_id: "CALC_MATERNITY_TRANSPORT",
        result: {
          reimbursement_basis: "invoice_amount",
          mda_monopoly_removed: true,
        },
        description:
          "Full reimbursement based on transport invoice, any licensed provider",
      };
    case "CALC_PREGNANCY_PRESERVATION":
      return {
        calculation_id: "CALC_PREGNANCY_PRESERVATION",
        result: { coverage_status: "continuous" },
        description: "Pregnancy preservation coverage continues uninterrupted",
      };
    case "CALC_INCOME_SUPPORT":
      return {
        calculation_id: "CALC_INCOME_SUPPORT",
        result: { evaluation_basis: "household_asset_test" },
        description: "Income support based on household asset test",
      };
    default:
      return null;
  }
}
