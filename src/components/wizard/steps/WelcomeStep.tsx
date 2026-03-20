"use client";

import { useWizardStore } from "@/store/wizard-store";

export function WelcomeStep() {
  const goToStep = useWizardStore((s) => s.goToStep);
  const reset = useWizardStore((s) => s.reset);

  return (
    <div className="mt-4">
      {/* Main panel */}
      <div className="bg-white border border-[#c8d0db] p-6">
        <h2 className="text-xl font-bold text-[#003f8a] mb-3 leading-snug">
          שירות בדיקת זכאות לזכויות
        </h2>
        <p className="text-[#1a1a1a] mb-4 leading-relaxed">
          שירות זה מסייע לאזרחים לבדוק זכאות לגמלאות ומענקים של המוסד לביטוח
          לאומי בעקבות מבצע שאגת הארי.
        </p>

        <hr className="border-0 border-t border-[#c8d0db] my-5" />

        <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 uppercase tracking-wide">
          מה כולל השירות
        </h3>
        <ul className="space-y-2 mb-5" role="list">
          {[
            "בדיקת זכאות על פי נתונים שתזין/י",
            "הסבר ברור על הזכויות הרלוונטיות",
            "רשימת מסמכים נדרשים להגשת תביעה",
            "הנחיות שלב אחר שלב להמשך הטיפול",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-[#1a1a1a]">
              <span className="text-[#003f8a] font-bold mt-0.5" aria-hidden="true">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>

        <hr className="border-0 border-t border-[#c8d0db] my-5" />

        {/* Trust notice */}
        <div
          className="bg-[#eef3fb] border border-[#b0c4e8] p-4 mb-5"
          role="note"
          aria-label="הערה חשובה"
        >
          <p className="text-sm text-[#1a3a6b] leading-relaxed">
            <strong>לתשומת לבך:</strong> תוצאות השירות מבוססות על הנתונים
            שתזין/י בלבד. הבדיקה אינה מהווה אישור רשמי ואינה מחליפה פנייה
            לסניף ביטוח לאומי.
          </p>
        </div>

        <button
          onClick={() => {
            reset();
            goToStep("topic");
          }}
          type="button"
          className="w-full bg-[#003f8a] border-2 border-[#003f8a] text-white py-3 px-6 text-base font-semibold min-h-[48px] hover:bg-[#002d63] hover:border-[#002d63] transition-colors cursor-pointer"
          aria-label="התחל בדיקת זכאות"
        >
          התחל בדיקה
        </button>
      </div>

      {/* Contact info */}
      <div className="bg-white border border-[#c8d0db] border-t-0 px-6 py-3">
        <p className="text-xs text-[#4a5568]">
          לסיוע טלפוני: <strong>*6050</strong> | אתר ביטוח לאומי:{" "}
          <a
            href="https://www.btl.gov.il"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#003f8a] underline"
          >
            btl.gov.il
          </a>
        </p>
      </div>
    </div>
  );
}
