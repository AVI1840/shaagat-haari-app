"use client";

import { useWizardStore } from "@/store/wizard-store";

const STATUS_CONFIG: Record<string, {
  bg: string; border: string; textColor: string;
  statusLabel: string; statusDesc: string;
}> = {
  approved: {
    bg: "bg-[#eaf4ee]", border: "border-[#a3d4b5]", textColor: "text-[#1a6b3c]",
    statusLabel: "נמצאה זכאות אפשרית",
    statusDesc: "על פי הנתונים שהוזנו, ייתכן שהנך זכאי/ת לגמלה.",
  },
  approved_with_deduction: {
    bg: "bg-[#fef8ec]", border: "border-[#f0d080]", textColor: "text-[#7a4f00]",
    statusLabel: "נמצאה זכאות אפשרית עם ניכוי",
    statusDesc: "על פי הנתונים שהוזנו, ייתכן שהנך זכאי/ת לגמלה בניכוי חלקי.",
  },
  requires_edge_case_handling: {
    bg: "bg-[#eef3fb]", border: "border-[#b0c4e8]", textColor: "text-[#1a3a6b]",
    statusLabel: "נדרשת בדיקה נוספת",
    statusDesc: "המקרה שלך מצריך בדיקה ידנית על ידי נציג ביטוח לאומי.",
  },
  pending_secondary_review: {
    bg: "bg-[#eef3fb]", border: "border-[#b0c4e8]", textColor: "text-[#1a3a6b]",
    statusLabel: "הבקשה ממתינה לפעולה",
    statusDesc: "נדרשת פעולה נוספת לפני שניתן לקבוע זכאות.",
  },
  denied: {
    bg: "bg-[#fdf0f0]", border: "border-[#e8b4b4]", textColor: "text-[#8b1a1a]",
    statusLabel: "לא נמצאה זכאות במסלול זה",
    statusDesc: "על פי הנתונים שהוזנו, לא נמצאה זכאות בבדיקה זו.",
  },
};

const CONFIDENCE_CONFIG: Record<string, { label: string; desc: string }> = {
  high: { label: "גבוהה", desc: "הנתונים שהוזנו מלאים ומאפשרים קביעה ברורה." },
  medium: { label: "בינונית", desc: "חלק מהנתונים חסרים או מצריכים אימות." },
  low: { label: "נמוכה", desc: "נתונים חסרים משמעותיים. מומלץ לפנות לסניף." },
};

const READINESS_CONFIG: Record<string, { label: string }> = {
  ready_to_submit: { label: "מוכן להגשה" },
  missing_documents: { label: "חסרים מסמכים" },
  missing_information: { label: "חסר מידע" },
  not_eligible: { label: "לא זכאי" },
  requires_review: { label: "נדרשת בדיקה" },
};

const SEC = "bg-white border-x border-b border-[#c8d0db] p-5";
const H3 = "text-xs font-bold text-[#003f8a] uppercase tracking-wide mb-4 pb-2 border-b border-[#e2e8f0]";

