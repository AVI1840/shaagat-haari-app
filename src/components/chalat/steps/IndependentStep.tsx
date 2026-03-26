"use client";
import { useState } from "react";
import { useChalatStore } from "@/store/chalat-store";
import { Section, Choice, Btn, Field, Input, Check } from "../ui";

export function IndependentStep() {
  const { input, setFields, next } = useChalatStore();
  const [has, setHas] = useState(input.has_independent_income || false);
  const [income, setIncome] = useState(input.independent_monthly_income?.toString() || "");
  const [form, setForm] = useState(input.has_bl_1510 || false);

  const go = () => {
    setFields({
      has_independent_income: has,
      independent_monthly_income: has ? (parseFloat(income) || null) : null,
      has_bl_1510: has ? form : false,
    });
    next();
  };

  return (
    <Section
      question="האם יש לך הכנסות כעצמאי?"
      hint='בהתאם להוראת השעה, ניתן לחשב הכנסה עצמאית לפי אישור רו"ח לחודשים 3.26 ו-4.26 בלבד, במקום לפי שומה שנתית.'
    >
      <Choice label="כן, יש לי הכנסות כעצמאי" selected={has} onClick={() => setHas(true)} />
      <Choice label="לא" selected={!has} onClick={() => setHas(false)} />

      {has && (
        <div className="border border-black/10 bg-[#f5f6f8] p-4 rounded-lg mt-2 space-y-3">
          <Field label='הכנסה חודשית לפי אישור רו"ח' id="ind-inc" hint='הכנסה נטו בש"ח לחודש 3.26 או 4.26'>
            <Input id="ind-inc" type="number" min={0} value={income} onChange={(e) => setIncome(e.target.value)} placeholder="0" />
          </Field>
          <Check id="bl1510" label='צירפתי טופס בל/1510 עם אישור רו"ח או יועץ מס' checked={form} onChange={setForm} />
        </div>
      )}
      <Btn onClick={go} />
    </Section>
  );
}
