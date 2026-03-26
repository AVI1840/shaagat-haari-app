"use client";
import { useChalatStore } from "@/store/chalat-store";
import { Section, Btn } from "../ui";

export function SpecialDocsStep() {
  const { input, next, mode } = useChalatStore();
  const items: string[] = [];
  if (input.is_evacuee) items.push("אישור מהרשות המקומית שבתחומה הבית ממנו התפנית.");
  if (input.is_spouse_reserve_120) items.push("אישור ממשרד הביטחון על 120+ ימי מילואים.");
  if (input.is_spouse_wounded) items.push("אישור ממשרד הביטחון או נתונים ממערכות ביטוח לאומי.");
  if (input.is_disability_tax_exempt) items.push("אישור פטור ממס מטעמים רפואיים ממס הכנסה.");
  if (input.is_disability_ni) items.push("הנתונים קיימים במערכות ביטוח לאומי.");
  if (input.is_discharged_soldier) items.push("הנתונים קיימים במערכות ביטוח לאומי.");

  return (
    <Section question="מסמכים נדרשים לאוכלוסייה מיוחדת" hint="על מנת לאשר את הסף המופחת של 3 חודשי אכשרה, נדרשים המסמכים הבאים.">
      <ul className="space-y-2" role="list">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 p-3 bg-[#e8f3ff] rounded-lg border border-[#0368b0]/20">
            <span className="text-[#0368b0] font-bold shrink-0 mt-0.5" aria-hidden="true">{i + 1}.</span>
            <span className="text-sm text-[#0c3058]">{item}</span>
          </li>
        ))}
      </ul>
      {mode === "clerk" && (
        <div className="bg-[#fef8ec] border border-[#f0d080] rounded-lg p-4 mt-3" role="note">
          <p className="text-sm text-[#7a4f00]">
            <strong>הנחיית מערכת:</strong> המערכת לא ערוכה לתיקון חוק זה. יש להזין תקופת עבודה נוספת עד 6 חודשים במסך 162 תחת תיק ניכויים 03. בשלב ראשון התביעה תידחה — רק לאחר המצאת אישורים תאושר.
          </p>
        </div>
      )}
      <Btn onClick={next} />
    </Section>
  );
}
