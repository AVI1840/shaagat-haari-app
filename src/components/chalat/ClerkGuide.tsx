"use client";
import { useState } from "react";
import { FeedbackModal } from "./FeedbackModal";

interface QA {
  q: string;
  a: string;
  example?: { title: string; text: string };
  system_note?: string;
}

const SECTIONS: { id: string; title: string; ref: string; items: QA[] }[] = [
  {
    id: "s1", title: 'קיצור תקופת חל"ת ל-10 ימים', ref: "סעיף 1",
    items: [
      {
        q: 'מה תקופת החל"ת המינימלית לזכאות?',
        a: '10 ימים קלנדריים (במקום 30) למי שהוצא לחל"ת או יצא מיוזמתו בין 28.2.26 ל-14.4.26. מחוץ לתקופה זו — 30 יום.',
        example: {
          title: "דוגמה",
          text: 'עובד הוצא לחל"ת ב-5.3.26 וחזר ב-16.3.26 (11 ימים). זכאי — עומד בסף 10 ימים.'
        }
      },
      {
        q: 'האם מי שיצא לחל"ת מיוזמתו זכאי?',
        a: 'כן, בתקופה 28.2.26-14.4.26 גם יציאה ביוזמת העובד מזכה. מחוץ לתקופה — לא זכאי כלל.',
        example: {
          title: "דוגמה",
          text: 'עובדת יצאה לחל"ת מיוזמתה ב-1.3.26 ל-12 ימים. זכאית — בתקופה הקובעת + מעל 10 ימים.'
        }
      },
    ]
  },
  {
    id: "s2", title: "קיצור תקופת אכשרה ל-6 חודשים", ref: "סעיף 2",
    items: [
      {
        q: "מה תקופת האכשרה הנדרשת?",
        a: "6 חודשים מתוך 18 (במקום 12) למי שפוטר/הוצא לחל\"ת/יצא מיוזמתו בתקופה 28.2.26-14.4.26.",
      },
      {
        q: "מה קורה אם החודש השישי חלקי?",
        a: 'יש להזין למערכת "כב" (כן לבסיס). אחרת השכר של 5 החודשים האחרים יחולק ב-150.',
        system_note: 'במסך חישוב שכר — סמן "כב" עבור חודש חלקי.',
        example: {
          title: "דוגמה",
          text: "מבוטח עבד 5 חודשים מלאים + 15 ימים בחודש השישי. יש לסמן כב כדי שהשכר יחושב נכון."
        }
      },
    ]
  },
  {
    id: "s3", title: "אכשרה מופחתת ל-3 חודשים — אוכלוסיות מיוחדות", ref: "סעיף 3",
    items: [
      {
        q: "מי זכאי לסף של 3 חודשים בלבד?",
        a: "אנשים עם מוגבלות (נכות כללית / נכות מעבודה / פטור ממס רפואי), מפונים, בני זוג של משרתי 120+ ימי מילואים, בני זוג פצועים, חיילים משוחררים.",
      },
      {
        q: "איך מטפלים בזה במערכת?",
        a: "המערכת לא ערוכה לתיקון זה.",
        system_note: "יש להזין תקופת עבודה נוספת עד 6 חודשים במסך 162 תחת תיק ניכויים 03. יש להזין את השכר של 3 החודשים גם בתיק 03. בשלב ראשון התביעה תידחה — רק לאחר המצאת אישורים תאושר.",
        example: {
          title: "דוגמה",
          text: 'מפונה עם 4 חודשי אכשרה. יש להזין במסך 162 תיק 03 עוד 2 חודשים (עד 6). לצרף אישור רשות מקומית. התביעה תידחה ראשונית — לאשר לאחר קבלת אישור.'
        }
      },
      {
        q: "אילו מסמכים נדרשים?",
        a: "נכות כללית / נכות מעבודה — נתונים במערכות ביטוח לאומי. פטור ממס — אישור ממס הכנסה. מפונים — אישור מהרשות המקומית. בני זוג משרתי מילואים / פצועים — אישור ממשרד הביטחון. חיילים משוחררים — נתונים במערכות.",
      },
    ]
  },
  {
    id: "s4", title: "ביטול ימי אמתנה", ref: "סעיף 4",
    items: [
      {
        q: "מתי לא מנכים ימי אמתנה?",
        a: "בתביעות חדשות עם תאריך קובע 3.26 או 4.26. ימי אמתנה ינוכו רק לאחר 4 חודשי התייצבות רציפה.",
      },
      {
        q: "מה לגבי מובטלים פעילים שמקבלים תשלום המשך?",
        a: "למובטלים פעילים שמקבלים תשלום על חודש מרץ או אפריל כחודש המשך — ניכוי ימי אמתנה באופן רגיל. ההקלה תקפה רק לתביעה חדשה.",
        example: {
          title: "דוגמה",
          text: "מובטל הגיש תביעה חדשה עם תאריך קובע 3.26 — לא ינוכו ימי אמתנה. מובטל שמקבל תשלום המשך מתביעה קודמת — ניכוי רגיל."
        }
      },
    ]
  },
  {
    id: "s5", title: "ביטול שלילה בגין ימי חופשה", ref: "סעיף 5",
    items: [
      {
        q: "האם מבצעים שלילה בגין ימי חופשה?",
        a: 'לא. לתביעות חדשות בהן העובד הוצא לחל"ת או יצא ביוזמתו בתקופה 28.2.26-14.4.26 — אין לבצע שלילה בגין יתרת ימי חופשה.',
      },
    ]
  },
  {
    id: "s6", title: "חישוב הכנסה עצמאית", ref: "סעיף 6",
    items: [
      {
        q: "איך מחשבים הכנסה עצמאית בתקופה הקובעת?",
        a: 'ניתן לחשב לפי אישור רו"ח או יועץ מס לחודשים 3.26 ו-4.26 בלבד, במקום שומה שנתית. המבוטח צריך לצרף טופס בל/1510.',
      },
      {
        q: "מה אם לא הומצא טופס בל/1510?",
        a: "הקיזוז יבוצע לפי המידע במערכת (מקדמות / שומה סופית), בנוהל הרגיל.",
        example: {
          title: "דוגמה",
          text: 'מובטל עם הכנסה עצמאית של 3,000 ש"ח בחודש 3.26 לפי אישור רו"ח. ינוכו 3,000 ש"ח מדמי האבטלה. אין קיזוז חודש חלקי — בחודש 4.26 יקוזז הסכום לכל החודש.'
        }
      },
      {
        q: "מה קורה אחרי תום התקופה הקובעת?",
        a: "לאחר חודש 4.26, אם ימשיך להיות מובטל — קיזוז ההכנסה כעצמאי יחזור להתבסס על מקדמות / שומה סופית.",
      },
    ]
  },
  {
    id: "s7", title: "הארכת תשלום", ref: "סעיף 7",
    items: [
      {
        q: "מובטל חוזר (עד גיל 40) שניצל 180% — מה הדין?",
        a: "אם פוטר/הוצא לחל\"ת/יצא מיוזמתו בתקופה הקובעת והגיש תביעה חדשה — יקבל דמי אבטלה עד 14.4.26. אם נותרו ימי חוק עד 180% — תשלום מוגבל ב-85% מדמי אבטלה מרביים. לאחר ניצול 180% — מוגבל בדמי אבטלה מרביים.",
        example: {
          title: "דוגמה",
          text: 'מובטל בן 35, ניצל 180% מימי הזכאות, הוצא לחל"ת ב-3.3.26. מגיש תביעה חדשה — זכאי לדמי אבטלה עד 14.4.26, מוגבל בדמי אבטלה מרביים.'
        }
      },
      {
        q: "מובטל עם תביעה בתוקף שטרם ניצל את כל הימים?",
        a: "ממשיך לקבל דמי אבטלה. נדרש רק להירשם בשירות התעסוקה ושהמעסיק יגיש טופס 100.",
      },
      {
        q: 'מה לגבי מי שהיו לו שתי הפסקות — "עם כלביא" + "שאגת הארי"?',
        a: 'מי שפוטר/הוצא לחל"ת בין 13.6.25-24.6.25 (עם כלביא), ניצל את מלוא ימי הזכאות, ופוטר/הוצא לחל"ת שוב בתקופה 28.2.26-14.4.26 — ימשיך לקבל דמי אבטלה עד תום התקופה הקובעת.',
        example: {
          title: "דוגמה",
          text: 'עובד פוטר ב-15.6.25 (עם כלביא), ניצל את כל ימי הזכאות עד 1.2.26. הוצא לחל"ת שוב ב-3.3.26 (שאגת הארי). זכאי להמשך תשלום עד 14.4.26.'
        }
      },
    ]
  },
];

