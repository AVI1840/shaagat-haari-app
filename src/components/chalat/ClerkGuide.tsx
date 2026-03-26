"use client";
import { useState } from "react";
import { FeedbackModal } from "./FeedbackModal";

interface QA { q: string; a: string; example?: string; system_note?: string; }
interface Sec { title: string; ref: string; items: QA[]; }

const S: Sec[] = [
  { title: 'קיצור תקופת חל"ת ל-10 ימים', ref: "1", items: [
    { q: 'מה תקופת החל"ת המינימלית?', a: '10 ימים קלנדריים (במקום 30) למי שהוצא לחל"ת או יצא מיוזמתו בין 28.2.26 ל-14.4.26. מחוץ לתקופה — 30 יום.', example: 'עובד הוצא לחל"ת ב-5.3.26 וחזר ב-16.3.26 (11 ימים). זכאי.' },
    { q: 'האם יציאה לחל"ת ביוזמת העובד מזכה?', a: 'כן, בתקופה 28.2.26-14.4.26 גם יציאה ביוזמת העובד מזכה. מחוץ לתקופה — לא זכאי כלל.', example: 'עובדת יצאה מיוזמתה ב-1.3.26 ל-12 ימים. זכאית.' },
  ]},
  { title: "קיצור אכשרה ל-6 חודשים", ref: "2", items: [
    { q: "מה תקופת האכשרה הנדרשת?", a: '6 חודשים מתוך 18 (במקום 12) למי שפוטר/הוצא לחל"ת/יצא מיוזמתו בתקופה הקובעת.' },
    { q: "החודש השישי חלקי — מה עושים?", a: 'יש להזין למערכת "כב" (כן לבסיס). אחרת השכר של 5 החודשים יחולק ב-150.', system_note: 'במסך חישוב שכר — סמן "כב" עבור חודש חלקי.', example: "מבוטח עבד 5 חודשים מלאים + 15 ימים. יש לסמן כב." },
  ]},
  { title: "אכשרה 3 חודשים — אוכלוסיות מיוחדות", ref: "3", items: [
    { q: "מי זכאי ל-3 חודשים?", a: "נכות כללית/מעבודה, פטור ממס רפואי, מפונים, בני זוג משרתי 120+ ימי מילואים, בני זוג פצועים, חיילים משוחררים." },
    { q: "איך מטפלים במערכת?", a: "המערכת לא ערוכה.", system_note: "להזין תקופת עבודה נוספת עד 6 חודשים במסך 162 תיק 03. להזין שכר 3 חודשים בתיק 03. התביעה תידחה ראשונית — לאשר לאחר אישורים.", example: "מפונה עם 4 חודשי אכשרה: להזין 2 חודשים נוספים במסך 162 תיק 03. לצרף אישור רשות מקומית." },
    { q: "אילו מסמכים נדרשים?", a: "נכות — נתוני ב\"ל. פטור ממס — אישור מס הכנסה. מפונים — אישור רשות מקומית. בני זוג מילואים/פצועים — אישור משהב\"ט. חיילים משוחררים — נתוני ב\"ל." },
  ]},
  { title: "ביטול ימי אמתנה", ref: "4", items: [
    { q: "מתי לא מנכים ימי אמתנה?", a: "בתביעות חדשות עם תאריך קובע 3.26 או 4.26. ינוכו רק לאחר 4 חודשי התייצבות רציפה." },
    { q: "מובטלים פעילים בתשלום המשך?", a: "ניכוי רגיל. ההקלה תקפה רק לתביעה חדשה.", example: "תביעה חדשה 3.26 — ללא ימי אמתנה. תשלום המשך מתביעה קודמת — ניכוי רגיל." },
  ]},
  { title: "ביטול שלילת חופשה", ref: "5", items: [
    { q: "האם מבצעים שלילה בגין ימי חופשה?", a: 'לא. לתביעות חדשות בתקופה 28.2.26-14.4.26 — אין שלילה בגין יתרת ימי חופשה.' },
  ]},
  { title: "חישוב הכנסה עצמאית", ref: "6", items: [
    { q: "איך מחשבים הכנסה עצמאית?", a: 'לפי אישור רו"ח/יועץ מס לחודשים 3.26 ו-4.26 בלבד. המבוטח מצרף טופס בל/1510.' },
    { q: "לא הומצא טופס בל/1510?", a: "קיזוז לפי מקדמות/שומה בנוהל הרגיל.", example: 'הכנסה 3,000 ש"ח ב-3.26 לפי רו"ח — ינוכו 3,000 ש"ח. אין קיזוז חודש חלקי. ב-4.26 יקוזז לכל החודש.' },
    { q: "אחרי תום התקופה?", a: "לאחר 4.26 — חזרה לקיזוז לפי מקדמות/שומה סופית." },
  ]},
  { title: "הארכת תשלום", ref: "7", items: [
    { q: "מובטל חוזר עד גיל 40 שניצל 180%?", a: "תביעה חדשה בתקופה הקובעת — דמי אבטלה עד 14.4.26. עד 180% — מוגבל ב-85%. לאחר 180% — מוגבל במרביים.", example: 'בן 35, ניצל 180%, הוצא לחל"ת 3.3.26. תביעה חדשה — זכאי עד 14.4.26.' },
    { q: "מובטל עם תביעה בתוקף שלא ניצל הכל?", a: "ממשיך לקבל. נדרש רישום בשירות התעסוקה + טופס 100 מהמעסיק." },
    { q: 'שתי הפסקות — "עם כלביא" + "שאגת הארי"?', a: 'פוטר/חל"ת ב-13.6.25-24.6.25, ניצל הכל, ושוב בתקופה 28.2.26-14.4.26 — המשך תשלום עד תום התקופה.', example: 'פוטר 15.6.25, ניצל הכל עד 1.2.26. חל"ת שוב 3.3.26 — זכאי עד 14.4.26.' },
  ]},
];

