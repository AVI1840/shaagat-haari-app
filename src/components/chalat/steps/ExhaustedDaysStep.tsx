"use client";
import { useChalatStore } from "@/store/chalat-store";
import { Section, Choice } from "../ui";

export function ExhaustedDaysStep() {
  const { setField, next } = useChalatStore();
  const pick = (v: boolean) => { setField("exhausted_all_days", v); next(); };

  return (
    <Section
      question="האם ניצלת את מלוא ימי האבטלה שלך?"
      hint="כלומר, האם סיימת את כל הימים שמגיעים לך לפי החוק?"
      legend="ניצול ימי זכאות"
    >
      <Choice label="כן, ניצלתי את כל הימים" onClick={() => pick(true)} />
      <Choice label="לא, עדיין נותרו לי ימים" onClick={() => pick(false)} />
    </Section>
  );
}