const HANDLING: { q: string; a: string }[] = [
  {
    q: "המעסיק דיווח תאריכי חל\"ת בטופס 100 — מה עושים?",
    a: "אין לדרוש אישור מעסיק בכתב. ניתן להסתמך על המידע המדווח ולאשר זכאות.",
  },
  {
    q: "המעסיק לא דיווח בטופס 100 אבל יש אישור חתום — מה עושים?",
    a: 'ניתן להזין תאריכים מהאישור המצורף לטופס תביעה. במסך 162 יש להזין יום עבודה אחרון בפועל טרם ההוצאה לחל"ת ותאריך עבודה ראשון.',
  },
  {
    q: "יש שוני בין דיווח טופס 100 לאישור ידני — מה עדיף?",
    a: "יש להזין במסך 162 תאריכים לפי הדיווח האחרון שהגיע.",
  },
  {
    q: 'העובד חזר לעבוד מספר ימים בתקופת החל"ת ולא התקבל טופס 100 — מה עושים?',
    a: "אם צורף אישור מעסיק בכתב, יש לעדכן תאריכי חזרה לעבודה במסך 139.",
  },
];

function QAItem({ item, open, toggle }: { item: QA; open: boolean; toggle: () => void }) {
  return (
    <div className="border border-black/10 rounded-lg overflow-hidden">
      <button onClick={toggle} type="button"
        className="w-full text-right p-4 flex items-start gap-3 hover:bg-[#f5f9ff] transition-colors cursor-pointer"
        aria-expanded={open}>
        <span className={`mt-1 shrink-0 text-[#0368b0] font-bold transition-transform ${open ? "rotate-90" : ""}`} aria-hidden="true">&#9654;</span>
        <span className="font-semibold text-[#0c3058] text-sm">{item.q}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pr-11 space-y-3">
          <p className="text-sm text-[#0c3058] leading-relaxed">{item.a}</p>
          {item.system_note && (
            <div className="bg-[#fef8ec] border border-[#f0d080] rounded-lg p-3">
              <p className="text-sm text-[#7a4f00]"><strong>הנחיית מערכת:</strong> {item.system_note}</p>
            </div>
          )}
          {item.example && (
            <div className="bg-[#e8f3ff] border border-[#0368b0]/20 rounded-lg p-3">
              <p className="text-xs font-bold text-[#0368b0] uppercase tracking-wide mb-1">{item.example.title}</p>
              <p className="text-sm text-[#0c3058]">{item.example.text}</p>
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

  const toggle = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<string>();
    SECTIONS.forEach((s, si) => s.items.forEach((_, qi) => all.add(`${si}-${qi}`)));
    HANDLING.forEach((_, i) => all.add(`h-${i}`));
    setOpenItems(all);
  };

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
            <div className="w-11 h-11 bg-white rounded flex items-center justify-center shrink-0" aria-hidden="true">
              <span className="text-[#0c3058] font-bold text-[11px] leading-tight text-center">ב&quot;ל</span>
            </div>
            <div>
              <h1 className="text-white text-base sm:text-lg font-bold leading-tight">כלי סיוע לפקיד — דמי אבטלה הוראת שעה</h1>
              <p className="text-[#8bb8e8] text-xs sm:text-sm mt-0.5">מבצע שאגת הארי | 28.2.26 — 14.4.26</p>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-3xl mx-auto px-4 pb-12">
        <div className="bg-white border border-black/10 rounded-lg shadow-[0_2px_8px_rgba(6,77,173,0.08)] mt-4 p-5 sm:p-6">
          <p className="text-sm text-[#0c3058] mb-3 leading-relaxed">
            מדריך שאלות ותשובות לטיפול בתביעות דמי אבטלה בהתאם לחוזר תיקוני החקיקה — הוראת שעה 28.2.26-14.4.26.
          </p>
          <button onClick={expandAll} type="button"
            className="text-sm text-[#0368b0] underline cursor-pointer hover:text-[#025a8f]">
            פתח את כל השאלות
          </button>
        </div>

        {SECTIONS.map((sec, si) => (
          <section key={sec.id} className="mt-6" aria-labelledby={`sec-${si}`}>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xs font-bold text-[#0368b0] bg-[#e8f3ff] px-2 py-1 rounded">{sec.ref}</span>
              <h2 id={`sec-${si}`} className="text-base font-bold text-[#0c3058]">{sec.title}</h2>
            </div>
            <div className="space-y-2">
              {sec.items.map((item, qi) => (
                <QAItem key={qi} item={item} open={openItems.has(`${si}-${qi}`)} toggle={() => toggle(`${si}-${qi}`)} />
              ))}
            </div>
          </section>
        ))}

        <section className="mt-8" aria-labelledby="handling-h">
          <h2 id="handling-h" className="text-base font-bold text-[#0c3058] mb-3 pb-2 border-b border-black/10">
            הנחיות לטיפול בתביעות
          </h2>
          <div className="space-y-2">
            {HANDLING.map((item, i) => (
              <QAItem key={i} item={item} open={openItems.has(`h-${i}`)} toggle={() => toggle(`h-${i}`)} />
            ))}
          </div>
        </section>
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
