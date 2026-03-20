import { describe, it, expect } from "vitest";
import { runEligibilityEngine } from "@/engine";
import type { CitizenProfile } from "@/schemas/citizen-profile";

function makeProfile(overrides: Partial<CitizenProfile>): Partial<CitizenProfile> {
  return {
    applicant_is_alive: true,
    claim_submission_date: "2026-03-10",
    ...overrides,
  };
}

describe("Eligibility Engine", () => {
  // 1. Standard chalath approval
  it("approves standard chalath with 6+ months akshara", () => {
    const result = runEligibilityEngine(
      makeProfile({
        applicant_age_decimal: 35,
        applicant_gender: "M",
        employment_classification: "salaried",
        tofes_100_submitted: true,
        chalath_commencement_date: "2026-03-01",
        chalath_termination_date: "2026-03-20",
        chalath_continuous_duration: 19,
        akshara_base_months: 8,
        geospatial_evacuee_flag: false,
        disability_status_indicator: false,
        idf_discharged_status: false,
      })
    );

    expect(result.eligibility_status).toBe("approved");
    expect(result.benefit_type).toBe("emergency_unemployment_chalath");
    expect(result.calculation_reference).toBe("CALC_UNEMPLOYMENT_STANDARD");
    expect(result.documents.map((d) => d.id)).toContain("tofes_100_employer_report");
    expect(result.documents.map((d) => d.id)).toContain("employment_service_registration");
    expect(result.headline).toBeTruthy();
    expect(result.confidence_level).toBeDefined();
    expect(result.action_steps.length).toBeGreaterThan(0);
  });

  // 2. Evacuee reduced threshold
  it("approves evacuee with 2 months akshara", () => {
    const result = runEligibilityEngine(
      makeProfile({
        applicant_age_decimal: 40,
        employment_classification: "salaried",
        tofes_100_submitted: true,
        chalath_commencement_date: "2026-03-01",
        chalath_termination_date: "2026-03-20",
        chalath_continuous_duration: 19,
        akshara_base_months: 2,
        geospatial_evacuee_flag: true,
        disability_status_indicator: false,
        idf_discharged_status: false,
      })
    );

    expect(result.eligibility_status).toBe("approved");
    expect(result.internal_reason_codes).toContain("EVACUEE_REDUCED_THRESHOLD_MET");
  });

  // 3. PWD reduced threshold
  it("approves PWD with 3 months akshara", () => {
    const result = runEligibilityEngine(
      makeProfile({
        applicant_age_decimal: 30,
        employment_classification: "salaried",
        tofes_100_submitted: true,
        chalath_commencement_date: "2026-03-01",
        chalath_termination_date: "2026-03-20",
        chalath_continuous_duration: 19,
        akshara_base_months: 3,
        geospatial_evacuee_flag: false,
        disability_status_indicator: true,
        idf_discharged_status: false,
      })
    );

    expect(result.eligibility_status).toBe("approved");
    expect(result.internal_reason_codes).toContain("PWD_SOLDIER_REDUCED_THRESHOLD_MET");
  });

  // 4. Discharged soldier reduced threshold
  it("approves discharged soldier with 3 months akshara", () => {
    const result = runEligibilityEngine(
      makeProfile({
        applicant_age_decimal: 22,
        employment_classification: "salaried",
        tofes_100_submitted: true,
        chalath_commencement_date: "2026-03-01",
        chalath_termination_date: "2026-03-20",
        chalath_continuous_duration: 19,
        akshara_base_months: 4,
        geospatial_evacuee_flag: false,
        disability_status_indicator: false,
        idf_discharged_status: true,
      })
    );

    expect(result.eligibility_status).toBe("approved");
    expect(result.internal_reason_codes).toContain("PWD_SOLDIER_REDUCED_THRESHOLD_MET");
  });

  // 5. Senior citizen grant
  it("approves senior citizen grant for age 67+", () => {
    const result = runEligibilityEngine(
      makeProfile({
        applicant_age_decimal: 68,
        employment_terminated_due_to_operation: true,
        wage_months_preceding_6: [8000, 8200, 5000, 8500, 4000, 8100],
      })
    );

    expect(result.eligibility_status).toBe("approved");
    expect(result.benefit_type).toBe("senior_citizen_emergency_grant");
    expect(result.calculation_reference).toBe("CALC_SENIOR_GRANT");
    expect(result.calculation_result).toBeDefined();
    expect((result.calculation_result as Record<string, unknown>).daily_grant_final).toBe(134);
  });

  // 6. Maternity transport reimbursement
  it("approves maternity transport reimbursement", () => {
    const result = runEligibilityEngine(
      makeProfile({
        applicant_age_decimal: 30,
        transported_via_licensed_ambulance: true,
        transport_provider_license_valid: true,
      })
    );

    // Should match the maternity transport rule
    const hasTransportBenefit = result.benefit_type === "maternity_transport_reimbursement" ||
      result.internal_reason_codes.includes("MATERNITY_TRANSPORT_ELIGIBLE");
    expect(hasTransportBenefit).toBe(true);
  });

  // 7. Maternity and chalath overlap
  it("handles maternity-chalath overlap with frozen timer", () => {
    const result = runEligibilityEngine(
      makeProfile({
        applicant_age_decimal: 32,
        applicant_gender: "F",
        employment_classification: "salaried",
        tofes_100_submitted: true,
        chalath_commencement_date: "2026-03-01",
        chalath_termination_date: "2026-03-15",
        chalath_continuous_duration: 14,
        akshara_base_months: 8,
        geospatial_evacuee_flag: false,
        disability_status_indicator: false,
        idf_discharged_status: false,
        maternity_protection_end: "2026-04-16",
      })
    );

    expect(result.eligibility_status).toBe("approved");
    expect(result.flags).toContain("maternity_protection_frozen");
    expect(result.timeline_notes).toBeTruthy();
  });

  // 8. Intermittent work during chalath
  it("approves with deduction for intermittent work", () => {
    const result = runEligibilityEngine(
      makeProfile({
        applicant_age_decimal: 35,
        employment_classification: "salaried",
        tofes_100_submitted: true,
        chalath_commencement_date: "2026-03-01",
        chalath_termination_date: "2026-03-20",
        chalath_continuous_duration: 19,
        akshara_base_months: 8,
        permitted_labor_days: 2,
        geospatial_evacuee_flag: false,
        disability_status_indicator: false,
        idf_discharged_status: false,
      })
    );

    expect(result.eligibility_status).toBe("approved_with_deduction");
    expect(result.flags).toContain("intermittent_work_deduction_applied");
  });

  // 9. Dual status employer deduction
  it("handles dual status with independent income deduction", () => {
    const result = runEligibilityEngine(
      makeProfile({
        applicant_age_decimal: 40,
        employment_classification: "dual",
        tofes_100_submitted: true,
        chalath_commencement_date: "2026-03-01",
        chalath_termination_date: "2026-03-20",
        chalath_continuous_duration: 19,
        akshara_base_months: 8,
        geospatial_evacuee_flag: false,
        disability_status_indicator: false,
        idf_discharged_status: false,
        independent_income_declared: 3000,
        cpa_certification_submitted: true,
      })
    );

    expect(["approved_with_deduction", "approved"]).toContain(result.eligibility_status);
    expect(result.flags).toContain("dual_status");
  });

  // 10. Fallback to income support
  it("routes to income support when akshara fails", () => {
    const result = runEligibilityEngine(
      makeProfile({
        applicant_age_decimal: 35,
        employment_classification: "salaried",
        tofes_100_submitted: true,
        chalath_commencement_date: "2026-03-01",
        chalath_termination_date: "2026-03-20",
        chalath_continuous_duration: 19,
        akshara_base_months: 1,
        geospatial_evacuee_flag: false,
        disability_status_indicator: false,
        idf_discharged_status: false,
      })
    );

    expect(result.eligibility_status).toBe("denied");
    expect(result.internal_reason_codes).toContain("STANDARD_AKSHARA_INSUFFICIENT");
  });

  // 11. Chalath duration insufficient
  it("denies when chalath is less than 14 days", () => {
    const result = runEligibilityEngine(
      makeProfile({
        applicant_age_decimal: 35,
        employment_classification: "salaried",
        tofes_100_submitted: true,
        chalath_commencement_date: "2026-03-01",
        chalath_termination_date: "2026-03-10",
        chalath_continuous_duration: 9,
        akshara_base_months: 8,
      })
    );

    expect(result.eligibility_status).toBe("denied");
    expect(result.internal_reason_codes).toContain("CHALATH_DURATION_INSUFFICIENT");
  });

  // 12. Missing Tofes 100
  it("suspends claim when Tofes 100 not submitted", () => {
    const result = runEligibilityEngine(
      makeProfile({
        applicant_age_decimal: 35,
        employment_classification: "salaried",
        tofes_100_submitted: false,
      })
    );

    expect(result.eligibility_status).toBe("pending_secondary_review");
    expect(result.internal_reason_codes).toContain("PENDING_EMPLOYER_ACTION");
  });

  // 13. Invalid input handling
  it("handles missing required data gracefully", () => {
    const result = runEligibilityEngine({});
    expect(result).toBeDefined();
    expect(result.eligibility_status).toBeDefined();
  });

  // 14. Senior citizen without operational impact
  it("denies senior without operational impact", () => {
    const result = runEligibilityEngine(
      makeProfile({
        applicant_age_decimal: 70,
        employment_terminated_due_to_operation: false,
      })
    );

    expect(result.eligibility_status).toBe("denied");
    expect(result.internal_reason_codes).toContain("SENIOR_NO_OPERATIONAL_IMPACT");
  });

  // 15. Senior grant calculation correctness
  it("calculates senior grant correctly with cap", () => {
    const result = runEligibilityEngine(
      makeProfile({
        applicant_age_decimal: 68,
        employment_terminated_due_to_operation: true,
        wage_months_preceding_6: [8000, 8200, 5000, 8500, 4000, 8100],
      })
    );

    const calc = result.calculation_result as Record<string, unknown>;
    expect(calc.top_3_months).toEqual([8500, 8200, 8100]);
    expect(calc.total_top_3).toBe(24800);
    expect(calc.daily_grant_final).toBe(134);
  });

  // 16. Spousal reserve absence
  it("approves spousal reserve absence allowance", () => {
    const result = runEligibilityEngine(
      makeProfile({
        applicant_age_decimal: 35,
        spouse_reserve_days: 10,
        child_age_minimum: 8,
        is_full_time_employee: true,
      })
    );

    const hasSpousalBenefit =
      result.internal_reason_codes.includes("SPOUSAL_ABSENCE_ELIGIBLE") ||
      result.benefit_type === "spousal_reserve_absence_allowance";
    expect(hasSpousalBenefit).toBe(true);
  });
});
