import { create } from "zustand";
import { evaluateChalat, type ChalatInput, type ChalatResult } from "@/engine/chalat-engine";

export type ChalatStep =
  | "welcome" | "dates" | "reason" | "akshara" | "special_pop"
  | "special_docs" | "tofes100" | "independent"
  | "active_claim" | "exhausted_days" | "under40_returning" | "new_claim_q" | "klavia"
  | "result";

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

function nextStep(cur: ChalatStep, input: Partial<ChalatInput>): ChalatStep {
  switch (cur) {
    case "welcome": return "dates";
    case "dates": return "reason";
    case "reason": return "akshara";

    case "akshara": {
      const m = input.akshara_months ?? 0;
      // 6+ → skip special pop, go to tofes100
      if (m >= 6) return "tofes100";
      // 3-5 → ask special pop
      if (m >= 3) return "special_pop";
      // 0-2 → denied (engine will handle), go to result
      return "result";
    }

    case "special_pop": {
      const special = input.is_disability_ni || input.is_disability_tax_exempt ||
        input.is_evacuee || input.is_spouse_reserve_120 ||
        input.is_spouse_wounded || input.is_discharged_soldier;
      return special ? "special_docs" : "result";
    }

    case "special_docs": return "tofes100";
    case "tofes100": return "independent";
    case "independent": return "active_claim";

    case "active_claim": {
      // "yes" = had active claim approved in last year → continue existing
      if (input.has_active_claim) return "result";
      // "no" → ask about under 40 returning
      return "under40_returning";
    }

    case "under40_returning": {
      // under 40 + got unemployment in 4 years?
      if (input.is_under40_returning) return "new_claim_q";
      return "result";
    }

    case "new_claim_q": {
      // filed new claim for 3/4.26?
      if (input.filed_new_claim) return "result";
      return "result";
    }

    case "exhausted_days": return "klavia";

    case "klavia": return "result";

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
  has_independent_income: false,
  independent_monthly_income: null,
  has_bl_1510: false,
  remaining_vacation_days: 0,
  tofes_100_received: false,
  employer_confirmation: false,
  claim_month: "3.26",
  has_active_claim: false,
  exhausted_all_days: false,
  had_im_klavia: false,
  is_new_claim: true,
  is_under40_returning: false,
  filed_new_claim: false,
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
    const { step, input } = get();
    const n = nextStep(step, input);
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
      has_independent_income: input.has_independent_income || false,
      independent_monthly_income: input.independent_monthly_income ?? null,
      has_bl_1510: input.has_bl_1510 || false,
      remaining_vacation_days: 0,
      tofes_100_received: input.tofes_100_received || false,
      employer_confirmation: input.employer_confirmation || false,
      claim_month: input.claim_month || "3.26",
      has_active_claim: input.has_active_claim || false,
      exhausted_all_days: input.exhausted_all_days || false,
      had_im_klavia: input.had_im_klavia || false,
      is_new_claim: input.is_new_claim ?? true,
      is_under40_returning: input.is_under40_returning || false,
      filed_new_claim: input.filed_new_claim || false,
    };
    set({ result: evaluateChalat(full) });
  },

  reset: () => set({ step: "welcome", input: { ...defaults }, result: null, history: ["welcome"] }),
}));
