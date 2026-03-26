"use client";
import { useChalatStore } from "@/store/chalat-store";
import { Section, Choice } from "../ui";

export function ReasonStep() {
  const { setField, next } = useChalatStore();
  const pick = (v: "employer" | "self" | "fired") => { setField("chalat_reason", v); next(); };

  return (
    <Section question='מה הסיבה להפסקת העבודה?' hint='בהתאם להוראת השעה, גם מי שיצא לחל"ת מיוזמתו זכאי לדמי אבטלה בתקופה 28.2.26-14.4.26.' legend="סיבת הפסקת עבודה">
      <Choice label='הוצאתי לחל"ת על ידי המעסיק' onClick={() => pick("employer")} />
      <Choice label='יצאתי לחל"ת מיוזמתי' onClick={() => pick("self")} />
      <Choice label="פוטרתי" onClick={() => pick("fired")} />
    </Section>
  );
}
