"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, NextButton, FormField } from "../StepWrapper";

export function AgeStep() {
  const { setAnswer, computeNextStep, answers } = useWizardStore();
  const [dob, setDob] = useState(answers.applicant_date_of_birth || "");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!dob) {
      setError("יש להזין תאריך לידה.");
      return;
    }
    setError("");
    const birthDate = new Date(dob);
    const today = new Date("2026-03-15");
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    const ageDecimal =
      age +
      (today.getTime() -
        new Date(
          birthDate.getFullYear() + age,
          birthDate.getMonth(),
          birthDate.getDate()
        ).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000);

    setAnswer("applicant_date_of_birth", dob);
    setAnswer("applicant_age_decimal", Math.round(ageDecimal * 100) / 100);
    computeNextStep();
  };

  return (
    <StepWrapper
      question="מה תאריך הלידה שלך?"
      hint="תאריך הלידה נדרש לקביעת מסלול הזכאות המתאים."
    >
      <FormField
        label="תאריך לידה"
        htmlFor="dob"
        error={error}
      >
        <input
          id="dob"
          type="date"
          value={dob}
          onChange={(e) => { setDob(e.target.value); setError(""); }}
          className="w-full border-2 border-[#c8d0db] bg-white px-3 py-2.5 text-[15px] text-[#1a1a1a] min-h-[48px] focus:border-[#003f8a] focus:outline-none focus:ring-2 focus:ring-[#003f8a]/20 font-[inherit]"
          max="2026-03-15"
          aria-required="true"
          aria-describedby={error ? "dob-error" : undefined}
        />
      </FormField>
      <NextButton onClick={handleNext} disabled={!dob} />
    </StepWrapper>
  );
}
