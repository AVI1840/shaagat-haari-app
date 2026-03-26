/**
 * Chalat Eligibility Engine - "שאגת הארי"
 * Based on: חוזר תיקוני חקיקה ונהלים
 * Period: 28.2.26 - 14.4.26
 * Deterministic — zero AI reasoning
 */

export interface ChalatInput {
  chalat_start: string;
  chalat_end: string | null;
  chalat_reason: "employer" | "self" | "fired";
  akshara_months: number;
  akshara_includes_military: number;
  is_disability_ni: boolean;
  is_disability_tax_exempt: boolean;
  is_evacuee: boolean;
  is_spouse_reserve_120: boolean;
  is_spouse_wounded: boolean;
  is_discharged_soldier: boolean;
  has_independent_income: boolean;
  independent_monthly_income: number | null;
  has_bl_1510: boolean;
  remaining_vacation_days: number;
  tofes_100_received: boolean;
  employer_confirmation: boolean;
  claim_month: "3.26" | "4.26";
  has_active_claim: boolean;
  exhausted_all_days: boolean;
  had_im_klavia: boolean;
  is_new_claim: boolean;
  is_under40_returning: boolean;
  filed_new_claim: boolean;
}

export interface ReliefItem { id: string; title: string; desc: string; ref: string; }
export interface DocNeeded { id: string; label: string; status: "required" | "received" | "not_needed"; how: string; }
export interface Step { n: number; action: string; detail: string; link?: string; }
export interface ClerkNote { type: "instruction" | "warning" | "system"; text: string; }

export interface ChalatResult {
  eligible: boolean;
  status: "approved" | "denied" | "pending_review" | "pending_docs" | "continue_existing";
  headline: string;
  explanation: string;
  reliefs: ReliefItem[];
  docs: DocNeeded[];
  steps: Step[];
  clerk_notes: ClerkNote[];
  warnings: string[];
  calc: {
    akshara_threshold: number; akshara_actual: number;
    chalat_days: number; chalat_min: number;
    waiting_days_waived: boolean; vacation_waived: boolean;
    independent_method: string | null; returning_extension: boolean;
  };
}

const OP_START = "2026-02-28";
const OP_END = "2026-04-14";

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
function inPeriod(d: string): boolean { return d >= OP_START && d <= OP_END; }
function isSpecialPop(i: ChalatInput): boolean {
  return i.is_disability_ni || i.is_disability_tax_exempt || i.is_evacuee ||
    i.is_spouse_reserve_120 || i.is_spouse_wounded || i.is_discharged_soldier;
}

