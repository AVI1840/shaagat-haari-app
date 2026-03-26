"use client";
import { useChalatStore } from "@/store/chalat-store";
import { Section, Choice } from "../ui";

export function ActiveClaimStep() {
  const { setField, next } = useChalatStore();
  const pick = (v: boolean) => { setField("has_active_claim", v); next(); };

  return (
    <Section
      question="האם אושרה לך תביעת אבטלה בשנה האחרונה?"
      hint="כלומר, האם אושרה לך תביעת אבטלה בשנה האחרונה? (מאפריל 2025 ועד היום)"
      legend="תביעה פעילה"
    >
      <Choice label="כן, אושרה לי תביעת אבטלה בשנה האחרונה" onClick={() => pick(true)} />
      <Choice label="לא" onClick={() => pick(false)} />
    </Section>
  );
}
