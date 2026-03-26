"use client";
import { useState } from "react";
import { useChalatStore } from "@/store/chalat-store";
import { Section, Btn, Field, Input } from "../ui";

export function VacationStep() {
  const { input, setField, next } = useChalatStore();
  const [days, setDays] = useState(input.remaining_vacation_days?.toString() || "0");

  const go = () => {
    setField("remaining_vacation_days", parseInt(days) || 0);
    next();
  };

  return (
    <Section
      question="כמה ימי חופשה צבורים נותרו לך?"
      hint="בהתאם להוראת השעה, לא תבוצע שלילת זכאות בגין יתרת ימי חופשה לתביעות בתקופה הקובעת. הזן/י 0 אם אין ימי חופשה צבורים."
    >
      <Field label="ימי חופשה צבורים" id="vac">
        <Input id="vac" type="number" min={0} value={days} onChange={(e) => setDays(e.target.value)} placeholder="0" />
      </Field>
      <Btn onClick={go} />
    </Section>
  );
}
