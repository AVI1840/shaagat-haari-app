"use client";
import { useChalatStore } from "@/store/chalat-store";
import { Section, Choice } from "../ui";

export function Tofes100Step() {
  const { setFields, next, mode } = useChalatStore();

  const pick = (tofes: boolean, confirm: boolean) => {
    setFields({ tofes_100_received: tofes, employer_confirmation: confirm });
    next();
  };

  return (
    <Section
      question="האם המעסיק הגיש טופס 100 לביטוח לאומי?"
      hint={mode === "clerk"
        ? 'אם המעסיק דיווח תאריכי חל"ת בטופס 100 — אין לדרוש אישור בכתב. אם לא דיווח אך יש אישור חתום — ניתן להזין תאריכים מהאישור במסך 162.'
        : 'טופס 100 הוא דיווח שהמעסיק מגיש לביטוח לאומי עם תאריכי החל"ת. ללא טופס זה לא ניתן לעבד את התביעה.'}
      legend="סטטוס טופס 100"
    >
      <Choice label="כן, המעסיק הגיש טופס 100" onClick={() => pick(true, false)} />
      <Choice label="לא, אך יש לי אישור מעסיק בכתב" onClick={() => pick(false, true)} />
      <Choice label="לא / אינני יודע/ת" onClick={() => pick(false, false)} />
    </Section>
  );
}