const H: QA[] = [
  { q: 'מעסיק דיווח בטופס 100?', a: "אין לדרוש אישור בכתב. להסתמך על הדיווח ולאשר." },
  { q: "לא דיווח בטופס 100 אבל יש אישור חתום?", a: 'להזין תאריכים מהאישור במסך 162. להזין יום עבודה אחרון בפועל + תאריך עבודה ראשון.' },
  { q: "שוני בין טופס 100 לאישור ידני?", a: "להזין במסך 162 לפי הדיווח האחרון." },
  { q: 'חזר לעבוד ימים בודדים בחל"ת, אין טופס 100?', a: "אם יש אישור מעסיק בכתב — לעדכן תאריכי חזרה במסך 139." },
];

function QACard({ item, open, toggle }: { item: QA; open: boolean; toggle: () => void }) {
  return (
    <div className={`border rounded-lg overflow-hidden transition-colors ${open ? "border-[#0368b0]/40 bg-white" : "border-black/10 bg-white hover:border-[#0368b0]/30"}`}>
      <button onClick={toggle} type="button" aria-expanded={open}
        className="w-full text-right p-4 flex items-start gap-3 cursor-pointer min-h-[52px]">
        <span className={`mt-0.5 shrink-0 text-sm font-mono transition-transform ${open ? "rotate-90 text-[#0368b0]" : "text-[#266794]"}`} aria-hidden="true">&#9654;</span>
        <span className="font-semibold text-[#0c3058] text-[15px] leading-snug">{item.q}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pr-11 space-y-3 border-t border-[#0368b0]/10">
          <p className="text-[15px] text-[#0c3058] leading-relaxed pt-3">{item.a}</p>
          {item.system_note && (
            <div className="bg-[#fef8ec] border-r-4 border-[#e6a817] p-3 rounded-sm">
              <p className="text-xs font-bold text-[#7a4f00] mb-1">הנחיית מערכת</p>
              <p className="text-sm text-[#7a4f00] leading-relaxed">{item.system_note}</p>
            </div>
          )}
          {item.example && (
            <div className="bg-[#f0f7ff] border-r-4 border-[#0368b0] p-3 rounded-sm">
              <p className="text-xs font-bold text-[#0368b0] mb-1">דוגמת יישום</p>
              <p className="text-sm text-[#0c3058] leading-relaxed">{item.example}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ClerkGuide() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [fbOpen, setFbOpen] = useState(false);

  const toggle = (k: string) => setOpenItems((p) => {
    const n = new Set(p); if (n.has(k)) n.delete(k); else n.add(k); return n;
  });

  const expandAll = () => {
    const all = new Set<string>();
    S.forEach((s, si) => s.items.forEach((_, qi) => all.add(`${si}-${qi}`)));
    H.forEach((_, i) => all.add(`h-${i}`));
    setOpenItems(all);
  };

  const collapseAll = () => setOpenItems(new Set());

  return (
    <div className="min-h-screen bg-[#f5f6f8]" dir="rtl">
      <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>

      <header role="banner" className="bg-[#0c3058]">
        <div className="bg-[#091e38] py-1.5 px-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <span className="text-xs text-[#8bb8e8]">המוסד לביטוח לאומי</span>
            <span className="text-xs text-[#8bb8e8]">ממשק פקיד תביעות</span>
          </div>
        </div>
        <div className="px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <img src="/btl-logo.png" alt="המוסד לביטוח לאומי" className="h-10 sm:h-11 w-auto shrink-0" />
            <div>
              <h1 className="text-white text-base sm:text-lg font-bold leading-tight">כלי סיוע לפקיד תביעות — דמי אבטלה</h1>
              <p className="text-[#8bb8e8] text-xs sm:text-sm mt-0.5">הוראת שעה | 28.2.26 — 14.4.26</p>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-3xl mx-auto px-4 pb-12">
        {/* Intro card */}
        <div className="bg-white border border-black/10 rounded-lg shadow-[0_2px_8px_rgba(6,77,173,0.08)] mt-4 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[#0c3058] mb-2">שאלות ותשובות — תיקוני חקיקה</h2>
          <p className="text-sm text-[#266794] mb-4 leading-relaxed">
            מדריך מקצועי לטיפול בתביעות דמי אבטלה בהתאם להוראת השעה. כל סעיף כולל הסבר, הנחיות מערכת ודוגמאות יישום.
          </p>
          <div className="flex gap-3">
            <button onClick={expandAll} type="button" className="text-sm text-[#0368b0] font-semibold underline cursor-pointer hover:text-[#025a8f]">פתח הכל</button>
            <button onClick={collapseAll} type="button" className="text-sm text-[#266794] underline cursor-pointer hover:text-[#0c3058]">סגור הכל</button>
          </div>
        </div>

        {/* Sections */}
        {S.map((sec, si) => (
          <section key={si} className="mt-6" aria-labelledby={`s${si}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-white bg-[#0368b0] px-2.5 py-1 rounded">סעיף {sec.ref}</span>
              <h2 id={`s${si}`} className="text-base font-bold text-[#0c3058]">{sec.title}</h2>
            </div>
            <div className="space-y-2">
              {sec.items.map((item, qi) => (
                <QACard key={qi} item={item} open={openItems.has(`${si}-${qi}`)} toggle={() => toggle(`${si}-${qi}`)} />
              ))}
            </div>
          </section>
        ))}

        {/* Handling section */}
        <section className="mt-8" aria-labelledby="hh">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-white bg-[#266794] px-2.5 py-1 rounded">נהלים</span>
            <h2 id="hh" className="text-base font-bold text-[#0c3058]">הנחיות לטיפול בתביעות</h2>
          </div>
          <div className="space-y-2">
            {H.map((item, i) => (
              <QACard key={i} item={item} open={openItems.has(`h-${i}`)} toggle={() => toggle(`h-${i}`)} />
            ))}
          </div>
        </section>

        {/* Quick reference */}
        <div className="bg-white border border-black/10 rounded-lg mt-8 p-5">
          <h3 className="text-sm font-bold text-[#0c3058] mb-3">טבלת סיכום מהיר</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse" aria-label="סיכום הקלות">
              <thead>
                <tr className="bg-[#0c3058] text-white">
                  <th className="p-2.5 text-right font-semibold border border-[#0c3058]">נושא</th>
                  <th className="p-2.5 text-right font-semibold border border-[#0c3058]">רגיל</th>
                  <th className="p-2.5 text-right font-semibold border border-[#0c3058]">הוראת שעה</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black/10"><td className="p-2.5 font-medium">תקופת חל&quot;ת</td><td className="p-2.5">30 יום</td><td className="p-2.5 font-semibold text-[#0368b0]">10 ימים</td></tr>
                <tr className="border-b border-black/10 bg-[#f5f9ff]"><td className="p-2.5 font-medium">אכשרה</td><td className="p-2.5">12 חודשים</td><td className="p-2.5 font-semibold text-[#0368b0]">6 חודשים</td></tr>
                <tr className="border-b border-black/10"><td className="p-2.5 font-medium">אכשרה מיוחדת</td><td className="p-2.5">—</td><td className="p-2.5 font-semibold text-[#0368b0]">3 חודשים</td></tr>
                <tr className="border-b border-black/10 bg-[#f5f9ff]"><td className="p-2.5 font-medium">ימי אמתנה</td><td className="p-2.5">5 ימים</td><td className="p-2.5 font-semibold text-[#0368b0]">בוטלו</td></tr>
                <tr className="border-b border-black/10"><td className="p-2.5 font-medium">שלילת חופשה</td><td className="p-2.5">כן</td><td className="p-2.5 font-semibold text-[#0368b0]">בוטלה</td></tr>
                <tr className="border-b border-black/10 bg-[#f5f9ff]"><td className="p-2.5 font-medium">הכנסה עצמאית</td><td className="p-2.5">שומה שנתית</td><td className="p-2.5 font-semibold text-[#0368b0]">אישור רו&quot;ח חודשי</td></tr>
                <tr><td className="p-2.5 font-medium">מובטל חוזר</td><td className="p-2.5">מוגבל</td><td className="p-2.5 font-semibold text-[#0368b0]">הארכה עד 14.4.26</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer role="contentinfo" className="border-t border-black/10 bg-white mt-8 py-4 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-1">
          <p className="text-xs text-[#266794]">המוסד לביטוח לאומי | כלי סיוע לפקיד תביעות</p>
          <p className="text-xs text-[#266794]">מבוסס על חוזר תיקוני חקיקה — הוראת שעה 28.2.26-14.4.26</p>
        </div>
      </footer>

      <button onClick={() => setFbOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-white text-sm font-medium hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        style={{ backgroundColor: "#1B3A5C" }} aria-label="משוב פיילוט">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
        <span className="hidden sm:inline">משוב פיילוט</span>
      </button>
      <FeedbackModal open={fbOpen} onClose={() => setFbOpen(false)} />
    </div>
  );
}
