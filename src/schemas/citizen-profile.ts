import { z } from "zod";

export const CitizenProfileSchema = z.object({
  applicant_is_alive: z.boolean().default(true),
  applicant_age_decimal: z.number().min(0).max(120).optional(),
  applicant_date_of_birth: z.string().optional(),
  applicant_gender: z.enum(["M", "F"]).optional(),
  claim_submission_date: z.string().optional(),

  // Employment
  employment_classification: z
    .enum(["salaried", "independent", "dual"])
    .optional(),
  tofes_100_submitted: z.boolean().default(false),
  employment_service_registered: z.boolean().default(false),
  is_full_time_employee: z.boolean().default(false),

  // Demographic flags
  geospatial_evacuee_flag: z.boolean().default(false),
  disability_status_indicator: z.boolean().default(false),
  idf_discharged_status: z.boolean().default(false),

  // Chalath
  chalath_commencement_date: z.string().optional(),
  chalath_termination_date: z.string().nullable().optional(),
  chalath_continuous_duration: z.number().min(0).optional(),
  permitted_labor_days: z.number().min(0).max(2).default(0),

  // Akshara
  akshara_base_months: z.number().min(0).max(18).optional(),

  // Senior grant
  employment_terminated_due_to_operation: z.boolean().default(false),
  wage_months_preceding_6: z.array(z.number()).max(6).optional(),

  // Maternity
  maternity_protection_end: z.string().nullable().optional(),
  transported_via_licensed_ambulance: z.boolean().default(false),
  transport_provider_license_valid: z.boolean().default(false),
  pregnancy_preservation_active: z.boolean().default(false),
  provident_fund_deposits_maintained: z.boolean().default(false),

  // Spousal reserve
  spouse_reserve_days: z.number().min(0).default(0),
  child_age_minimum: z.number().min(0).nullable().optional(),

  // Employer reserve
  social_contributions_maintained: z.boolean().default(false),
  employee_reserve_days_march_2026: z.number().min(0).default(0),
  average_daily_wage_3_months: z.number().optional(),

  // Dual status
  independent_income_declared: z.number().nullable().optional(),
  cpa_certification_submitted: z.boolean().default(false),

  // Overtime
  overtime_weekly_extra_hours: z.number().optional(),
  overtime_total_weekly_hours: z.number().optional(),
  overtime_daily_hours: z.number().optional(),
  overtime_monthly_extra_hours: z.number().optional(),
  employee_consent_overtime: z.boolean().default(false),

  // Computed
  chalath_months_continuous: z.number().min(0).default(0),
  receiving_unemployment_benefits: z.boolean().default(false),
  dynamic_akshara_threshold: z.number().default(6),
});

export type CitizenProfile = z.infer<typeof CitizenProfileSchema>;
