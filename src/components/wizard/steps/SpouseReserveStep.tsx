"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, NextButton, FormField } from "../StepWrapper";

export function SpouseReserveStep() {
  const { setAnswers, computeNextStep, answers } = useWizardStore();
  const [days, setDays] = useState<string>(
    answers.spouse_reserve_days?.toString() || "0"
  );

  const handleNext = () => {
    const val = parseInt(days, 10) || 0;
    setAnswers({
      spouse_reserve_days: val,
      is_full_time_employee: true,
    });
    computeNextStep();
  };

  return (
    <StepWrapper
      question="כמה ימי מילואים שירת/ה בן/בת הזוג שלך בתקופת המבצע?"
      hint="יש להזין 0 אם אינו רלוונטי. 5 ימים ומעלה מזכים בהטבות לבן/בת הזוג."
    >
      <FormField
        label="מספר ימי מילואים"
        htmlFor="spouse-reserve-days"
        hint="הזן/י מספר שלם (לדוגמה: 0, 10, 30)"
      >
        <input
          id="spouse-reserve-days"
          type="number"
          min={0}
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="w-full border-2 border-[#c8d0db] bg-white px-3 py-2.5 text-[15px] text-[#1a1a1a] min-h-[48px] focus:border-[#003f8a] focus:outline-none focus:ring-2 focus:ring-[#003f8a]/20 font-[inherit]"
          placeholder="מספר ימים"
          aria-required="true"
        />
      </FormField>
      <NextButton onClick={handleNext} />
    </StepWrapper>
  );
}
