"use client";

import { useWizardStore, type UserTopic } from "@/store/wizard-store";

const TOPICS: {
  id: UserTopic;
  label: string;
  desc: string;
}[] = [
  {
    id: "chalath",
    label: 'חופשה ללא תשלום (חל"ת)',
    desc: 'דמי אבטלה, זכויות עובדים בחל"ת עקב המבצע',
  },
  {
    id: "reserve",
    label: "שירות מילואים - אני או בן/בת הזוג",
    desc: "היעדרות, חופשה מוגנת, הגנה מפני פיטורים",
  },
  {
    id: "senior",
    label: "אזרח/ית ותיק/ה (מעל גיל 67)",
    desc: "מענק חירום לאזרחים ותיקים שעבודתם הופסקה",
  },
  {
    id: "maternity",
    label: "הריון או לידה",
    desc: "שמירת הריון, החזר הסעה ללידה, חפיפה עם חל\"ת",
  },
  {
    id: "business",
    label: "עסק שנפגע עקב המבצע",
    desc: "פיצוי עסקים, הקלות לעצמאים",
  },
  {
    id: "other",
    label: "אינני בטוח/ה מה רלוונטי אליי",
    desc: "השאלון יבדוק את כל האפשרויות הרלוונטיות",
  },
];

export function TopicStep() {
  const { setTopic, computeNextStep } = useWizardStore();

  const select = (topic: UserTopic) => {
    setTopic(topic);
    computeNextStep();
  };

  return (
    <div className="mt-4">
      <div className="bg-white border border-[#c8d0db] p-6">
        <h2 className="text-xl font-semibold text-[#1a1a1a] mb-1">
          מה הנושא הרלוונטי אליך?
        </h2>
        <p className="text-sm text-[#4a5568] mb-5">
          בחר/י את הנושא המתאים ביותר למצבך. השאלון יותאם בהתאם.
        </p>

        <fieldset>
          <legend className="sr-only">בחירת נושא הבדיקה</legend>
          <div className="space-y-2" role="list">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => select(t.id)}
                type="button"
                role="listitem"
                className="w-full text-right p-4 border-2 border-[#c8d0db] bg-white text-[#1a1a1a] hover:border-[#003f8a] hover:bg-[#f0f5fc] transition-colors min-h-[52px] cursor-pointer"
                aria-label={`${t.label} - ${t.desc}`}
              >
                <span className="block font-semibold text-[#1a1a1a]">
                  {t.label}
                </span>
                <span className="block text-sm text-[#4a5568] font-normal mt-0.5">
                  {t.desc}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
