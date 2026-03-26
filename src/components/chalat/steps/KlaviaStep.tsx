"use client";
import { useChalatStore } from "@/store/chalat-store";
import { Section, Choice } from "../ui";

export function KlaviaStep() {
  const { setField, next } = useChalatStore();
  const pick = (v: boolean) => { setField("had_im_klavia", v); next(); };

  return (
    <Section
      question='האם הוצאת לחל"ת או פוטרת גם במבצע "עם כלביא" (13.6.25-24.6.25)?'
      hint="מי שהיו לו שתי הפסקות עבודה — במבצע עם כלביא ובמבצע שאגת הארי — זכאי להארכת תשלום עד תום התקופה הקובעת."
      legend='חל"ת במבצע עם כלביא'
    >
      <Choice label='כן, הוצאתי לחל"ת/פוטרתי גם במבצע עם כלביא' onClick={() => pick(true)} />
      <Choice label="לא" onClick={() => pick(false)} />
    </Section>
  );
}
