"use client";
import { useState } from "react";
import { useChalatStore } from "@/store/chalat-store";
import { Section, Btn, Field, Input } from "../ui";

export function AksharaStep() {
  const { input, setFields, next, mode } = useChalatStore();
  const [months, setMonths] = useState(input.akshara_months?.toString() || "");
  const [mil, setMil] = useState(input.akshara_includes_military?.toString() || "0");

  const go = () => {
    setFields({
      akshara_months: parseInt(months) || 0,
      akshara_includes_military: parseInt(mil) || 0,
    });
    next();
  };

  return (
    <Section
      question="כמה חודשי אכשרה (עבודה עם תשלום ביטוח לאומי) צברת ב-18 החודשים האחרונים?"
      hint="בהתאם להוראת השעה, הסף הופחת ל-6 חודשים (ול-3 חודשים לאוכלוסיות מיוחדות)."
    >
      <Field label="מספר חודשי אכשרה" id="akm" hint="מספר בין 0 ל-18">
        <Input id="akm" type="number" min={0} max={18} value={months}
          onChange={(e) => setMonths(e.target.value)} placeholder="לדוגמה: 8" aria-required="true" />
      </Field>
      {mode === "clerk" && (
        <Field label="מתוכם חודשי שירות סדיר" id="mil" hint="עד 3 חודשים ניתן לכלול באכשרה מקוצרת">
          <Input id="mil" type="number" min={0} max={3} value={mil}
            onChange={(e) => setMil(e.target.value)} placeholder="0" />
        </Field>
      )}
      <Btn onClick={go} disabled={months === ""} />
    </Section>
  );
}
