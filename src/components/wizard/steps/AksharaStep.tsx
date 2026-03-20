"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, NextButton, FormField } from "../StepWrapper";

export function AksharaStep() {
  const { setAnswer, computeNextStep, answers } = useWizardStore();
  const [months, setMonths] = useState<string>(
    answers.akshara_base_months?.toString() || ""
  );
  const [error, setError] = useState("");

  const threshold = answers.geospatial_evacuee_flag
    ? 2
    : answers.disability_status_indicator || answers.idf_discharged_status
    ? 3
    : 6;

  const handleNext = () => {
    const val = parseInt(months, 10);
    if (isNaN(val) || val < 0) {
      setError("יש להזין מספר חודשים תקין (0 עד 18).");
      return;
    }
    setError("");
    setAnswer("akshara_base_months", val);
    computeNextStep();
  };

  return (
    <StepWrapper
      question="כמה חודשי עבודה (עם תשלום ביטוח לאומי) היו לך ב-18 החודשים האחרונים?"
      hint={`הסף הנדרש עבורך: ${threshold} חודשים לפחות. יש לכלול חודשים בהם שולמו דמי ביטוח לאומי.`}
    >
      <FormField
        label="מספר חודשי עבודה"
        htmlFor="akshara-months"
        hint="הזן/י מספר בין 0 ל-18"
        error={error}
      >
        <input
          id="akshara-months"
          type="number"
          min={0}
          max={18}
          value={months}
          onChange={(e) => { setMonths(e.target.value); setError(""); }}
          className="w-full border-2 border-[#c8d0db] bg-white px-3 py-2.5 text-[15px] text-[#1a1a1a] min-h-[48px] focus:border-[#003f8a] focus:outline-none focus:ring-2 focus:ring-[#003f8a]/20 font-[inherit]"
          placeholder="לדוגמה: 8"
          aria-required="true"
        />
      </FormField>
      <NextButton onClick={handleNext} disabled={months === ""} />
    </StepWrapper>
  );
}
