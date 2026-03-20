"use client";

import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, ChoiceButton } from "../StepWrapper";

export function PregnancyPreservationStep() {
  const { setAnswer, computeNextStep } = useWizardStore();

  const select = (val: boolean) => {
    setAnswer("provident_fund_deposits_maintained", val);
    computeNextStep();
  };

  return (
    <StepWrapper
      question="האם ההפקדות לקופת הגמל נשמרו בתקופת שמירת ההריון?"
      hint="שמירה על הפקדות לקופת גמל נדרשת לצורך רציפות כיסוי שמירת ההריון."
      fieldsetLegend="הפקדות קופת גמל"
    >
      <ChoiceButton label="כן, ההפקדות נשמרו" onClick={() => select(true)} />
      <ChoiceButton label="לא, ההפקדות לא נשמרו" onClick={() => select(false)} />
    </StepWrapper>
  );
}
