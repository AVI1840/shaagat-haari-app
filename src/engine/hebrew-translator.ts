import type { Rule } from "./rule-evaluator";
import type { EdgeCaseResult } from "./edge-case-handler";
import type { TimelineResult } from "./timeline-evaluator";

const BENEFIT_LABELS: Record<string, string> = {
  emergency_unemployment_chalath: 'דמי אבטלה חירום (חל"ת)',
  senior_citizen_emergency_grant: "מענק חירום לאזרחים ותיקים",
  employer_reserve_compensation: "פיצוי מעסיק עבור שירות מילואים",
  spousal_reserve_absence_allowance: "היעדרות בן/בת זוג של משרת/ת מילואים",
  spousal_reserve_protected_leave: "חופשה מוגנת לבן/בת זוג של משרת/ת מילואים",
  spousal_termination_protection: "הגנה מפני פיטורים לבן/בת זוג של משרת/ת מילואים",
  maternity_transport_reimbursement: "החזר הוצאות הסעה ללידה",
  pregnancy_preservation_continuity: "רציפות שמירת הריון",
  expanded_overtime_authorization: "אישור שעות נוספות מורחב",
  income_support_haftachat_hachnasa: "הבטחת הכנסה",
  none: "אין",
  unknown: "לא ידוע",
};

const STATUS_LABELS: Record<string, string> = {
  approved: "מאושר",
  approved_with_deduction: "מאושר עם ניכוי",
  requires_edge_case_handling: "נדרשת בדיקה נוספת",
  pending_secondary_review: "ממתין לבדיקה משנית",
  denied: "לא אושר",
};

export function translateBenefitType(benefitType: string): string {
  return BENEFIT_LABELS[benefitType] || benefitType;
}

export function translateStatus(status: string): string {
  return STATUS_LABELS[status] || status;
}

export function translateResultToHebrew(
  rule: Rule,
  edgeCases: EdgeCaseResult[],
  timeline: TimelineResult
): string {
  const parts: string[] = [];

  // Main explanation
  const statusLabel = STATUS_LABELS[rule.result.eligibility_status] || rule.result.eligibility_status;
  const benefitLabel = BENEFIT_LABELS[rule.result.benefit_type] || rule.result.benefit_type;

  parts.push(`סטטוס: ${statusLabel}`);
  parts.push(`סוג הזכאות: ${benefitLabel}`);

  // Add reason in plain Hebrew
  const reasonMap: Record<string, string> = {
    APPLICANT_DECEASED: "המבקש/ת סומן/ה כנפטר/ת במרשם האוכלוסין.",
    SENIOR_GRANT_ELIGIBLE: "עובד/ת מעל גיל 67 שעבודתו/ה הופסקה עקב המבצע. זכאי/ת למענק חירום.",
    SENIOR_NO_OPERATIONAL_IMPACT: "עובד/ת מעל גיל 67 אך העבודה לא הופסקה עקב המבצע.",
    PENDING_EMPLOYER_ACTION: "המעסיק טרם הגיש טופס 100. התביעה מושהית.",
    CHALATH_DURATION_INSUFFICIENT: 'תקופת החל"ת קצרה מ-14 יום. נדרשים לפחות 14 ימי חל"ת רצופים.',
    EVACUEE_REDUCED_THRESHOLD_MET: "מפונה מאזור הצפון עם 2 חודשי עבודה לפחות. מאושר בסף מופחת.",
    EVACUEE_AKSHARA_INSUFFICIENT: "מפונה מאזור הצפון אך פחות מ-2 חודשי עבודה. הבקשה הועברה להבטחת הכנסה.",
    PWD_SOLDIER_REDUCED_THRESHOLD_MET: "אדם עם מוגבלות או חייל משוחרר עם 3 חודשי עבודה לפחות. מאושר בסף מופחת.",
    PWD_SOLDIER_AKSHARA_INSUFFICIENT: "אדם עם מוגבלות או חייל משוחרר אך פחות מ-3 חודשי עבודה. הבקשה הועברה להבטחת הכנסה.",
    STANDARD_THRESHOLD_MET: 'עובד/ת עם 6 חודשי עבודה לפחות וחל"ת של 14 יום ומעלה. מאושר.',
    STANDARD_AKSHARA_INSUFFICIENT: "פחות מ-6 חודשי עבודה ללא הקלות דמוגרפיות. הבקשה הועברה להבטחת הכנסה.",
    DUAL_STATUS_INDEPENDENT_DEDUCTION: "מאושר על בסיס המשרה השכירה. הכנסה עצמאית תנוכה מהתשלום.",
    EMPLOYER_RESERVE_COMP_ELIGIBLE: "המעסיק שמר על הפקדות סוציאליות בזמן שירות מילואים. זכאי לפיצוי.",
    SPOUSAL_ABSENCE_ELIGIBLE: "בן/בת זוג שירת/ה 5 ימים ומעלה, ילד מתחת לגיל 13. זכאי/ת לשעת היעדרות יומית.",
    SPOUSAL_LEAVE_TIER1: "בן/בת זוג שירת/ה 31-60 ימי מילואים. זכאי/ת ל-3 ימי חופשה בתשלום.",
    SPOUSAL_LEAVE_TIER2: "בן/בת זוג שירת/ה 61-90 ימי מילואים. זכאי/ת ל-4 ימי חופשה בתשלום.",
    MATERNITY_TRANSPORT_ELIGIBLE: 'הובלה באמבולנס מורשה. ביטול בלעדיות מד"א. החזר מאושר.',
    PREGNANCY_PRESERVATION_ELIGIBLE: "שמירת הריון פעילה עם הפקדות לקופת גמל. רציפות כיסוי מאושרת.",
    PREGNANCY_PRESERVATION_FUND_LAPSED: "שמירת הריון פעילה אך הפקדות לקופת גמל לא נשמרו. נדרשת בדיקה.",
    OVERTIME_COMPLIANT: "שעות נוספות בגבולות המותרים עם הסכמת עובד/ת.",
    SPOUSAL_TERMINATION_PROTECTED: "בן/בת זוג שירת/ה במילואים. הגנה מפני פיטורים עד 30.06.2026.",
    FALLBACK_INCOME_SUPPORT: "לא עמד/ה בתנאי אבטלת חירום. הבקשה הועברה אוטומטית לבדיקת הבטחת הכנסה.",
  };

  const reason = reasonMap[rule.result.reason_code];
  if (reason) {
    parts.push(reason);
  }

  // Edge case notes
  for (const ec of edgeCases) {
    if (ec.triggered && ec.description) {
      parts.push(ec.description);
    }
  }

  return parts.join("\n");
}
