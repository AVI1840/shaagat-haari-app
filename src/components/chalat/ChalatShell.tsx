"use client";

import { useState, useEffect } from "react";
import { useChalatStore } from "@/store/chalat-store";
import { WelcomeStep } from "./steps/WelcomeStep";
import { DatesStep } from "./steps/DatesStep";
import { ReasonStep } from "./steps/ReasonStep";
import { AksharaStep } from "./steps/AksharaStep";
import { SpecialPopStep } from "./steps/SpecialPopStep";
import { SpecialDocsStep } from "./steps/SpecialDocsStep";
import { Tofes100Step } from "./steps/Tofes100Step";
import { IndependentStep } from "./steps/IndependentStep";
import { ActiveClaimStep } from "./steps/ActiveClaimStep";
import { ExhaustedDaysStep } from "./steps/ExhaustedDaysStep";
import { KlaviaStep } from "./steps/KlaviaStep";
import { ChalatResultView } from "./ChalatResult";
import { FeedbackModal } from "./FeedbackModal";

const STEPS: Record<string, React.ComponentType> = {
  welcome: WelcomeStep, dates: DatesStep, reason: ReasonStep,
  akshara: AksharaStep, special_pop: SpecialPopStep, special_docs: SpecialDocsStep,
  tofes100: Tofes100Step, independent: IndependentStep,
  active_claim: ActiveClaimStep, exhausted_days: ExhaustedDaysStep, klavia: KlaviaStep,
  result: ChalatResultView,
};
const TOTAL = 8;

export function ChalatShell({ forceMode }: { forceMode?: "citizen" | "clerk" }) {
  const step = useChalatStore((s) => s.step);
  const mode = useChalatStore((s) => s.mode);
  const setMode = useChalatStore((s) => s.setMode);
  const history = useChalatStore((s) => s.history);
  const back = useChalatStore((s) => s.back);
  const [fbOpen, setFbOpen] = useState(false);

  useEffect(() => { if (forceMode) setMode(forceMode); }, [forceMode, setMode]);

  const isClerk = forceMode === "clerk" || mode === "clerk";
  const Comp = STEPS[step];
  const qCount = history.filter((s) => s !== "welcome" && s !== "result").length;
  const pct = Math.min((qCount / TOTAL) * 100, 100);
  const showProgress = step !== "welcome" && step !== "result";
  const showBack = step !== "welcome" && step !== "result";

  return (
    <div className="min-h-screen bg-[#f5f6f8]" dir="rtl">
      <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>

      <header role="banner" className="bg-[#0c3058]">
        <div className="bg-[#091e38] py-1.5 px-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <span className="text-xs text-[#8bb8e8]">המוסד לביטוח לאומי</span>
            <span className="text-xs text-[#8bb8e8]">
              {isClerk ? "ממשק פקיד תביעות" : "שירות לאזרח"}
            </span>
          </div>
        </div>
        <div className="px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <div className="w-11 h-11 bg-white flex items-center justify-center shrink-0" aria-hidden="true">
              <span className="text-[#0c3058] font-bold text-[10px] leading-tight text-center">ב&quot;ל</span>
            </div>
            <div>
              <h1 className="text-white text-base sm:text-lg font-bold leading-tight">
                {isClerk ? "כלי סיוע לפקיד — דמי אבטלה הוראת שעה" : "בדיקת זכאות לדמי אבטלה — הוראת שעה"}
              </h1>
              <p className="text-[#8bb8e8] text-xs sm:text-sm mt-0.5">מבצע שאגת הארי | 28.2.26 — 14.4.26</p>
            </div>
          </div>
        </div>
      </header>

      {showProgress && (
        <div className="bg-white border-b border-[#0368b0]/20" role="region" aria-label="התקדמות">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-[#266794]">שאלה {qCount} מתוך כ-{TOTAL}</span>
              <span className="text-xs text-[#266794]">{Math.round(pct)}%</span>
            </div>
            <div className="w-full bg-[#e8f3ff] h-2" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
              <div className="bg-[#0368b0] h-2 transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      )}

      <main id="main-content" className="max-w-3xl mx-auto px-4 pb-12">
        {Comp ? <Comp /> : null}
        {showBack && (
          <div className="mt-4">
            <button onClick={back} type="button"
              className="bg-white border-2 border-[#0368b0] text-[#0368b0] font-semibold py-2.5 px-6 min-h-[48px] hover:bg-[#e8f3ff] transition-colors cursor-pointer text-sm rounded-lg"
              aria-label="חזרה לשאלה הקודמת">
              ← חזרה
            </button>
          </div>
        )}
      </main>

      <footer role="contentinfo" className="border-t border-black/10 bg-white mt-8 py-4 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-1">
          <p className="text-xs text-[#266794]">המוסד לביטוח לאומי | שירות בדיקת זכאות מקוון</p>
          <p className="text-xs text-[#266794]">לסיוע: *6050 | btl.gov.il</p>
        </div>
      </footer>

      {/* Feedback — clerk only */}
      {isClerk && (
        <>
          <button
            onClick={() => setFbOpen(true)}
            className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-white text-sm font-medium hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            style={{ backgroundColor: "#1B3A5C" }}
            aria-label="משוב פיילוט"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
            <span className="hidden sm:inline">משוב פיילוט</span>
          </button>
          <FeedbackModal open={fbOpen} onClose={() => setFbOpen(false)} />
        </>
      )}
    </div>
  );
}