export function ActionCard() {
  const result = useWizardStore((s) => s.result);
  const reset = useWizardStore((s) => s.reset);

  if (!result) {
    return (
      <div className="bg-white border border-[#c8d0db] mt-4 p-6 text-center" role="status" aria-live="polite">
        <p className="text-[#4a5568]">מעבד נתונים, אנא המתן/י...</p>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[result.eligibility_status] ?? STATUS_CONFIG.denied;
  const conf = CONFIDENCE_CONFIG[result.confidence_level] ?? CONFIDENCE_CONFIG.low;
  const readiness = READINESS_CONFIG[result.claim_readiness] ?? READINESS_CONFIG.missing_information;

  return (
    <div className="mt-4" role="region" aria-label="תוצאות בדיקת הזכאות">

      <section aria-labelledby="status-heading" className={`border ${cfg.border} ${cfg.bg} p-5`}>
        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${cfg.textColor}`}>סטטוס זכאות</p>
        <h2 id="status-heading" className={`text-lg font-bold mb-1 ${cfg.textColor}`}>{cfg.statusLabel}</h2>
        <p className={`text-sm mb-3 ${cfg.textColor}`}>{cfg.statusDesc}</p>
        <p className={`text-base font-semibold ${cfg.textColor}`}>{result.headline}</p>
        {result.amount_estimate && (
          <p className={`text-sm mt-3 font-medium pt-3 border-t ${cfg.border} ${cfg.textColor}`}>
            הערכת סכום: {result.amount_estimate}
          </p>
        )}
      </section>

      <section aria-labelledby="benefit-heading" className={SEC}>
        <h3 id="benefit-heading" className={H3}>מה מגיע לך</h3>
        <p className="text-base font-semibold text-[#1a1a1a] mb-3">{result.benefit_label}</p>
        <div className="space-y-1.5">
          {result.explanation_for_citizen.split("\n").map((line, i) =>
            line.trim() ? <p key={i} className="text-sm text-[#1a1a1a] leading-relaxed">{line}</p> : null
          )}
        </div>
      </section>

      {result.action_steps.length > 0 && (
        <section aria-labelledby="actions-heading" className={SEC}>
          <h3 id="actions-heading" className={H3}>מה עליך לעשות עכשיו</h3>
          <ol className="space-y-4">
            {result.action_steps.map((step) => (
              <li key={step.step_number} className="flex items-start gap-4">
                <span className="w-7 h-7 shrink-0 bg-[#003f8a] text-white text-sm font-bold flex items-center justify-center" aria-hidden="true">
                  {step.step_number}
                </span>
                <div className="flex-1 pt-0.5">
                  <p className="font-semibold text-[#1a1a1a] text-sm">{step.action}</p>
                  {step.detail && <p className="text-sm text-[#4a5568] mt-0.5">{step.detail}</p>}
                  {step.link && (
                    <a href={step.link} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-[#003f8a] underline mt-1 inline-block"
                      aria-label={`${step.action} - קישור לאתר חיצוני`}>
                      מעבר לאתר
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {result.documents.length > 0 && (
        <section aria-labelledby="docs-heading" className={SEC}>
          <h3 id="docs-heading" className={H3}>מסמכים נדרשים</h3>
          <ul className="space-y-3">
            {result.documents.map((doc) => (
              <li key={doc.id} className="flex items-start gap-3 pb-3 border-b border-[#e2e8f0] last:border-0 last:pb-0">
                <span className={`mt-0.5 w-5 h-5 shrink-0 border-2 flex items-center justify-center text-xs font-bold ${doc.status === "provided" ? "border-[#1a6b3c] bg-[#1a6b3c] text-white" : "border-[#9aabb8] bg-white text-transparent"}`} aria-hidden="true">
                  ✓
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1a1a1a]">{doc.label}</p>
                  {doc.how_to_get && <p className="text-xs text-[#4a5568] mt-0.5 leading-relaxed">{doc.how_to_get}</p>}
                </div>
                <span className={`text-xs shrink-0 mt-0.5 font-medium ${doc.status === "provided" ? "text-[#1a6b3c]" : "text-[#8b1a1a]"}`}>
                  {doc.status === "provided" ? "קיים" : doc.status === "missing" ? "חסר" : "לא נדרש"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="confidence-heading" className={SEC}>
        <h3 id="confidence-heading" className={H3}>מצב הבדיקה</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-[#4a5568]">רמת ודאות הבדיקה</p>
              <p className="text-xs text-[#4a5568] mt-0.5">{conf.desc}</p>
            </div>
            <span className="text-sm font-semibold text-[#1a1a1a] shrink-0 mr-4">{conf.label}</span>
          </div>
          <hr className="border-t border-[#e2e8f0]" />
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#4a5568]">מצב הגשה</p>
            <span className="text-sm font-semibold text-[#1a1a1a]">{readiness.label}</span>
          </div>
        </div>
      </section>

      {result.missing_information && result.missing_information.length > 0 && (
        <section aria-labelledby="missing-heading" className="bg-[#fef8ec] border-x border-b border-[#f0d080] p-5">
          <h3 id="missing-heading" className="text-xs font-bold text-[#7a4f00] uppercase tracking-wide mb-2">מידע חסר</h3>
          <ul className="space-y-1">
            {result.missing_information.map((item) => (
              <li key={item} className="text-sm text-[#7a4f00] flex items-start gap-2">
                <span aria-hidden="true" className="shrink-0">—</span>{item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.timeline_notes && (
        <section aria-labelledby="timeline-heading" className="bg-[#eef3fb] border-x border-b border-[#b0c4e8] p-5">
          <h3 id="timeline-heading" className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-2">הערות ציר זמן</h3>
          <p className="text-sm text-[#1a3a6b] leading-relaxed">{result.timeline_notes}</p>
        </section>
      )}

      {result.calculation_result && Object.keys(result.calculation_result).length > 0 && (
        <details className="bg-white border-x border-b border-[#c8d0db]">
          <summary className="p-5 text-xs font-bold text-[#003f8a] uppercase tracking-wide cursor-pointer select-none hover:bg-[#f5f6f8]">
            פרטי חישוב
          </summary>
          <div className="px-5 pb-5 border-t border-[#e2e8f0]">
            <table className="w-full text-sm mt-3">
              <tbody>
                {Object.entries(result.calculation_result).map(([key, val]) => (
                  <tr key={key} className="border-b border-[#e2e8f0] last:border-0">
                    <td className="py-2 text-[#4a5568] pr-2">{key.replace(/_/g, " ")}</td>
                    <td className="py-2 text-[#1a1a1a] font-medium text-left pl-2">
                      {typeof val === "object" ? JSON.stringify(val) : String(val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      <div className="bg-[#f5f6f8] border-x border-b border-[#c8d0db] p-4" role="note">
        <p className="text-xs text-[#4a5568] leading-relaxed">
          <strong>הערה חשובה:</strong> תוצאות בדיקה זו מבוססות על הנתונים שהוזנו על ידך בלבד ואינן מהוות אישור רשמי של המוסד לביטוח לאומי. ייתכן שיידרש אימות נוסף. לקבלת אישור סופי יש לפנות לסניף ביטוח לאומי הקרוב או לאתר הרשמי בכתובת btl.gov.il.
        </p>
      </div>

      <div className="bg-white border-x border-b border-[#c8d0db] p-5">
        <button
          onClick={reset}
          type="button"
          className="w-full bg-white border-2 border-[#003f8a] text-[#003f8a] font-semibold py-3 px-6 text-base min-h-[48px] hover:bg-[#e8f0fb] transition-colors cursor-pointer"
          aria-label="התחל בדיקת זכאות חדשה"
        >
          בדיקה חדשה
        </button>
      </div>
    </div>
  );
}
