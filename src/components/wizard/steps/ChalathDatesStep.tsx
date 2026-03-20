"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { StepWrapper, NextButton, FormField } from "../StepWrapper";

export function ChalathDatesStep() {
  const { setAnswers, computeNextStep, answers } = useWizardStore();
  const [startDate, setStartDate] = useState(answers.chalath_commencement_date || "");
  const [endDate, setEndDate] = useState(answers.chalath_termination_date || "");
  const [ongoing, setOngoing] = useState(false);
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!startDate) {
      setError('יש להזין תאריך תחילת החל"ת.');
      return;
    }
    setError("");
    const end = ongoing ? null : endDate || null;
    let duration = 0;
    if (end) {
      duration = Math.round(
        (new Date(end).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      );
    } else {
      duration = Math.round(
        (new Date("2026-03-19").getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      );
    }
    setAnswers({
      chalath_commencement_date: startDate,
      chalath_termination_date: end,
      chalath_continuous_duration: Math.max(0, duration),
      claim_submission_date: new Date().toISOString().split("T")[0],
    });
    computeNextStep();
  };

  return (
    <StepWrapper
      question='מתי החלה ומתי הסתיימה תקופת החל"ת?'
      hint='נדרשים לפחות 14 ימי חל"ת רצופים לצורך הזכאות.'
    >
      <FormField label='תאריך תחילת החל"ת' htmlFor="chalath-start" error={error}>
        <input
          id="chalath-start"
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setError(""); }}
          className="w-full border-2 border-[#c8d0db] bg-white px-3 py-2.5 text-[15px] text-[#1a1a1a] min-h-[48px] focus:border-[#003f8a] focus:outline-none focus:ring-2 focus:ring-[#003f8a]/20 font-[inherit]"
          aria-required="true"
        />
      </FormField>

      <div className="flex items-center gap-3 py-1">
        <input
          type="checkbox"
          id="ongoing"
          checked={ongoing}
          onChange={(e) => setOngoing(e.target.checked)}
          className="w-5 h-5 border-2 border-[#c8d0db] accent-[#003f8a]"
        />
        <label htmlFor="ongoing" className="text-sm text-[#1a1a1a] cursor-pointer">
          עדיין בחל&quot;ת (טרם חזרתי לעבודה)
        </label>
      </div>

      {!ongoing && (
        <FormField label="תאריך חזרה לעבודה" htmlFor="chalath-end">
          <input
            id="chalath-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border-2 border-[#c8d0db] bg-white px-3 py-2.5 text-[15px] text-[#1a1a1a] min-h-[48px] focus:border-[#003f8a] focus:outline-none focus:ring-2 focus:ring-[#003f8a]/20 font-[inherit]"
            min={startDate}
          />
        </FormField>
      )}

      <NextButton onClick={handleNext} disabled={!startDate} />
    </StepWrapper>
  );
}
