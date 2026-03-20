"use client";

import { useWizardStore } from "@/store/wizard-store";
import { WelcomeStep } from "./steps/WelcomeStep";
import { TopicStep } from "./steps/TopicStep";
import { AgeStep } from "./steps/AgeStep";
import { GenderStep } from "./steps/GenderStep";
import { EmploymentStep } from "./steps/EmploymentStep";
import { SeniorImpactStep } from "./steps/SeniorImpactStep";
import { ChalathDatesStep } from "./steps/ChalathDatesStep";
import { ChalathWorkStep } from "./steps/ChalathWorkStep";
import { EvacueeStep } from "./steps/EvacueeStep";
import { DisabilityStep } from "./steps/DisabilityStep";
import { IdfDischargedStep } from "./steps/IdfDischargedStep";
import { AksharaStep } from "./steps/AksharaStep";
import { Tofes100Step } from "./steps/Tofes100Step";
import { MaternityContextStep } from "./steps/MaternityContextStep";
import { MaternityTransportStep } from "./steps/MaternityTransportStep";
import { PregnancyPreservationStep } from "./steps/PregnancyPreservationStep";
import { SpouseReserveStep } from "./steps/SpouseReserveStep";
import { SpouseChildStep } from "./steps/SpouseChildStep";
import { WageDataStep } from "./steps/WageDataStep";
import { DualStatusStep } from "./steps/DualStatusStep";
import { ActionCard } from "../action-card/ActionCard";

const TOTAL_STEPS = 12;

const stepComponents: Record<string, React.ComponentType> = {
  welcome: WelcomeStep,
  topic: TopicStep,
  age: AgeStep,
  gender: GenderStep,
  employment_classification: EmploymentStep,
  senior_operational_impact: SeniorImpactStep,
  chalath_dates: ChalathDatesStep,
  chalath_work_during: ChalathWorkStep,
  evacuee: EvacueeStep,
  disability: DisabilityStep,
  idf_discharged: IdfDischargedStep,
  akshara: AksharaStep,
  tofes_100: Tofes100Step,
  maternity_context: MaternityContextStep,
  maternity_transport: MaternityTransportStep,
  pregnancy_preservation: PregnancyPreservationStep,
  spouse_reserve: SpouseReserveStep,
  spouse_child: SpouseChildStep,
  wage_data: WageDataStep,
  dual_status_income: DualStatusStep,
  result: ActionCard,
};

export function WizardShell() {
  const currentStep = useWizardStore((s) => s.currentStep);
  const stepHistory = useWizardStore((s) => s.stepHistory);
  const goBack = useWizardStore((s) => s.goBack);

  const StepComponent = stepComponents[currentStep];
  const questionSteps = stepHistory.filter(
    (s) => s !== "welcome" && s !== "result"
  ).length;
  const progress = Math.min((questionSteps / TOTAL_STEPS) * 100, 100);

  const showProgress = currentStep !== "welcome" && currentStep !== "result";
  const showBack =
    currentStep !== "welcome" &&
    currentStep !== "topic" &&
    currentStep !== "result";

  return (
    <div className="min-h-screen bg-[#f5f6f8]" dir="rtl">
      {/* Skip to content */}
      <a href="#main-content" className="skip-link">
        דלג לתוכן הראשי
      </a>

      {/* Government Header */}
      <header role="banner" className="bg-[#003f8a] text-white">
        {/* Top bar */}
        <div className="bg-[#002d63] py-1.5 px-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <span className="text-xs text-blue-200">המוסד לביטוח לאומי</span>
            <span className="text-xs text-blue-200">gov.il</span>
          </div>
        </div>
        {/* Main header */}
        <div className="px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            {/* Logo placeholder */}
            <div
              className="w-12 h-12 bg-white flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <span className="text-[#003f8a] font-bold text-xs text-center leading-tight">
                ב"ל
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">
                בדיקת זכאות לזכויות - ביטוח לאומי
              </h1>
              <p className="text-sm text-blue-200 mt-0.5">
                מבצע שאגת הארי | מרץ 2026
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      {showProgress && (
        <div
          className="bg-white border-b border-[#c8d0db]"
          role="region"
          aria-label="התקדמות בשאלון"
        >
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#4a5568]">
                שאלה {questionSteps} מתוך כ-{TOTAL_STEPS}
              </span>
              <span className="text-xs text-[#4a5568]">
                {Math.round(progress)}% הושלם
              </span>
            </div>
            <div
              className="w-full bg-[#e2e8f0] h-2"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${Math.round(progress)} אחוז הושלם`}
            >
              <div
                className="bg-[#003f8a] h-2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main id="main-content" className="max-w-2xl mx-auto px-4 pb-12">
        {StepComponent ? <StepComponent /> : null}

        {showBack && (
          <div className="mt-4">
            <button
              onClick={goBack}
              type="button"
              className="bg-white border-2 border-[#003f8a] text-[#003f8a] font-semibold py-2.5 px-6 min-h-[48px] hover:bg-[#e8f0fb] transition-colors cursor-pointer"
              aria-label="חזרה לשאלה הקודמת"
            >
              ← חזרה
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        role="contentinfo"
        className="border-t border-[#c8d0db] bg-white mt-8 py-4 px-4"
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs text-[#4a5568]">
            המוסד לביטוח לאומי | שירות בדיקת זכאות מקוון
          </p>
          <p className="text-xs text-[#4a5568] mt-1">
            לסיוע: *6050 | btl.gov.il
          </p>
        </div>
      </footer>
    </div>
  );
}
