"use client";
import { useChalatStore } from "@/store/chalat-store";

export function WelcomeStep() {
  const goTo = useChalatStore((s) => s.goTo);
  const setMode = useChalatStore((s) => s.setMode);
  const reset = useChalatStore((s) => s.reset);

  const start = (mode: "citizen" | "clerk") => {
    reset();
    setMode(mode);
    goTo("dates");
  };

  return (
    <div className="mt-4">
      <div className="bg-white border border-black/10 rounded-lg shadow-[0_2px_8px_rgba(6,77,173,0.08)] p-6">
        <h2 className="text-xl font-bold text-[#0c3058] mb-3">
          בדיקת זכאות לדמי אבטלה — הוראת שעה
        </h2>
        <p className="text-[#0c3058] mb-4 leading-relaxed">
          שירות זה מאפשר לבדוק זכאות לדמי אבטלה בהתאם לתיקוני החקיקה שנכנסו לתוקף
          במסגרת מבצע שאגת הארי (28.2.26 — 14.4.26).
        </p>
        <hr className="border-t border-black/10 my-4" />
        <p className="text-sm text-[#266794] mb-2 font-semibold">ההקלות העיקריות בהוראת השעה:</p>
        <ul className="space-y-1.5 mb-5 text-sm text-[#0c3058]" role="list">
          <li className="flex items-start gap-2"><span className="text-[#0368b0] font-bold" aria-hidden="true">&#x2713;</span>קיצור תקופת חל&quot;ת ל-10 ימים במקום 30</li>
          <li className="flex items-start gap-2"><span className="text-[#0368b0] font-bold" aria-hidden="true">&#x2713;</span>קיצור תקופת אכשרה ל-6 חודשים (3 לאוכלוסיות מיוחדות)</li>
          <li className="flex items-start gap-2"><span className="text-[#0368b0] font-bold" aria-hidden="true">&#x2713;</span>ביטול ימי אמתנה וביטול שלילה בגין ימי חופשה</li>
          <li className="flex items-start gap-2"><span className="text-[#0368b0] font-bold" aria-hidden="true">&#x2713;</span>חישוב הכנסה עצמאית לפי אישור רו&quot;ח חודשי</li>
          <li className="flex items-start gap-2"><span className="text-[#0368b0] font-bold" aria-hidden="true">&#x2713;</span>הארכת תשלום למובטל חוזר</li>
        </ul>
        <div className="bg-[#e8f3ff] border border-[#0368b0]/20 p-4 rounded-lg mb-5" role="note">
          <p className="text-sm text-[#0c3058] leading-relaxed">
            <strong>לתשומת לבך:</strong> תוצאות הבדיקה מבוססות על הנתונים שתזין/י בלבד.
            הבדיקה אינה מהווה אישור רשמי ואינה מחליפה פנייה לסניף ביטוח לאומי.
          </p>
        </div>
        <div className="space-y-3">
          <button onClick={() => start("citizen")} type="button"
            className="w-full bg-[#0368b0] text-[#f5f9ff] rounded-lg py-3 px-6 text-base font-semibold min-h-[48px] hover:bg-[#025a8f] cursor-pointer focus:ring-2 focus:ring-[#0068f5] focus:ring-offset-2 transition-colors"
            aria-label="התחל בדיקה כאזרח">
            התחל בדיקה
          </button>
          <button onClick={() => start("clerk")} type="button"
            className="w-full bg-white border-2 border-[#0368b0] text-[#0368b0] rounded-lg py-3 px-6 text-base font-semibold min-h-[48px] hover:bg-[#e8f3ff] cursor-pointer focus:ring-2 focus:ring-[#0068f5] focus:ring-offset-2 transition-colors"
            aria-label="כניסה לממשק פקיד תביעות">
            ממשק פקיד תביעות
          </button>
        </div>
      </div>
      <div className="bg-white border border-black/10 border-t-0 rounded-b-lg px-6 py-3">
        <p className="text-xs text-[#266794]">
          לסיוע: <strong>*6050</strong> |{" "}
          <a href="https://www.btl.gov.il" target="_blank" rel="noopener noreferrer" className="text-[#0368b0] underline">btl.gov.il</a>
        </p>
      </div>
    </div>
  );
}
