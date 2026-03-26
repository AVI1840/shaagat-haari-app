"use client";
import { useChalatStore } from "@/store/chalat-store";
import { Section, Check, Btn } from "../ui";

export function SpecialPopStep() {
  const { input, setField, next } = useChalatStore();

  return (
    <Section
      question="האם אתה שייך לאחת מהאוכלוסיות הבאות?"
      hint="אוכלוסיות אלו זכאיות לסף אכשרה מופחת של 3 חודשים בלבד. סמן/י את כל מה שרלוונטי."
    >
      <Check id="dis_ni" label="מקבל/ת גמלת נכות כללית מביטוח לאומי" checked={!!input.is_disability_ni} onChange={(v) => setField("is_disability_ni", v)} />
      <Check id="dis_tax" label="בעל/ת פטור ממס מטעמים רפואיים" checked={!!input.is_disability_tax_exempt} onChange={(v) => setField("is_disability_tax_exempt", v)} />
      <Check id="evac" label="מפונה מביתי במהלך מלחמת שאגת הארי" checked={!!input.is_evacuee} onChange={(v) => setField("is_evacuee", v)} />
      <Check id="sp120" label="בן/בת זוג של משרת/ת מילואים (120+ ימים בשנה האחרונה)" checked={!!input.is_spouse_reserve_120} onChange={(v) => setField("is_spouse_reserve_120", v)} />
      <Check id="spw" label="בן/בת זוג של פצוע/ה" checked={!!input.is_spouse_wounded} onChange={(v) => setField("is_spouse_wounded", v)} />
      <Check id="sold" label="חייל/ת משוחרר/ת" checked={!!input.is_discharged_soldier} onChange={(v) => setField("is_discharged_soldier", v)} />
      <Btn onClick={next} label="המשך" />
    </Section>
  );
}
