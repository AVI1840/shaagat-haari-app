import {
  CitizenProfileSchema,
  type CitizenProfile,
} from "@/schemas/citizen-profile";
import type {
  EngineResult,
  ConfidenceLevel,
  ActionStep,
} from "@/schemas/engine-result";
import { evaluateRules } from "./rule-evaluator";
import { evaluateTimeline } from "./timeline-evaluator";
import { evaluateEdgeCases } from "./edge-case-handler";
import { executeCalculation } from "./calculation-service";
import { resolveDocumentChecklist } from "./document-resolver";
import {
  translateResultToHebrew,
  translateBenefitType,
} from "./hebrew-translator";

export function runEligibilityEngine(
  rawProfile: Partial<CitizenProfile>
): EngineResult {
  const parseResult = CitizenProfileSchema.safeParse(rawProfile);
  if (!parseResult.success) {
    return makeErrorResult(
      "חלק מהנתונים שהוזנו אינם תקינים. נא לבדוק ולנסות שוב.",
      ["VALIDATION_ERROR"],
      parseResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`)
    );
  }

  const profile = parseResult.data;
  const timeline = evaluateTimeline(profile);

  const enriched: CitizenProfile = {
    ...profile,
    chalath_continuous_duration:
      timeline.chalath_continuous_duration ??
      profile.chalath_continuous_duration,
    chalath_months_continuous: timeline.chalath_months_continuous,
    dynamic_akshara_threshold: timeline.dynamic_akshara_threshold,
  };

  const edgeCases = evaluateEdgeCases(enriched, timeline);
  const triggeredEdgeCases = edgeCases.filter((ec) => ec.triggered);

  // Blocking edge case
  const blockingEdgeCase = triggeredEdgeCases.find(
    (ec) => ec.modified_status === "denied"
  );
  if (blockingEdgeCase) {
    return {
      eligibility_status: "denied",
      benefit_type: "emergency_unemployment_chalath",
      benefit_label: 'דמי אבטלה חירום (חל"ת)',
      calculation_reference: null,
      confidence_level: "high",
      claim_readiness: "not_eligible",
      headline: blockingEdgeCase.description,
      explanation_for_citizen: blockingEdgeCase.description,
      action_steps: [
        {
          step_number: 1,
          action: "פנה/י לסניף ביטוח לאומי לבירור",
          detail: "ניתן גם להתקשר ל-*6050",
          completed: false,
        },
      ],
      documents: [],
      amount_estimate: null,
      internal_reason_codes: [blockingEdgeCase.edge_case_id],
      flags: blockingEdgeCase.flags,
    };
  }

  // Evaluate rules
  const { matchedRule, allMatched } = evaluateRules(enriched);

  if (!matchedRule) {
    return makeErrorResult(
      "לא ניתן לקבוע זכאות על סמך הנתונים שהוזנו. נדרשת בדיקה נוספת.",
      ["NO_RULE_MATCHED"]
    );
  }

  // Calculation
  let calculationResult = null;
  let amountEstimate: string | null = null;
  if (matchedRule.result.calculation_reference) {
    calculationResult = executeCalculation(
      matchedRule.result.calculation_reference,
      enriched
    );
    amountEstimate = formatAmountEstimate(calculationResult?.result || null);
  }

  // Documents
  const documents = resolveDocumentChecklist(
    matchedRule.result.required_documents,
    triggeredEdgeCases
  );

  // Flags
  const allFlags = [
    ...triggeredEdgeCases.flatMap((ec) => ec.flags),
    ...(matchedRule.result.fallback_action
      ? [matchedRule.result.fallback_action]
      : []),
  ];

  // Final status
  let finalStatus = matchedRule.result.eligibility_status;
  const deductionEdgeCase = triggeredEdgeCases.find(
    (ec) => ec.modified_status === "approved_with_deduction"
  );
  if (deductionEdgeCase && finalStatus === "approved") {
    finalStatus = "approved_with_deduction";
  }

  // Confidence
  const confidence = computeConfidence(enriched, triggeredEdgeCases);

  // Claim readiness
  const missingDocs = documents.filter((d) => d.status === "missing");
  const claimReadiness =
    finalStatus === "denied"
      ? "not_eligible"
      : finalStatus === "requires_edge_case_handling"
        ? "requires_review"
        : missingDocs.length > 0
          ? "missing_documents"
          : "ready_to_submit";

  // Action steps
  const actionSteps = buildActionSteps(
    finalStatus,
    matchedRule.result.benefit_type,
    documents
  );

  // Missing info
  const missingInfo = detectMissingInformation(enriched);

  // Headline
  const benefitLabel = translateBenefitType(matchedRule.result.benefit_type);
  const headline = buildHeadline(finalStatus, benefitLabel);

  return {
    eligibility_status: finalStatus as EngineResult["eligibility_status"],
    benefit_type: matchedRule.result.benefit_type,
    benefit_label: benefitLabel,
    calculation_reference: matchedRule.result.calculation_reference,
    confidence_level: confidence,
    claim_readiness: claimReadiness as EngineResult["claim_readiness"],
    headline,
    explanation_for_citizen: translateResultToHebrew(
      matchedRule,
      triggeredEdgeCases,
      timeline
    ),
    action_steps: actionSteps,
    documents,
    amount_estimate: amountEstimate,
    internal_reason_codes: [
      matchedRule.result.reason_code,
      ...allMatched.slice(1).map((r) => r.result.reason_code),
    ],
    flags: allFlags.length > 0 ? allFlags : undefined,
    fallback_action: matchedRule.result.fallback_action || null,
    timeline_notes:
      triggeredEdgeCases
        .filter((ec) => ec.timeline_note)
        .map((ec) => ec.timeline_note)
        .join("; ") || null,
    calculation_result: calculationResult?.result || null,
    missing_information: missingInfo.length > 0 ? missingInfo : undefined,
  };
}

function makeErrorResult(
  message: string,
  codes: string[],
  flags?: string[]
): EngineResult {
  return {
    eligibility_status: "pending_secondary_review",
    benefit_type: "unknown",
    benefit_label: "לא ידוע",
    calculation_reference: null,
    confidence_level: "low",
    claim_readiness: "missing_information",
    headline: "נדרש מידע נוסף",
    explanation_for_citizen: message,
    action_steps: [
      {
        step_number: 1,
        action: "פנה/י לסניף ביטוח לאומי לבירור",
        detail: "ניתן גם להתקשר ל-*6050",
        completed: false,
      },
    ],
    documents: [],
    amount_estimate: null,
    internal_reason_codes: codes,
    flags,
  };
}

function computeConfidence(
  profile: CitizenProfile,
  edgeCases: { triggered: boolean }[]
): ConfidenceLevel {
  const triggeredCount = edgeCases.filter((ec) => ec.triggered).length;
  const hasAge = profile.applicant_age_decimal !== undefined;
  const hasEmployment = profile.employment_classification !== undefined;

  if (!hasAge || !hasEmployment) return "low";
  if (triggeredCount >= 2) return "medium";
  if (triggeredCount >= 1) return "medium";
  return "high";
}

function buildHeadline(status: string, benefitLabel: string): string {
  switch (status) {
    case "approved":
      return `נראה שאת/ה זכאי/ת ל${benefitLabel}`;
    case "approved_with_deduction":
      return `נראה שאת/ה זכאי/ת ל${benefitLabel} (עם ניכוי)`;
    case "pending_secondary_review":
      return "הבקשה הועברה לבדיקה נוספת";
    case "requires_edge_case_handling":
      return "נדרשת בדיקה ידנית של המקרה שלך";
    case "denied":
      return "לא נמצאה זכאות במסלול זה";
    default:
      return "תוצאת הבדיקה";
  }
}

function buildActionSteps(
  status: string,
  benefitType: string,
  documents: { id: string; label: string; status: string }[]
): ActionStep[] {
  const steps: ActionStep[] = [];
  let n = 1;

  if (status === "denied") {
    steps.push({
      step_number: n++,
      action: "בדוק/י זכאות להבטחת הכנסה",
      detail: "הבקשה הועברה אוטומטית לבדיקה",
      completed: false,
    });
    steps.push({
      step_number: n++,
      action: "פנה/י לסניף ביטוח לאומי לייעוץ",
      detail: "ניתן גם להתקשר ל-*6050",
      completed: false,
    });
    return steps;
  }

  if (
    benefitType === "emergency_unemployment_chalath" ||
    benefitType === "income_support_haftachat_hachnasa"
  ) {
    steps.push({
      step_number: n++,
      action: "הירשם/י בשירות התעסוקה",
      detail: "חובה להירשם לפני הגשת תביעה",
      link: "https://www.taasuka.gov.il",
      completed: false,
    });
  }

  const missingDocs = documents.filter((d) => d.status === "missing");
  if (missingDocs.length > 0) {
    steps.push({
      step_number: n++,
      action: "אסוף/י את המסמכים הנדרשים",
      detail: `חסרים ${missingDocs.length} מסמכים - ראה/י רשימה למטה`,
      completed: false,
    });
  }

  if (benefitType === "emergency_unemployment_chalath") {
    steps.push({
      step_number: n++,
      action: "ודא/י שהמעסיק הגיש טופס 100",
      detail: "ללא טופס 100 לא ניתן לעבד את התביעה",
      completed: false,
    });
  }

  steps.push({
    step_number: n++,
    action: "הגש/י תביעה באתר ביטוח לאומי",
    detail: "ניתן להגיש גם בסניף או בטלפון *6050",
    link: "https://www.btl.gov.il",
    completed: false,
  });

  if (
    benefitType === "maternity_transport_reimbursement"
  ) {
    steps.push({
      step_number: n++,
      action: "צרף/י חשבונית מספק ההובלה",
      detail: "כולל אמבולנס פרטי מורשה",
      completed: false,
    });
  }

  return steps;
}

function formatAmountEstimate(
  calcResult: Record<string, unknown> | null
): string | null {
  if (!calcResult) return null;

  if (calcResult.daily_grant_final !== undefined) {
    return `עד ${calcResult.daily_grant_final} ש"ח ליום`;
  }
  if (calcResult.total_employer_compensation !== undefined) {
    return `${calcResult.total_employer_compensation} ש"ח פיצוי למעסיק`;
  }
  if (calcResult.granted_paid_leave_days !== undefined) {
    return `${calcResult.granted_paid_leave_days} ימי חופשה בתשלום`;
  }
  if (calcResult.daily_early_departure_hours !== undefined) {
    return "שעת יציאה מוקדמת יומית";
  }
  if (calcResult.payment_starts_from === "day_1") {
    return "תשלום מיום ראשון (ללא ימי המתנה)";
  }
  return null;
}

function detectMissingInformation(profile: CitizenProfile): string[] {
  const missing: string[] = [];
  if (profile.applicant_age_decimal === undefined)
    missing.push("תאריך לידה");
  if (profile.employment_classification === undefined)
    missing.push("סוג העסקה");
  return missing;
}
