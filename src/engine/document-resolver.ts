import type { EdgeCaseResult } from "./edge-case-handler";
import type { DocumentItem } from "@/schemas/engine-result";

const DOCUMENT_META: Record<string, { label: string; how_to_get: string }> = {
  tofes_100_employer_report: {
    label: "טופס 100 - דיווח מעסיק",
    how_to_get: "בקש/י מהמעסיק להגיש דרך אתר ביטוח לאומי למעסיקים",
  },
  employment_service_registration: {
    label: "רישום בשירות התעסוקה",
    how_to_get: "היכנס/י לאתר שירות התעסוקה או פנה/י לסניף הקרוב",
  },
  nema_geospatial_verification: {
    label: "אימות כתובת מגורים באזור פינוי",
    how_to_get: "מתבצע אוטומטית מול רשות החירום הלאומית",
  },
  ministry_of_defense_certification_or_disability_index: {
    label: "אישור משרד הביטחון או אינדקס נכות",
    how_to_get: "פנה/י למשרד הביטחון או לביטוח לאומי - אגף נכות",
  },
  date_of_birth_verification_population_registry: {
    label: "אימות תאריך לידה",
    how_to_get: "מתבצע אוטומטית מול רשות האוכלוסין",
  },
  tofes_100_demonstrating_operational_cessation: {
    label: "טופס 100 - הפסקת עבודה עקב המבצע",
    how_to_get: "בקש/י מהמעסיק להגיש טופס 100 עם ציון סיבת ההפסקה",
  },
  payroll_api_provident_fund_deposits: {
    label: "אישור הפקדות לקופת גמל",
    how_to_get: "בקש/י מהמעסיק או מחברת הביטוח הפנסיוני",
  },
  idf_reserve_service_verification: {
    label: 'אישור שירות מילואים מצה"ל',
    how_to_get: "מתקבל אוטומטית מצה\"ל או דרך אתר מילואים",
  },
  idf_deployment_records: {
    label: "רישומי גיוס מילואים",
    how_to_get: "מתקבל אוטומטית מצה\"ל",
  },
  population_registry_child_age: {
    label: "אימות גיל ילד",
    how_to_get: "מתבצע אוטומטית מול רשות האוכלוסין",
  },
  employer_payroll_accrual_verification: {
    label: "אישור מעסיק על צבירת ימים",
    how_to_get: "בקש/י ממחלקת משאבי אנוש של המעסיק",
  },
  transport_provider_invoice: {
    label: "חשבונית מספק ההובלה",
    how_to_get: "בקש/י חשבונית מחברת האמבולנס",
  },
  ministry_of_transportation_license_verification: {
    label: "אימות רישיון משרד התחבורה",
    how_to_get: "מתבצע אוטומטית מול משרד התחבורה",
  },
  medical_committee_documentation: {
    label: "תיעוד ועדה רפואית",
    how_to_get: "פנה/י לביטוח לאומי לקביעת ועדה רפואית",
  },
  provident_fund_deposit_logs: {
    label: "יומני הפקדות קופת גמל",
    how_to_get: "בקש/י מחברת הביטוח הפנסיוני או מהמעסיק",
  },
  household_asset_declaration: {
    label: "הצהרת נכסי משק בית",
    how_to_get: "מלא/י טופס הצהרה באתר ביטוח לאומי",
  },
  income_declaration: {
    label: "הצהרת הכנסות",
    how_to_get: "מלא/י טופס הצהרה באתר ביטוח לאומי",
  },
  cpa_certification_independent_revenue: {
    label: 'אישור רו"ח על הכנסות עצמאיות',
    how_to_get: 'בקש/י מרואה החשבון שלך אישור על הכנסות בתקופת המבצע',
  },
  maternity_leave_documentation: {
    label: "תיעוד חופשת לידה",
    how_to_get: "בקש/י מהמעסיק אישור תקופת חופשת לידה",
  },
};

export function resolveDocumentChecklist(
  baseDocuments: string[],
  edgeCases: { triggered: boolean; modified_documents?: string[] }[]
): DocumentItem[] {
  const docSet = new Set(baseDocuments);

  for (const ec of edgeCases) {
    if (ec.triggered && ec.modified_documents) {
      for (const doc of ec.modified_documents) {
        docSet.add(doc);
      }
    }
  }

  return Array.from(docSet).map((docId) => {
    const meta = DOCUMENT_META[docId];
    return {
      id: docId,
      label: meta?.label || docId,
      status: "missing" as const,
      how_to_get: meta?.how_to_get,
    };
  });
}

export function getDocumentLabel(docId: string): string {
  return DOCUMENT_META[docId]?.label || docId;
}
