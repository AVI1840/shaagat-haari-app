"use client";
import { useChalatStore } from "@/store/chalat-store";

export function WelcomeStep() {
  const goTo = useChalatStore((s) => s.goTo);
  const reset = useChalatStore((s) => s.reset);
  const mode = useChalatStore((s) => s.mode);

  const start = () => { reset(); goTo("dates"); };

  return (
    <div className="mt-4">
      <div className="bg-white border border-black/10 rounded-lg shadow-[0_2px_8px_rgba(6,77,173,0.08)] p-5 sm:p-6">
        <div className="flex items-center gap-4 mb-4">
          <img src="/btl-logo.png" alt="המוסד לביטוח לאומי" className="h-14 sm:h-16 w-auto shrink-0" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0c3058]">
              בדיקת זכאות לדמי אבטלה
            </h2>
            <p className="text-sm text-[#266794] font-medium">הוראת שעה — מבצע שאגת הארי</p>
          </div>
        </div>
        <p className="text-sm sm:text-base text-[#0c3058] mb-1 leading-relaxed">
          שירות זה מאפשר לבדוק זכאות לדמי אבטלה בהתאם לתיקוני החקיקה שנכנסו לתוקף במסגרת מבצע שאגת הארי.
        </p>
        <p className="text-sm sm:text-base text-[#0c3058] mb-4 leading-relaxed font-semibold">
          ההטבה תינתן למפוטרים / שיצאו לחל&quot;ת בין התאריכים 28.2.26 — 14.4.26.
        </p>
        <hr className="border-t border-black/10 my-4" />
        <p className="text-sm text-[#266794] mb-2 font-semibold">ההקלות העיקריות בהוראת השעה:</p>
        <ul className="space-y-1.5 mb-5 text-sm text-[#0c3058]" role="list">
          <li className="flex items-start gap-2"><span className="text-[#0368b0] font-bold shrink-0" aria-hidden="true">&#x2713;</span><span>קיצור תקופת חל&quot;ת ל-10 ימים במקום 30</span></li>
          <li className="flex items-start gap-2"><span className="text-[#0368b0] font-bold shrink-0" aria-hidden="true">&#x2713;</span><span>קיצור תקופת אכשרה ל-6 חודשים (3 לאוכלוסיות מיוחדות)</span></li>
          <li className="flex items-start gap-2"><span className="text-[#0368b0] font-bold shrink-0" aria-hidden="true">&#x2713;</span><span>ביטול ימי אמתנה וביטול שלילה בגין ימי חופשה</span></li>
          <li className="flex items-start gap-2"><span className="text-[#0368b0] font-bold shrink-0" aria-hidden="true">&#x2713;</span><span>חישוב הכנסה עצמאית לפי אישור רו&quot;ח חודשי</span></li>
          <li className="flex items-start gap-2"><span className="text-[#0368b0] font-bold shrink-0" aria-hidden="true">&#x2713;</span><span>הארכת תשלום למובטל חוזר בתביעה חדשה (עד גיל 40)</span></li>
          <li className="flex items-start gap-2"><span className="text-[#0368b0] font-bold shrink-0" aria-hidden="true">&#x2713;</span><span>הארכת תשלום למובטל עם תביעה בתוקף</span></li>
        </ul>
        <div className="bg-[#e8f3ff] border border-[#0368b0]/20 p-4 rounded-lg mb-5" role="note">
          <p className="text-sm text-[#0c3058] leading-relaxed">
            <strong>לתשומת לבך:</strong> תוצאות הבדיקה מבוססות על הנתונים שתזין/י בלבד.
            הבדיקה אינה מהווה אישור רשמי ואינה מחליפה פנייה לסניף ביטוח לאומי.
          </p>
        </div>
        <button onClick={start} type="button"
          className="w-full bg-[#0368b0] text-[#f5f9ff] rounded-lg py-3 px-6 text-base font-semibold min-h-[48px] hover:bg-[#025a8f] cursor-pointer focus:ring-2 focus:ring-[#0068f5] focus:ring-offset-2 transition-colors"
          aria-label={mode === "clerk" ? "התחל בדיקת תביעה" : "התחל בדיקה"}>
          {mode === "clerk" ? "התחל בדיקת תביעה" : "התחל בדיקה"}
        </button>
      </div>
      <div className="bg-white border border-black/10 border-t-0 rounded-b-lg px-5 sm:px-6 py-3">
        <p className="text-xs text-[#266794]">
          לסיוע: <strong>*6050</strong> |{" "}
          <a href="https://www.btl.gov.il" target="_blank" rel="noopener noreferrer" className="text-[#0368b0] underline">btl.gov.il</a>
        </p>
      </div>
    </div>
  );
}
