"use client";
import { useChalatStore } from "@/store/chalat-store";
import { Section, Choice } from "../ui";

export function ActiveClaimStep() {
  const { setField, next } = useChalatStore();
  const pick = (v: boolean) => { setField("has_active_claim", v); next(); };

  return (
    <Section
      question="האם יש לך תביעת אבטלה פעילה כרגע?"
      hint="כלומר, האם אתה מקבל/ת דמי אבטלה כעת או קיבלת ב-4 השנים האחרונות והגשת תביעה חדשה?"
      legend="תביעה פעילה"
    >
      <Choice label="כן, יש לי תביעת אבטלה פעילה" onClick={() => pick(true)} />
      <Choice label="לא, אני מגיש/ה תביעה חדשה" onClick={() => pick(false)} />
    </Section>
  );
}
