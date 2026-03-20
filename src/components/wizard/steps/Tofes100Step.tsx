"use client";

import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, ChoiceButton } from "../StepWrapper";

export function Tofes100Step() {
  const { setAnswer, computeNextStep } = useWizardStore();

  const select = (val: boolean) => {
    setAnswer("tofes_100_submitted", val);
    computeNextStep();
  };

  return (
    <StepWrapper
      question="האם המעסיק שלך הגיש טופס 100 לביטוח לאומי?"
      hint='טופס 100 הוא דיווח מעסיק הכולל את תאריכי החל"ת. ללא טופס זה לא ניתן לעבד את התביעה.'
      fieldsetLegend="הגשת טופס 100"
    >
      <ChoiceButton label="כן, המעסיק הגיש טופס 100" onClick={() => select(true)} />
      <ChoiceButton label="לא / אינני יודע/ת" onClick={() => select(false)} />
    </StepWrapper>
  );
}
