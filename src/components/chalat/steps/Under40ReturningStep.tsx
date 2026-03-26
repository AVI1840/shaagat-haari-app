"use client";
import { useChalatStore } from "@/store/chalat-store";
import { Section, Choice } from "../ui";

export function Under40ReturningStep() {
  const { setField, next } = useChalatStore();
  const pick = (v: boolean) => { setField("is_under40_returning", v); next(); };

  return (
    <Section
      question="האם הנך מתחת לגיל 40 וקיבלת דמי אבטלה ב-4 השנים האחרונות?"
      hint="הקלה זו רלוונטית למובטלים מתחת לגיל 40 שקיבלו דמי אבטלה בעבר וניצלו את מלוא ימי הזכאות."
      legend="מובטל חוזר"
    >
      <Choice label="כן, אני מתחת לגיל 40 וקיבלתי דמי אבטלה ב-4 שנים האחרונות" onClick={() => pick(true)} />
      <Choice label="לא" onClick={() => pick(false)} />
    </Section>
  );
}