export function evaluateChalat(input: ChalatInput): ChalatResult {
  const reliefs: ReliefItem[] = [];
  const docs: DocNeeded[] = [];
  const steps: Step[] = [];
  const clerk_notes: ClerkNote[] = [];
  const warnings: string[] = [];

  const endDate = input.chalat_end || "2026-04-14";
  const chalatDays = daysBetween(input.chalat_start, endDate);
  const startInPeriod = inPeriod(input.chalat_start);

  // === ACTIVE CLAIM: approved in last year → continue existing ===
  if (input.has_active_claim) {
    return {
      eligible: true, status: "continue_existing",
      headline: "הנך זכאי/ת להמשיך לקבל דמי אבטלה במסגרת התביעה הקיימת",
      explanation: "אושרה לך תביעת אבטלה בשנה האחרונה. ניתן להמשיך לקבל דמי אבטלה.",
      reliefs: [{
        id: "R8_CONTINUE", title: "המשך תשלום למובטל עם תביעה בתוקף",
        desc: "מובטל עם תביעה פעילה ממשיך לקבל דמי אבטלה.",
        ref: "סעיף 7 בחוזר"
      }],
      docs: [], clerk_notes: [], warnings: [],
      steps: [
        { n: 1, action: "ודא/י שהנך רשום/ה בשירות התעסוקה", detail: "חובה להמשיך להתייצב.", link: "https://www.taasuka.gov.il" },
        { n: 2, action: "ודא/י שהמעסיק הגיש טופס 100", detail: "נדרש לעדכון תקופת החל\"ת." },
      ],
      calc: { akshara_threshold: 0, akshara_actual: input.akshara_months, chalat_days: chalatDays, chalat_min: 0, waiting_days_waived: true, vacation_waived: true, independent_method: null, returning_extension: false }
    };
  }

  // === UNDER 40 RETURNING: filed new claim ===
  if (input.is_under40_returning && input.filed_new_claim) {
    return {
      eligible: true, status: "approved",
      headline: "אנו ממליצים להגיש תביעה חדשה",
      explanation: "הנך זכאי/ת לדמי אבטלה לפחות עד 14.4.26, ולאחריה בהתאם לניצול ימי הזכאות.",
      reliefs: [{
        id: "R7_RETURNING", title: "הארכת תשלום למובטל חוזר בתביעה חדשה (עד גיל 40)",
        desc: "בהתאם להוראת השעה, תקבל/י דמי אבטלה לפחות עד 14.4.26.",
        ref: "סעיף 7 בחוזר"
      }],
      docs: [],
      steps: [
        { n: 1, action: "הירשם/י בשירות התעסוקה", detail: "חובה להירשם.", link: "https://www.taasuka.gov.il" },
        { n: 2, action: "בקש/י מהמעסיק להגיש טופס 100", detail: "נדרש לתביעה החדשה." },
        { n: 3, action: "הגש/י תביעה חדשה לדמי אבטלה", detail: "באתר ביטוח לאומי, בסניף, או בטלפון *6050.", link: "https://www.btl.gov.il" },
      ],
      clerk_notes: [
        { type: "instruction", text: "אם נותרו ימי חוק עד 180% — תשלום מוגבל ב-85% מדמי אבטלה מרביים. לאחר ניצול 180% — מוגבל בדמי אבטלה מרביים." },
      ],
      warnings: [],
      calc: { akshara_threshold: 0, akshara_actual: input.akshara_months, chalat_days: chalatDays, chalat_min: 0, waiting_days_waived: true, vacation_waived: true, independent_method: null, returning_extension: true }
    };
  }

  // === STANDARD FLOW: New claim ===

  // RULE 1: Chalat minimum duration
  const chalatMin = startInPeriod ? 10 : 30;
  if (chalatDays < chalatMin) {
    return makeDenied(input, chalatDays, chalatMin,
      `תקופת החל"ת (${chalatDays} ימים) קצרה מהמינימום הנדרש (${chalatMin} ימים קלנדריים).`,
      startInPeriod
        ? 'בהתאם להוראת השעה, נדרשים לפחות 10 ימי חל"ת קלנדריים בתקופה 28.2.26-14.4.26.'
        : 'מחוץ לתקופת הוראת השעה, נדרשים 30 ימי חל"ת לפחות.'
    );
  }

  if (startInPeriod && chalatMin === 10) {
    reliefs.push({ id: "R1_SHORT_CHALAT", title: 'קיצור תקופת חל"ת ל-10 ימים', desc: 'במקום 30 יום, נדרשים 10 ימים קלנדריים בלבד.', ref: "סעיף 1 בחוזר" });
  }

  // RULE 2: Self-initiated
  if (input.chalat_reason === "self" && !startInPeriod) {
    return makeDenied(input, chalatDays, chalatMin,
      'יציאה לחל"ת ביוזמת העובד מחוץ לתקופה הקובעת אינה מזכה בדמי אבטלה.',
      'רק בתקופה 28.2.26-14.4.26 גם יציאה ביוזמת העובד מזכה.'
    );
  }
  if (input.chalat_reason === "self" && startInPeriod) {
    reliefs.push({ id: "R_SELF", title: 'חל"ת ביוזמת העובד', desc: 'בתקופת הוראת השעה, גם מי שיצא לחל"ת מיוזמתו זכאי.', ref: "סעיף 1 בחוזר" });
  }

  // RULE 3: Akshara
  const special = isSpecialPop(input);
  let aksharaThreshold: number;
  if (special) { aksharaThreshold = 3; }
  else if (startInPeriod) { aksharaThreshold = 6; }
  else { aksharaThreshold = 12; }

  if (input.akshara_months < aksharaThreshold) {
    return makeDenied(input, chalatDays, chalatMin,
      `תקופת האכשרה (${input.akshara_months} חודשים) אינה מספיקה. נדרשים ${aksharaThreshold} חודשים לפחות.`,
      special ? 'כאוכלוסייה מיוחדת, הסף הוא 3 חודשים מתוך 18.' :
      startInPeriod ? 'בתקופת הוראת השעה, הסף הוא 6 חודשים מתוך 18.' :
      'מחוץ לתקופת הוראת השעה, נדרשים 12 חודשים מתוך 18.'
    );
  }

  if (aksharaThreshold === 6) {
    reliefs.push({ id: "R2_AK6", title: "קיצור תקופת אכשרה ל-6 חודשים", desc: "במקום 12 חודשים, נדרשים 6 חודשי אכשרה בלבד.", ref: "סעיף 2 בחוזר" });
  }
  if (aksharaThreshold === 3) {
    reliefs.push({ id: "R3_AK3", title: "קיצור תקופת אכשרה ל-3 חודשים", desc: "כאוכלוסייה מיוחדת, נדרשים 3 חודשי אכשרה בלבד.", ref: "סעיף 3 בחוזר" });
    if (input.is_evacuee) docs.push({ id: "D_EVAC", label: "אישור מהרשות המקומית על פינוי", status: "required", how: "פנה/י לרשות המקומית שבתחומה הבית ממנו התפנית." });
    if (input.is_spouse_reserve_120) docs.push({ id: "D_SP120", label: "אישור ממשרד הביטחון על 120+ ימי מילואים", status: "required", how: "פנה/י למשרד הביטחון." });
    if (input.is_spouse_wounded) docs.push({ id: "D_SPW", label: "אישור ממשרד הביטחון או נתוני ביטוח לאומי", status: "required", how: "אישור ממשרד הביטחון." });
    if (input.is_disability_tax_exempt) docs.push({ id: "D_TAX", label: "אישור פטור ממס מטעמים רפואיים", status: "required", how: "אישור ממס הכנסה." });
    clerk_notes.push({ type: "system", text: "המערכת לא ערוכה לתיקון חוק זה. יש להזין תקופת עבודה נוספת עד 6 חודשים במסך 162 תחת תיק ניכויים 03. יש להזין את השכר של 3 החודשים גם בתיק 03." });
    clerk_notes.push({ type: "warning", text: "בשלב ראשון התביעה תידחה. רק אם המבוטח יפנה וימציא אישורים מתאימים, התביעה תאושר." });
  }

  // RULE 4: Waiting days — always waived for new claims in period
  const waitingWaived = input.claim_month === "3.26" || input.claim_month === "4.26";
  if (waitingWaived) {
    reliefs.push({ id: "R4_WAIT", title: "ביטול ימי אמתנה", desc: "לא ינוכו 5 ימי אמתנה בחודש הראשון.", ref: "סעיף 4 בחוזר" });
    clerk_notes.push({ type: "instruction", text: "ימי אמתנה ינוכו רק לאחר 4 חודשי התייצבות רציפה. למובטלים פעילים שמקבלים תשלום המשך — ניכוי רגיל." });
  }

  // RULE 5: Vacation — always waived in period (no question needed)
  if (startInPeriod) {
    reliefs.push({ id: "R5_VAC", title: "ביטול שלילה בגין ימי חופשה", desc: "לא תבוצע שלילת זכאות בגין יתרת ימי חופשה.", ref: "סעיף 5 בחוזר" });
  }

  // RULE 6: Independent income
  let independentMethod: string | null = null;
  if (input.has_independent_income) {
    if (input.has_bl_1510 && input.independent_monthly_income !== null) {
      independentMethod = "cpa_monthly";
      reliefs.push({ id: "R6_CPA", title: 'חישוב הכנסה עצמאית לפי אישור רו"ח', desc: `הכנסה חודשית מוצהרת: ${input.independent_monthly_income} ש"ח. תנוכה מדמי האבטלה.`, ref: "סעיף 6 בחוזר" });
      docs.push({ id: "D_1510", label: 'טופס בל/1510 עם אישור רו"ח', status: "received", how: 'אישור מרואה חשבון או יועץ מס.' });
    } else {
      independentMethod = "annual_assessment";
      clerk_notes.push({ type: "instruction", text: "לא הומצא טופס בל/1510. הקיזוז יבוצע לפי המידע במערכת (מקדמות/שומה), בנוהל הרגיל." });
      docs.push({ id: "D_1510", label: 'טופס בל/1510 עם אישור רו"ח', status: "required", how: 'יש לצרף אישור רו"ח או יועץ מס להכנסה בחודשים 3.26 ו-4.26.' });
    }
    clerk_notes.push({ type: "instruction", text: "אין אפשרות לקיזוז חודש חלקי. בחודש 4.26 יקוזז הסכום לכל החודש. לאחר 4.26 — חזרה לקיזוז לפי מקדמות/שומה." });
  }

  // Tofes 100
  if (input.tofes_100_received) {
    docs.push({ id: "D_T100", label: "טופס 100 מהמעסיק", status: "received", how: "התקבל מהמעסיק." });
    clerk_notes.push({ type: "instruction", text: "טופס 100 התקבל. אין לדרוש אישור מעסיק בכתב נוסף." });
  } else if (input.employer_confirmation) {
    docs.push({ id: "D_T100", label: "טופס 100 מהמעסיק", status: "required", how: "טרם התקבל. קיים אישור מעסיק בכתב." });
    clerk_notes.push({ type: "instruction", text: 'טופס 100 לא התקבל אך יש אישור מעסיק בכתב. יש להזין תאריכים מהאישור במסך 162. שימו לב: יש להזין יום עבודה אחרון בפועל טרם ההוצאה לחל"ת ותאריך עבודה ראשון.' });
    clerk_notes.push({ type: "warning", text: "אם יש שוני בין דיווח טופס 100 לדיווח ידני — יש להזין במסך 162 תאריכים לפי הדיווח האחרון שהגיע." });
  } else {
    docs.push({ id: "D_T100", label: "טופס 100 מהמעסיק", status: "required", how: "יש לבקש מהמעסיק להגיש טופס 100 לביטוח לאומי." });
  }

  // Akshara partial month note
  if (aksharaThreshold === 6 && input.akshara_months === 6) {
    clerk_notes.push({ type: "instruction", text: 'אם החודש השישי הוא חודש חלקי, יש להזין למערכת "כב" (כן לבסיס). אחרת השכר של 5 החודשים האחרים יחולק ב-150.' });
  }

  // Build steps
  let sn = 1;
  steps.push({ n: sn++, action: "הירשם/י בשירות התעסוקה", detail: "חובה להירשם לפני הגשת תביעה.", link: "https://www.taasuka.gov.il" });
  if (!input.tofes_100_received && !input.employer_confirmation) {
    steps.push({ n: sn++, action: "בקש/י מהמעסיק להגיש טופס 100", detail: "ללא טופס 100 לא ניתן לעבד את התביעה." });
  }
  if (input.has_independent_income && !input.has_bl_1510) {
    steps.push({ n: sn++, action: 'הכן/י טופס בל/1510 עם אישור רו"ח', detail: "נדרש לחישוב ניכוי הכנסה עצמאית." });
  }
  const missingDocs = docs.filter(d => d.status === "required");
  if (missingDocs.length > 0) {
    steps.push({ n: sn++, action: "אסוף/י את המסמכים הנדרשים", detail: `חסרים ${missingDocs.length} מסמכים.` });
  }
  steps.push({ n: sn++, action: "הגש/י תביעה לדמי אבטלה", detail: "באתר ביטוח לאומי, בסניף, או בטלפון *6050.", link: "https://www.btl.gov.il" });

  // Result
  const hasMissing = missingDocs.length > 0;
  const status = hasMissing ? "pending_docs" as const : "approved" as const;
  const headline = status === "approved"
    ? "נמצא כי ייתכן שהנך זכאי/ת לדמי אבטלה"
    : "נמצאה זכאות אפשרית. נדרשים מסמכים נוספים.";

  const exp: string[] = [];
  exp.push(`תקופת חל"ת: ${chalatDays} ימים (מינימום נדרש: ${chalatMin}).`);
  exp.push(`תקופת אכשרה: ${input.akshara_months} חודשים (מינימום נדרש: ${aksharaThreshold}).`);
  if (waitingWaived) exp.push("ימי אמתנה: לא ינוכו.");
  exp.push("ימי חופשה: לא תבוצע שלילה.");
  if (independentMethod === "cpa_monthly") exp.push(`הכנסה עצמאית: תנוכה לפי אישור רו"ח (${input.independent_monthly_income} ש"ח/חודש).`);

  return {
    eligible: true, status, headline, explanation: exp.join("\n"),
    reliefs, docs, steps, clerk_notes, warnings,
    calc: {
      akshara_threshold: aksharaThreshold, akshara_actual: input.akshara_months,
      chalat_days: chalatDays, chalat_min: chalatMin,
      waiting_days_waived: waitingWaived, vacation_waived: startInPeriod,
      independent_method: independentMethod, returning_extension: false,
    }
  };
}

function makeDenied(input: ChalatInput, days: number, min: number, headline: string, explanation: string): ChalatResult {
  return {
    eligible: false, status: "denied", headline, explanation,
    reliefs: [], docs: [], clerk_notes: [], warnings: [],
    steps: [{ n: 1, action: "פנה/י לסניף ביטוח לאומי לבירור", detail: "ניתן גם להתקשר ל-*6050.", link: "https://www.btl.gov.il" }],
    calc: { akshara_threshold: 12, akshara_actual: input.akshara_months, chalat_days: days, chalat_min: min, waiting_days_waived: false, vacation_waived: false, independent_method: null, returning_extension: false }
  };
}
