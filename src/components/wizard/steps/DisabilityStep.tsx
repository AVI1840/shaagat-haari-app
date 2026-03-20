"use client";

import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, ChoiceButton } from "../StepWrapper";

export function DisabilityStep() {
  const { setAnswer, computeNextStep } = useWizardStore();

  const select = (val: boolean) => {
    setAnswer("disability_status_indicator", val);
    computeNextStep();
  };

  return (
    <StepWrapper
      question="האם הנך מוכר/ת כאדם עם מוגבלות על ידי ביטוח לאומי?"
      hint="סטטוס מוגבלות פעיל מזכה בסף מופחת של 3 חודשי עבודה."
      fieldsetLegend="סטטוס מוגבלות"
    >
      <ChoiceButton label="כן, יש לי הכרה בתור אדם עם מוגבלות" onClick={() => select(true)} />
      <ChoiceButton label="לא" onClick={() => select(false)} />
    </StepWrapper>
  );
}
