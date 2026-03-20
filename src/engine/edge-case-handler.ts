import type { CitizenProfile } from "@/schemas/citizen-profile";
import type { TimelineResult } from "./timeline-evaluator";

export interface EdgeCaseResult {
  edge_case_id: string;
  triggered: boolean;
  description: string;
  resolution: string;
  flags: string[];
  modified_status?: string;
  modified_documents?: string[];
  timeline_note?: string;
}

export function evaluateEdgeCases(
  profile: CitizenProfile,
  timeline: TimelineResult
): EdgeCaseResult[] {
  const results: EdgeCaseResult[] = [];

  // EC001: Maternity-Chalath intersection
  if (timeline.maternity_protection_frozen) {
    results.push({
      edge_case_id: "EC001_MATERNITY_CHALATH_INTERSECTION",
      triggered: true,
      description:
        "חל\"ת התחיל בתוך תקופת ההגנה של 60 יום לאחר חופשת לידה",
      resolution: "freeze_and_resume_timer",
      flags: ["maternity_protection_frozen", "protection_timer_extended"],
      timeline_note: timeline.maternity_new_protection_end
        ? `תקופת ההגנה הוקפאה. תאריך הגנה חדש: ${timeline.maternity_new_protection_end}`
        : undefined,
      modified_documents: [
        "tofes_100_employer_report",
        "maternity_leave_documentation",
        "employment_service_registration",
      ],
    });
  }

  // EC002: Intermittent work during chalath
  if (
    profile.permitted_labor_days > 0 &&
    profile.permitted_labor_days <= 2 &&
    (profile.chalath_continuous_duration ?? 0) >= 14
  ) {
    results.push({
      edge_case_id: "EC002_INTERMITTENT_WORK_DURING_CHALATH",
      triggered: true,
      description: `עבדת ${profile.permitted_labor_days} ימים במהלך החל\"ת. זה מותר עד 2 ימים.`,
      resolution: "allow_with_deduction",
      flags: ["intermittent_work_deduction_applied"],
      modified_status: "approved_with_deduction",
    });
  }

  // EC003: Dual employment
  if (profile.employment_classification === "dual") {
    results.push({
      edge_case_id: "EC003_DUAL_EMPLOYMENT_PROCESSING",
      triggered: true,
      description:
        "מועסק/ת גם כשכיר/ה וגם כעצמאי/ת. הזכאות נבדקת לפי המשרה השכירה בלבד.",
      resolution: "split_evaluation",
      flags: ["dual_status", "independent_income_reconciliation_pending"],
      modified_status: "approved_with_deduction",
      modified_documents: [
        "tofes_100_employer_report",
        "employment_service_registration",
        "cpa_certification_independent_revenue",
      ],
    });
  }

  // EC004: Private ambulance maternity
  if (
    profile.transported_via_licensed_ambulance &&
    profile.transport_provider_license_valid
  ) {
    results.push({
      edge_case_id: "EC004_PRIVATE_AMBULANCE_MATERNITY",
      triggered: true,
      description:
        'הובלה באמבולנס פרטי מורשה. ביטול הבלעדיות של מד"א.',
      resolution: "accept_private_provider",
      flags: ["mda_monopoly_override"],
    });
  }

  // EC006: Permitted labor exceeded
  if (profile.permitted_labor_days > 2) {
    results.push({
      edge_case_id: "EC006_PERMITTED_LABOR_EXCEEDED",
      triggered: true,
      description:
        "עבדת יותר מ-2 ימים במהלך החל\"ת. רצף החל\"ת בוטל.",
      resolution: "void_chalath_continuity",
      flags: ["permitted_labor_exceeded", "chalath_continuity_voided"],
      modified_status: "denied",
    });
  }

  // EC007: Spousal termination attempt
  if (timeline.spousal_protection_active) {
    results.push({
      edge_case_id: "EC007_SPOUSAL_TERMINATION_PROTECTION",
      triggered: true,
      description:
        "בן/בת הזוג שירת/ה במילואים. הגנה מפני פיטורים עד 30.06.2026.",
      resolution: "block_and_flag",
      flags: ["spousal_termination_protected"],
    });
  }

  // EC008: Medical committee routing
  if (
    timeline.medical_committee_mode === "remote" ||
    timeline.medical_committee_mode === "remote_high_risk"
  ) {
    results.push({
      edge_case_id: "EC008_MEDICAL_COMMITTEE_ROUTING",
      triggered: true,
      description:
        timeline.medical_committee_mode === "remote"
          ? "ועדות רפואיות פיזיות מושעות. הערכה מרחוק בלבד."
          : "אזור סיכון גבוה. הערכה מרחוק נמשכת.",
      resolution: "route_to_remote_evaluation",
      flags: ["medical_committee_remote"],
    });
  }

  return results;
}
