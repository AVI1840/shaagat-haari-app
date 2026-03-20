"use client";

import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, ChoiceButton } from "../StepWrapper";

export function SeniorImpactStep() {
  const { setAnswer, computeNextStep } = useWizardStore();

  const select = (val: boolean) => {
    setAnswer("employment_terminated_due_to_operation", val);
    computeNextStep();
  };

  return (
    <StepWrapper
      question="האם עבודתך הופסקה או הושעתה עקב מבצע שאגת הארי?"
      hint="כעובד/ת מעל גיל 67, הזכאות נבדקת למענק חירום לאזרחים ותיקים."
      fieldsetLegend="השפעת המבצע על העסקה"
    >
      <ChoiceButton
        label="כן, עבודתי הופסקה עקב המבצע"
        onClick={() => select(true)}
      />
      <ChoiceButton
        label="לא, עבודתי לא הושפעה"
        onClick={() => select(false)}
      />
    </StepWrapper>
  );
}
