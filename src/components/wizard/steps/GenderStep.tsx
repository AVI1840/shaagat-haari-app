"use client";

import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, ChoiceButton } from "../StepWrapper";

export function GenderStep() {
  const { setAnswer, computeNextStep } = useWizardStore();

  const select = (val: "M" | "F") => {
    setAnswer("applicant_gender", val);
    computeNextStep();
  };

  return (
    <StepWrapper
      question="מה המין שלך?"
      hint="נדרש לקביעת סף גיל לבדיקת הבטחת הכנסה."
      fieldsetLegend="בחירת מין"
    >
      <ChoiceButton label="זכר" onClick={() => select("M")} />
      <ChoiceButton label="נקבה" onClick={() => select("F")} />
    </StepWrapper>
  );
}
