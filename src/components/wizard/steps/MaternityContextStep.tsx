"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, ChoiceButton, NextButton, FormField } from "../StepWrapper";

export function MaternityContextStep() {
  const { setAnswers, computeNextStep } = useWizardStore();
  const [hasMaternity, setHasMaternity] = useState<boolean | null>(null);
  const [protectionEnd, setProtectionEnd] = useState("");
  const [hasPregnancy, setHasPregnancy] = useState(false);

  const handleNext = () => {
    setAnswers({
      maternity_protection_end: hasMaternity ? protectionEnd || null : null,
      pregnancy_preservation_active: hasPregnancy,
    });
    computeNextStep();
  };

  return (
    <StepWrapper
      question="האם קיים הקשר של הריון או לידה?"
      hint="כולל חופשת לידה, שמירת הריון, או הסעה ללידה."
    >
      <ChoiceButton
        label="חזרתי מחופשת לידה לאחרונה"
        selected={hasMaternity === true}
        onClick={() => { setHasMaternity(true); setHasPregnancy(false); }}
      />

      {hasMaternity && (
        <div className="border border-[#c8d0db] bg-[#f5f6f8] p-4 mt-1">
          <FormField
            label="תאריך סיום תקופת ההגנה (60 יום לאחר חופשת הלידה)"
            htmlFor="protection-end"
            hint="אם אינך בטוח/ה, השאר/י ריק"
          >
            <input
              id="protection-end"
              type="date"
              value={protectionEnd}
              onChange={(e) => setProtectionEnd(e.target.value)}
              className="w-full border-2 border-[#c8d0db] bg-white px-3 py-2.5 text-[15px] text-[#1a1a1a] min-h-[48px] focus:border-[#003f8a] focus:outline-none focus:ring-2 focus:ring-[#003f8a]/20 font-[inherit]"
            />
          </FormField>
        </div>
      )}

      <ChoiceButton
        label="הנני בשמירת הריון"
        selected={hasPregnancy}
        onClick={() => { setHasPregnancy(true); setHasMaternity(false); }}
      />
      <ChoiceButton
        label="אינו רלוונטי"
        selected={hasMaternity === false && !hasPregnancy}
        onClick={() => { setHasMaternity(false); setHasPregnancy(false); }}
      />
      <NextButton onClick={handleNext} />
    </StepWrapper>
  );
}
