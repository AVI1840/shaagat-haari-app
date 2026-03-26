"use client";
import { useChalatStore } from "@/store/chalat-store";
import { Section, Choice } from "../ui";

export function NewClaimStep() {
  const { setField, next } = useChalatStore();
  const pick = (v: boolean) => { setField("filed_new_claim", v); next(); };

  return (
    <Section
      question="האם הגשת תביעה חדשה למרץ/אפריל 2026?"
      hint="בהתאם להוראת השעה, מובטל חוזר שמגיש תביעה חדשה עם תאריך קובע 3.26 או 4.26 זכאי להארכת תשלום."
      legend="תביעה חדשה"
    >
      <Choice label="כן, הגשתי תביעה חדשה" onClick={() => pick(true)} />
      <Choice label="לא" onClick={() => pick(false)} />
    </Section>
  );
}
