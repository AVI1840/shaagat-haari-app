import { create } from "zustand";
import { evaluateChalat, type ChalatInput, type ChalatResult } from "@/engine/chalat-engine";

export type ChalatStep =
  | "welcome" | "dates" | "reason" | "akshara" | "special_pop"
  | "special_docs" | "tofes100" | "independent"
  | "active_claim" | "exhausted_days" | "klavia"
  | "under40_returning" | "new_claim_q"
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

function nextStep(cur: ChalatStep, inp: Partial<ChalatInput>): ChalatStep {
  switch (cur) {
    case "welcome": return "dates";
    case "dates": {
      const s = inp.chalat_start;
      const e = inp.chalat_end || new Date().toISOString().split("T")[0];
      if (s) {
        const d = Math.round((new Date(e).getTime() - new Date(s).getTime()) / 86400000);
        if (d < 10) return "result";
      }
      return "reason";
    }
    case "reason": return "akshara";
    case "akshara": {
      const m = inp.akshara_months ?? 0;
      if (m >= 6) return "tofes100";
      if (m >= 3) return "special_pop";
      return "result";
    }
    case "special_pop": {
      const sp = inp.is_disability_ni || inp.is_disability_tax_exempt ||
        inp.is_evacuee || inp.is_spouse_reserve_120 ||
        inp.is_spouse_wounded || inp.is_discharged_soldier;
      return sp ? "special_docs" : "result";
    }
    case "special_docs": return "tofes100";
    case "tofes100": return "independent";
    case "independent": return "active_claim";
    case "active_claim":
      return inp.has_active_claim ? "exhausted_days" : "under40_returning";
    case "exhausted_days":
      return inp.exhausted_all_days ? "klavia" : "result";
    case "klavia": return "result";
    case "under40_returning":
      return inp.is_under40_returning ? "new_claim_q" : "result";
    case "new_claim_q": return "result";
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
    const h = [...s.history]; h.pop();
    return { step: h[h.length - 1] || "welcome", history: h };
  }),
  run: () => {
    const { input: i } = get();
    const full: ChalatInput = {
      chalat_start: i.chalat_start || "2026-03-01",
      chalat_end: i.chalat_end || null,
      chalat_reason: i.chalat_reason || "employer",
      akshara_months: i.akshara_months || 0,
      akshara_includes_military: i.akshara_includes_military || 0,
      is_disability_ni: i.is_disability_ni || false,
      is_disability_tax_exempt: i.is_disability_tax_exempt || false,
      is_evacuee: i.is_evacuee || false,
      is_spouse_reserve_120: i.is_spouse_reserve_120 || false,
      is_spouse_wounded: i.is_spouse_wounded || false,
      is_discharged_soldier: i.is_discharged_soldier || false,
      has_independent_income: i.has_independent_income || false,
      independent_monthly_income: i.independent_monthly_income ?? null,
      has_bl_1510: i.has_bl_1510 || false,
      remaining_vacation_days: 0,
      tofes_100_received: i.tofes_100_received || false,
      employer_confirmation: i.employer_confirmation || false,
      claim_month: i.claim_month || "3.26",
      has_active_claim: i.has_active_claim || false,
      exhausted_all_days: i.exhausted_all_days || false,
      had_im_klavia: i.had_im_klavia || false,
      is_new_claim: i.is_new_claim ?? true,
      is_under40_returning: i.is_under40_returning || false,
      filed_new_claim: i.filed_new_claim || false,
    };
    set({ result: evaluateChalat(full) });
  },
  reset: () => set({ step: "welcome", input: { ...defaults }, result: null, history: ["welcome"] }),
}));
