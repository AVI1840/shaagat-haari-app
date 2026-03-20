"use client";

import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, ChoiceButton } from "../StepWrapper";

export function IdfDischargedStep() {
  const { setAnswer, computeNextStep } = useWizardStore();

  const select = (val: boolean) => {
    setAnswer("idf_discharged_status", val);
    computeNextStep();
  };

  return (
    <StepWrapper
      question="האם שוחררת משירות סדיר בצבא לאחרונה?"
      hint="חיילים משוחררים זכאים לסף מופחת של 3 חודשי עבודה."
      fieldsetLegend="סטטוס שחרור מצבא"
    >
      <ChoiceButton label="כן, שוחררתי משירות סדיר לאחרונה" onClick={() => select(true)} />
      <ChoiceButton label="לא" onClick={() => select(false)} />
    </StepWrapper>
  );
}
