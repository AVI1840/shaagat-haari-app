import { create } from "zustand";
import type { CitizenProfile } from "@/schemas/citizen-profile";
import type { EngineResult } from "@/schemas/engine-result";
import { runEligibilityEngine } from "@/engine";

export type UserTopic =
  | "chalath"
  | "reserve"
  | "business"
  | "maternity"
  | "senior"
  | "other";

export type WizardStep =
  | "welcome"
  | "topic"
  | "age"
  | "gender"
  | "employment_classification"
  | "senior_operational_impact"
  | "chalath_dates"
  | "chalath_work_during"
  | "evacuee"
  | "disability"
  | "idf_discharged"
  | "akshara"
  | "tofes_100"
  | "maternity_context"
  | "maternity_transport"
  | "pregnancy_preservation"
  | "spouse_reserve"
  | "spouse_child"
  | "employer_reserve"
  | "wage_data"
  | "dual_status_income"
  | "result";

interface WizardState {
  currentStep: WizardStep;
  topic: UserTopic | null;
  answers: Partial<CitizenProfile>;
  stepHistory: WizardStep[];
  result: EngineResult | null;

  setTopic: (topic: UserTopic) => void;
  setAnswer: (key: string, value: unknown) => void;
  setAnswers: (updates: Partial<CitizenProfile>) => void;
  goToStep: (step: WizardStep) => void;
  goBack: () => void;
  computeNextStep: () => void;
  runEngine: () => void;
  reset: () => void;
}

function determineNextStep(
  currentStep: WizardStep,
  answers: Partial<CitizenProfile>,
  topic: UserTopic | null
): WizardStep {
  switch (currentStep) {
    case "welcome":
      return "topic";

    case "topic":
      return "age";

    case "age": {
      const age = answers.applicant_age_decimal ?? 0;
      if (age >= 67) return "senior_operational_impact";
      if (topic === "maternity") return "maternity_context";
      if (topic === "reserve") return "spouse_reserve";
      return "gender";
    }

    case "gender":
      return "employment_classification";

    case "senior_operational_impact":
      if (answers.employment_terminated_due_to_operation) return "wage_data";
      return "result";

    case "employment_classification": {
      const cls = answers.employment_classification;
      if (cls === "independent") return "result";
      return "tofes_100";
    }

    case "tofes_100":
      if (!answers.tofes_100_submitted) return "result";
      return "chalath_dates";

    case "chalath_dates":
      return "chalath_work_during";

    case "chalath_work_during":
      return "evacuee";

    case "evacuee":
      if (answers.geospatial_evacuee_flag) return "akshara";
      return "disability";

    case "disability":
      if (answers.disability_status_indicator) return "akshara";
      return "idf_discharged";

    case "idf_discharged":
      return "akshara";

    case "akshara":
      if (topic === "chalath") return "maternity_context";
      return "maternity_context";

    case "maternity_context":
      if (answers.maternity_protection_end) return "maternity_transport";
      if (answers.pregnancy_preservation_active)
        return "pregnancy_preservation";
      if (topic === "maternity") return "result";
      return "spouse_reserve";

    case "maternity_transport":
      if (answers.pregnancy_preservation_active)
        return "pregnancy_preservation";
      return topic === "maternity" ? "result" : "spouse_reserve";

    case "pregnancy_preservation":
      return topic === "maternity" ? "result" : "spouse_reserve";

    case "spouse_reserve":
      if (
        (answers.spouse_reserve_days ?? 0) >= 5 &&
        answers.child_age_minimum === undefined
      )
        return "spouse_child";
      if (topic === "reserve") return "result";
      if (answers.employment_classification === "dual")
        return "dual_status_income";
      return "result";

    case "spouse_child":
      if (answers.employment_classification === "dual")
        return "dual_status_income";
      return "result";

    case "employer_reserve":
      return "result";
    case "wage_data":
      return "result";
    case "dual_status_income":
      return "result";
    default:
      return "result";
  }
}

export const useWizardStore = create<WizardState>()((set, get) => ({
  currentStep: "welcome",
  topic: null,
  answers: { applicant_is_alive: true },
  stepHistory: ["welcome"],
  result: null,

  setTopic: (topic) => set({ topic }),

  setAnswer: (key, value) =>
    set((state) => ({
      answers: { ...state.answers, [key]: value },
    })),

  setAnswers: (updates) =>
    set((state) => ({
      answers: { ...state.answers, ...updates },
    })),

  goToStep: (step) =>
    set((state) => ({
      currentStep: step,
      stepHistory: [...state.stepHistory, step],
    })),

  goBack: () =>
    set((state) => {
      const history = [...state.stepHistory];
      history.pop();
      const prev = history[history.length - 1] || "welcome";
      return { currentStep: prev, stepHistory: history };
    }),

  computeNextStep: () => {
    const { currentStep, answers, topic } = get();
    const next = determineNextStep(currentStep, answers, topic);
    set((state) => ({
      currentStep: next,
      stepHistory: [...state.stepHistory, next],
    }));
    if (next === "result") {
      get().runEngine();
    }
  },

  runEngine: () => {
    const { answers } = get();
    const result = runEligibilityEngine(answers);
    set({ result });
  },

  reset: () =>
    set({
      currentStep: "welcome",
      topic: null,
      answers: { applicant_is_alive: true },
      stepHistory: ["welcome"],
      result: null,
    }),
}));
