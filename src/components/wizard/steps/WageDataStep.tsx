"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, NextButton } from "../StepWrapper";

const MONTH_LABELS = [
  "ספטמבר 2025",
  "אוקטובר 2025",
  "נובמבר 2025",
  "דצמבר 2025",
  "ינואר 2026",
  "פברואר 2026",
];

export function WageDataStep() {
  const { setAnswer, computeNextStep } = useWizardStore();
  const [wages, setWages] = useState<string[]>(Array(6).fill(""));

  const handleNext = () => {
    const parsed = wages.map((w) => parseFloat(w) || 0);
    setAnswer("wage_months_preceding_6", parsed);
    computeNextStep();
  };

  const updateWage = (index: number, value: string) => {
    const updated = [...wages];
    updated[index] = value;
    setWages(updated);
  };

  const hasAnyWage = wages.some((w) => parseFloat(w) > 0);

  return (
    <StepWrapper
      question='שכר ב-6 החודשים שקדמו למבצע'
      hint='נדרש לחישוב מענק חירום לאזרחים ותיקים. יש להזין 0 עבור חודש שבו לא עבדת.'
    >
      <div className="space-y-3">
        {MONTH_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <label
              htmlFor={`wage-${i}`}
              className="text-sm text-[#1a1a1a] w-36 shrink-0 font-medium"
            >
              {label}
            </label>
            <div className="flex-1 relative">
              <input
                id={`wage-${i}`}
                type="number"
                min={0}
                value={wages[i]}
                onChange={(e) => updateWage(i, e.target.value)}
                className="w-full border-2 border-[#c8d0db] bg-white px-3 py-2.5 text-[15px] text-[#1a1a1a] min-h-[48px] focus:border-[#003f8a] focus:outline-none focus:ring-2 focus:ring-[#003f8a]/20 font-[inherit]"
                placeholder='0'
                aria-label={`שכר חודש ${label} בשקלים`}
              />
            </div>
            <span className="text-sm text-[#4a5568] shrink-0">ש&quot;ח</span>
          </div>
        ))}
      </div>
      <NextButton onClick={handleNext} disabled={!hasAnyWage} />
    </StepWrapper>
  );
}
