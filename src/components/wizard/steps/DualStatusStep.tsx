"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, NextButton, FormField } from "../StepWrapper";

export function DualStatusStep() {
  const { setAnswers, computeNextStep, answers } = useWizardStore();
  const [income, setIncome] = useState<string>(
    answers.independent_income_declared?.toString() || ""
  );

  const handleNext = () => {
    const val = parseFloat(income) || 0;
    setAnswers({
      independent_income_declared: val,
      cpa_certification_submitted: val > 0,
    });
    computeNextStep();
  };

  return (
    <StepWrapper
      question="מה ההכנסה העצמאית נטו שלך בתקופת המבצע?"
      hint='סכום זה ינוכה מדמי האבטלה. נדרש אישור רואה חשבון לאימות ההכנסה. יש להזין 0 אם לא הייתה הכנסה עצמאית.'
    >
      <FormField
        label='הכנסה עצמאית נטו בתקופת המבצע'
        htmlFor="independent-income"
        hint='בשקלים חדשים. הזן/י 0 אם לא הייתה הכנסה עצמאית.'
      >
        <div className="flex items-center gap-2">
          <input
            id="independent-income"
            type="number"
            min={0}
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="flex-1 border-2 border-[#c8d0db] bg-white px-3 py-2.5 text-[15px] text-[#1a1a1a] min-h-[48px] focus:border-[#003f8a] focus:outline-none focus:ring-2 focus:ring-[#003f8a]/20 font-[inherit]"
            placeholder="0"
            aria-required="true"
          />
          <span className="text-sm text-[#4a5568] shrink-0">ש&quot;ח</span>
        </div>
      </FormField>
      <NextButton onClick={handleNext} />
    </StepWrapper>
  );
}
