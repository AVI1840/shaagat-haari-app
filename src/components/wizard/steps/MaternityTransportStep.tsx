"use client";

import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, ChoiceButton } from "../StepWrapper";

export function MaternityTransportStep() {
  const { setAnswers, computeNextStep } = useWizardStore();

  const select = (transported: boolean) => {
    setAnswers({
      transported_via_licensed_ambulance: transported,
      transport_provider_license_valid: transported,
    });
    computeNextStep();
  };

  return (
    <StepWrapper
      question="האם הובלת לבית החולים באמבולנס מורשה במהלך המבצע?"
      hint='כולל אמבולנס פרטי מורשה על ידי משרד הבריאות, לא רק מד"א. ביטול בלעדיות מד"א בתוקף.'
      fieldsetLegend="הסעה ללידה"
    >
      <ChoiceButton label="כן, הובלתי באמבולנס מורשה" onClick={() => select(true)} />
      <ChoiceButton label="לא" onClick={() => select(false)} />
    </StepWrapper>
  );
}
