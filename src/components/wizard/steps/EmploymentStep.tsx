"use client";

import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, ChoiceButton } from "../StepWrapper";

export function EmploymentStep() {
  const { setAnswer, computeNextStep } = useWizardStore();

  const select = (val: "salaried" | "independent" | "dual") => {
    setAnswer("employment_classification", val);
    computeNextStep();
  };

  return (
    <StepWrapper
      question="מה סוג ההעסקה שלך?"
      hint="סוג ההעסקה קובע את מסלול הבדיקה ואת הזכויות הרלוונטיות."
      fieldsetLegend="בחירת סוג העסקה"
    >
      <ChoiceButton
        label="שכיר/ה"
        description="מועסק/ת אצל מעסיק ומקבל/ת תלוש שכר"
        onClick={() => select("salaried")}
      />
      <ChoiceButton
        label="עצמאי/ת"
        description="בעל/ת עסק עצמאי, רשום/ה כעוסק/ת"
        onClick={() => select("independent")}
      />
      <ChoiceButton
        label="שכיר/ה וגם עצמאי/ת"
        description="מועסק/ת אצל מעסיק ובנוסף בעל/ת עסק עצמאי"
        onClick={() => select("dual")}
      />
    </StepWrapper>
  );
}
