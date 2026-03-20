import type { CitizenProfile } from "@/schemas/citizen-profile";

const OPERATION_START = "2026-03-01";
const OPERATION_END = "2026-03-15";
const OVERTIME_START = "2026-03-02";
const OVERTIME_END = "2026-03-19";
const SPOUSAL_PROTECTION_END = "2026-06-30";
const MEDICAL_COMMITTEE_RESUME = "2026-03-06";

export interface TimelineResult {
  chalath_continuous_duration: number | null;
  chalath_within_operation: boolean;
  chalath_months_continuous: number;
  maternity_protection_frozen: boolean;
  maternity_remaining_days: number | null;
  maternity_new_protection_end: string | null;
  overtime_window_active: boolean;
  spousal_protection_active: boolean;
  medical_committee_mode: "remote" | "physical" | "remote_high_risk";
  dynamic_akshara_threshold: number;
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

function fullMonthsBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  let months = (e.getFullYear() - s.getFullYear()) * 12;
  months += e.getMonth() - s.getMonth();
  if (e.getDate() < s.getDate()) months--;
  return Math.max(0, months);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function evaluateTimeline(profile: CitizenProfile): TimelineResult {
  const result: TimelineResult = {
    chalath_continuous_duration: null,
    chalath_within_operation: false,
    chalath_months_continuous: 0,
    maternity_protection_frozen: false,
    maternity_remaining_days: null,
    maternity_new_protection_end: null,
    overtime_window_active: false,
    spousal_protection_active: false,
    medical_committee_mode: "physical",
    dynamic_akshara_threshold: 6,
  };

  // Chalath duration
  if (profile.chalath_commencement_date) {
    const endDate =
      profile.chalath_termination_date ||
      new Date().toISOString().split("T")[0];
    result.chalath_continuous_duration = daysBetween(
      profile.chalath_commencement_date,
      endDate
    );
    result.chalath_within_operation =
      profile.chalath_commencement_date >= OPERATION_START &&
      profile.chalath_commencement_date <= OPERATION_END;
    result.chalath_months_continuous = fullMonthsBetween(
      profile.chalath_commencement_date,
      endDate
    );
  }

  // Maternity protection freeze
  if (
    profile.maternity_protection_end &&
    profile.chalath_commencement_date &&
    profile.chalath_commencement_date <= profile.maternity_protection_end
  ) {
    result.maternity_protection_frozen = true;
    const remaining = daysBetween(
      profile.chalath_commencement_date,
      profile.maternity_protection_end
    );
    result.maternity_remaining_days = remaining;
    const chalathEnd =
      profile.chalath_termination_date ||
      new Date().toISOString().split("T")[0];
    result.maternity_new_protection_end = addDays(chalathEnd, remaining);
  }

  // Overtime window
  const claimDate =
    profile.claim_submission_date || new Date().toISOString().split("T")[0];
  result.overtime_window_active =
    claimDate >= OVERTIME_START && claimDate <= OVERTIME_END;

  // Spousal termination protection
  if (profile.spouse_reserve_days > 0 && claimDate <= SPOUSAL_PROTECTION_END) {
    result.spousal_protection_active = true;
  }

  // Medical committee routing
  if (claimDate < MEDICAL_COMMITTEE_RESUME) {
    result.medical_committee_mode = "remote";
  } else if (profile.geospatial_evacuee_flag) {
    result.medical_committee_mode = "remote_high_risk";
  } else {
    result.medical_committee_mode = "physical";
  }

  // Dynamic akshara threshold
  if (profile.geospatial_evacuee_flag) {
    result.dynamic_akshara_threshold = 2;
  } else if (
    profile.disability_status_indicator ||
    profile.idf_discharged_status
  ) {
    result.dynamic_akshara_threshold = 3;
  } else {
    result.dynamic_akshara_threshold = 6;
  }

  return result;
}
