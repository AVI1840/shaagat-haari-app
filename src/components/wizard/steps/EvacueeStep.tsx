"use client";

import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, ChoiceButton } from "../StepWrapper";

export function EvacueeStep() {
  const { setAnswer, computeNextStep } = useWizardStore();

  const select = (val: boolean) => {
    setAnswer("geospatial_evacuee_flag", val);
    computeNextStep();
  };

  return (
    <StepWrapper
      question="האם הנך מפונה מאזור גבול הצפון?"
      hint="מפונים מאזור הצפון זכאים לסף מופחת של 2 חודשי עבודה במקום 6 חודשים."
      fieldsetLegend="סטטוס פינוי"
    >
      <ChoiceButton label="כן, הנני מפונה מאזור הצפון" onClick={() => select(true)} />
      <ChoiceButton label="לא" onClick={() => select(false)} />
    </StepWrapper>
  );
}
