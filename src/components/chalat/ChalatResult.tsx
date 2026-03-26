"use client";
import { useChalatStore } from "@/store/chalat-store";

const ST: Record<string, { bg: string; border: string; tc: string; label: string }> = {
  approved: { bg: "bg-[#eaf4ee]", border: "border-[#a3d4b5]", tc: "text-[#1a6b3c]", label: "נמצאה זכאות אפשרית" },
  denied: { bg: "bg-[#fdf0f0]", border: "border-[#e8b4b4]", tc: "text-[#8b1a1a]", label: "לא נמצאה זכאות" },
  pending_docs: { bg: "bg-[#fef8ec]", border: "border-[#f0d080]", tc: "text-[#7a4f00]", label: "ממתין למסמכים" },
  pending_review: { bg: "bg-[#e8f3ff]", border: "border-[#0368b0]/30", tc: "text-[#0c3058]", label: "נדרשת בדיקה" },
};

const SEC = "bg-white border-x border-b border-black/10 p-5";
const H3 = "text-xs font-bold text-[#0368b0] uppercase tracking-wide mb-3 pb-2 border-b border-black/10";

export function ChalatResultView() {
  const result = useChalatStore((s) => s.result);
  const mode = useChalatStore((s) => s.mode);
  const reset = useChalatStore((s) => s.reset);

  if (!result) return (
    <div className="bg-white border border-black/10 rounded-lg mt-4 p-6 text-center" role="status">
      <p className="text-[#266794]">מעבד נתונים...</p>
    </div>
  );

  const cfg = ST[result.status] || ST.denied;

  return (
    <div className="mt-4" role="region" aria-label="תוצאות בדיקת זכאות">
      {/* Status */}
      <section className={`border ${cfg.border} ${cfg.bg} p-5 rounded-t-lg`} aria-labelledby="sh">
        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${cfg.tc}`}>סטטוס זכאות</p>
        <h2 id="sh" className={`text-lg font-bold mb-1 ${cfg.tc}`}>{cfg.label}</h2>
        <p className={`text-base font-semibold ${cfg.tc}`}>{result.headline}</p>
      </section>

      {/* Explanation */}
      <section className={SEC} aria-labelledby="eh">
        <h3 id="eh" className={H3}>פירוט</h3>
        {result.explanation.split("\n").map((l, i) =>
          l.trim() ? <p key={i} className="text-sm text-[#0c3058] leading-relaxed mb-1">{l}</p> : null
        )}
      </section>

      {/* Reliefs applied */}
      {result.reliefs.length > 0 && (
        <section className={SEC} aria-labelledby="rh">
          <h3 id="rh" className={H3}>הקלות שהופעלו</h3>
          <ul className="space-y-3">
            {result.reliefs.map((r) => (
              <li key={r.id} className="bg-[#e8f3ff] border border-[#0368b0]/20 rounded-lg p-3">
                <p className="text-sm font-semibold text-[#0c3058]">{r.title}</p>
                <p className="text-sm text-[#266794] mt-0.5">{r.desc}</p>
                {mode === "clerk" && <p className="text-xs text-[#0368b0] mt-1">מקור: {r.ref}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Action steps */}
      {result.steps.length > 0 && (
        <section className={SEC} aria-labelledby="ah">
          <h3 id="ah" className={H3}>מה עליך לעשות עכשיו</h3>
          <ol className="space-y-3">
            {result.steps.map((s) => (
              <li key={s.n} className="flex items-start gap-4">
                <span className="w-7 h-7 shrink-0 bg-[#0368b0] text-white text-sm font-bold rounded-lg flex items-center justify-center" aria-hidden="true">{s.n}</span>
                <div className="flex-1 pt-0.5">
                  <p className="font-semibold text-[#0c3058] text-sm">{s.action}</p>
                  <p className="text-sm text-[#266794] mt-0.5">{s.detail}</p>
                  {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0368b0] underline mt-1 inline-block">מעבר לאתר</a>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Documents */}
      {result.docs.length > 0 && (
        <section className={SEC} aria-labelledby="dh">
          <h3 id="dh" className={H3}>מסמכים</h3>
          <ul className="space-y-2">
            {result.docs.map((d) => (
              <li key={d.id} className="flex items-start gap-3 pb-2 border-b border-black/5 last:border-0">
                <span className={`mt-0.5 w-5 h-5 shrink-0 border-2 rounded flex items-center justify-center text-xs font-bold ${d.status === "received" ? "border-[#1a6b3c] bg-[#1a6b3c] text-white" : "border-[#0368b0]/40 bg-white text-transparent"}`} aria-hidden="true">&#x2713;</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0c3058]">{d.label}</p>
                  <p className="text-xs text-[#266794] mt-0.5">{d.how}</p>
                </div>
                <span className={`text-xs shrink-0 font-medium ${d.status === "received" ? "text-[#1a6b3c]" : "text-[#c0392b]"}`}>
                  {d.status === "received" ? "התקבל" : d.status === "required" ? "חסר" : "לא נדרש"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Clerk notes — only in clerk mode */}
      {mode === "clerk" && result.clerk_notes.length > 0 && (
        <section className={SEC} aria-labelledby="cn">
          <h3 id="cn" className={H3}>הנחיות לפקיד תביעות</h3>
          <div className="space-y-2">
            {result.clerk_notes.map((n, i) => (
              <div key={i} className={`p-3 rounded-lg border text-sm ${n.type === "warning" ? "bg-[#fdf0f0] border-[#e8b4b4] text-[#8b1a1a]" : n.type === "system" ? "bg-[#fef8ec] border-[#f0d080] text-[#7a4f00]" : "bg-[#e8f3ff] border-[#0368b0]/20 text-[#0c3058]"}`}>
                <span className="font-bold">{n.type === "warning" ? "אזהרה: " : n.type === "system" ? "מערכת: " : "הנחיה: "}</span>
                {n.text}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <section className="bg-[#fef8ec] border-x border-b border-[#f0d080] p-5">
          {result.warnings.map((w, i) => <p key={i} className="text-sm text-[#7a4f00]">{w}</p>)}
        </section>
      )}

      {/* Calculation details */}
      <details className="bg-white border-x border-b border-black/10">
        <summary className="p-5 text-xs font-bold text-[#0368b0] uppercase tracking-wide cursor-pointer hover:bg-[#f5f6f8]">פרטי חישוב</summary>
        <div className="px-5 pb-5 border-t border-black/10">
          <table className="w-full text-sm mt-3"><tbody>
            <tr className="border-b border-black/5"><td className="py-2 text-[#266794]">ימי חל&quot;ת</td><td className="py-2 text-[#0c3058] font-medium text-left">{result.calc.chalat_days}</td></tr>
            <tr className="border-b border-black/5"><td className="py-2 text-[#266794]">מינימום נדרש</td><td className="py-2 text-[#0c3058] font-medium text-left">{result.calc.chalat_min} ימים</td></tr>
            <tr className="border-b border-black/5"><td className="py-2 text-[#266794]">חודשי אכשרה</td><td className="py-2 text-[#0c3058] font-medium text-left">{result.calc.akshara_actual}</td></tr>
            <tr className="border-b border-black/5"><td className="py-2 text-[#266794]">סף אכשרה</td><td className="py-2 text-[#0c3058] font-medium text-left">{result.calc.akshara_threshold} חודשים</td></tr>
            <tr className="border-b border-black/5"><td className="py-2 text-[#266794]">ימי אמתנה</td><td className="py-2 text-[#0c3058] font-medium text-left">{result.calc.waiting_days_waived ? "בוטלו" : "ינוכו"}</td></tr>
            <tr className="border-b border-black/5"><td className="py-2 text-[#266794]">שלילת חופשה</td><td className="py-2 text-[#0c3058] font-medium text-left">{result.calc.vacation_waived ? "בוטלה" : "תבוצע"}</td></tr>
            {result.calc.independent_method && <tr className="border-b border-black/5"><td className="py-2 text-[#266794]">חישוב עצמאי</td><td className="py-2 text-[#0c3058] font-medium text-left">{result.calc.independent_method === "cpa_monthly" ? 'לפי אישור רו"ח' : "לפי שומה/מקדמות"}</td></tr>}
            <tr><td className="py-2 text-[#266794]">הארכה למובטל חוזר</td><td className="py-2 text-[#0c3058] font-medium text-left">{result.calc.returning_extension ? "כן" : "לא"}</td></tr>
          </tbody></table>
        </div>
      </details>

      {/* Disclaimer */}
      <div className="bg-[#f5f6f8] border-x border-b border-black/10 p-4 rounded-b-lg" role="note">
        <p className="text-xs text-[#266794] leading-relaxed">
          <strong>הערה חשובה:</strong> תוצאות בדיקה זו מבוססות על הנתונים שהוזנו בלבד ואינן מהוות אישור רשמי של המוסד לביטוח לאומי. המידע מבוסס על חוזר תיקוני חקיקה — הוראת שעה 28.2.26-14.4.26. לקבלת אישור סופי יש לפנות לסניף ביטוח לאומי.
        </p>
      </div>

      {/* Reset */}
      <div className="mt-4">
        <button onClick={reset} type="button"
          className="w-full bg-white border-2 border-[#0368b0] text-[#0368b0] rounded-lg font-semibold py-3 px-6 text-base min-h-[48px] hover:bg-[#e8f3ff] transition-colors cursor-pointer">
          בדיקה חדשה
        </button>
      </div>
    </div>
  );
}
