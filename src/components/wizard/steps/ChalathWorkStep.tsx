"use client";

import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, ChoiceButton } from "../StepWrapper";

export function ChalathWorkStep() {
  const { setAnswer, computeNextStep } = useWizardStore();

  const select = (days: number) => {
    setAnswer("permitted_labor_days", days);
    computeNextStep();
  };

  return (
    <StepWrapper
      question='האם עבדת במהלך תקופת החל"ת?'
      hint='מותר לעבוד עד 2 ימים בלבד מבלי לאבד את רצף החל"ת. עבודה מעל 2 ימים מבטלת את הזכאות.'
      fieldsetLegend='ימי עבודה בתקופת החל"ת'
    >
      <ChoiceButton label="לא עבדתי כלל" onClick={() => select(0)} />
      <ChoiceButton label="עבדתי יום אחד" onClick={() => select(1)} />
      <ChoiceButton label="עבדתי יומיים" onClick={() => select(2)} />
    </StepWrapper>
  );
}
