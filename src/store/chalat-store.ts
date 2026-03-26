import { create } from "zustand";
import { evaluateChalat, type ChalatInput, type ChalatResult } from "@/engine/chalat-engine";

export type ChalatStep =
  | "welcome" | "dates" | "reason" | "akshara" | "special_pop"
  | "special_docs" | "tofes100" | "vacation" | "independent"
  | "returning" | "result";

interface ChalatState {
  mode: "citizen" | "clerk";
  step: ChalatStep;
  input: Partial<ChalatInput>;
  result: ChalatResult | null;
  history: ChalatStep[];
  setMode: (m: "citizen" | "clerk") => void;
  setField: (key: string, val: unknown) => void;
  setFields: (updates: Partial<ChalatInput>) => void;
  goTo: (s: ChalatStep) => void;
  next: () => void;
  back: () => void;
  run: () => void;
  reset: () => void;
}

function nextStep(cur: ChalatStep, input: Partial<ChalatInput>, mode: string): ChalatStep {
  switch (cur) {
    case "welcome": return "dates";
    case "dates": return "reason";
    case "reason": return "akshara";
    case "akshara": return "special_pop";
    case "special_pop": {
      const special = input.is_disability_ni || input.is_disability_tax_exempt ||
        input.is_evacuee || input.is_spouse_reserve_120 ||
        input.is_spouse_wounded || input.is_discharged_soldier;
      return special ? "special_docs" : "tofes100";
    }
    case "special_docs": return "tofes100";
    case "tofes100": return "vacation";
    case "vacation": return "independent";
    case "independent": return "returning";
    case "returning": return "result";
    default: return "result";
  }
}

const defaults: Partial<ChalatInput> = {
  chalat_end: null,
  chalat_reason: "employer",
  akshara_months: 0,
  akshara_includes_military: 0,
  is_disability_ni: false,
  is_disability_tax_exempt: false,
  is_evacuee: false,
  is_spouse_reserve_120: false,
  is_spouse_wounded: false,
  is_discharged_soldier: false,
  is_returning_unemployed: false,
  exhausted_180_percent: false,
  had_im_klavia: false,
  has_independent_income: false,
  independent_monthly_income: null,
  has_bl_1503: false,
  remaining_vacation_days: 0,
  tofes_100_received: false,
  employer_confirmation: false,
  claim_month: "3.26",
};

export const useChalatStore = create<ChalatState>()((set, get) => ({
  mode: "citizen",
  step: "welcome",
  input: { ...defaults },
  result: null,
  history: ["welcome"],

  setMode: (m) => set({ mode: m }),
  setField: (key, val) => set((s) => ({ input: { ...s.input, [key]: val } })),
  setFields: (u) => set((s) => ({ input: { ...s.input, ...u } })),

  goTo: (step) => set((s) => ({ step, history: [...s.history, step] })),

  next: () => {
    const { step, input, mode } = get();
    const n = nextStep(step, input, mode);
    set((s) => ({ step: n, history: [...s.history, n] }));
    if (n === "result") get().run();
  },

  back: () => set((s) => {
    const h = [...s.history];
    h.pop();
    return { step: h[h.length - 1] || "welcome", history: h };
  }),

  run: () => {
    const { input } = get();
    const full: ChalatInput = {
      chalat_start: input.chalat_start || "2026-03-01",
      chalat_end: input.chalat_end || null,
      chalat_reason: input.chalat_reason || "employer",
      akshara_months: input.akshara_months || 0,
      akshara_includes_military: input.akshara_includes_military || 0,
      is_disability_ni: input.is_disability_ni || false,
      is_disability_tax_exempt: input.is_disability_tax_exempt || false,
      is_evacuee: input.is_evacuee || false,
      is_spouse_reserve_120: input.is_spouse_reserve_120 || false,
      is_spouse_wounded: input.is_spouse_wounded || false,
      is_discharged_soldier: input.is_discharged_soldier || false,
      is_returning_unemployed: input.is_returning_unemployed || false,
      exhausted_180_percent: input.exhausted_180_percent || false,
      had_im_klavia: input.had_im_klavia || false,
      has_independent_income: input.has_independent_income || false,
      independent_monthly_income: input.independent_monthly_income ?? null,
      has_bl_1503: input.has_bl_1503 || false,
      remaining_vacation_days: input.remaining_vacation_days || 0,
      tofes_100_received: input.tofes_100_received || false,
      employer_confirmation: input.employer_confirmation || false,
      claim_month: input.claim_month || "3.26",
    };
    set({ result: evaluateChalat(full) });
  },

  reset: () => set({ step: "welcome", input: { ...defaults }, result: null, history: ["welcome"] }),
}));
