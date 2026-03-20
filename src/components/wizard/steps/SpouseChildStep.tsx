"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, NextButton, FormField } from "../StepWrapper";

export function SpouseChildStep() {
  const { setAnswer, computeNextStep, answers } = useWizardStore();
  const [age, setAge] = useState<string>(
    answers.child_age_minimum?.toString() || ""
  );

  const handleNext = () => {
    const val = parseFloat(age);
    setAnswer("child_age_minimum", isNaN(val) ? null : val);
    computeNextStep();
  };

  return (
    <StepWrapper
      question="מה גיל הילד/ה הצעיר/ה ביותר שלך?"
      hint="ילד/ה מתחת לגיל 13 מזכה בשעת היעדרות יומית ללא ניכוי שכר."
    >
      <FormField
        label="גיל הילד/ה הצעיר/ה"
        htmlFor="child-age"
        hint="ניתן להזין גיל עם חצי שנה (לדוגמה: 2.5)"
      >
        <input
          id="child-age"
          type="number"
          min={0}
          max={18}
          step={0.5}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full border-2 border-[#c8d0db] bg-white px-3 py-2.5 text-[15px] text-[#1a1a1a] min-h-[48px] focus:border-[#003f8a] focus:outline-none focus:ring-2 focus:ring-[#003f8a]/20 font-[inherit]"
          placeholder="גיל בשנים"
          aria-required="true"
        />
      </FormField>
      <NextButton onClick={handleNext} disabled={age === ""} />
    </StepWrapper>
  );
}
