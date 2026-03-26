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
  is_returning_unemployed: boolean;
  exhausted_180_percent: boolean;
  had_im_klavia: boolean;
  has_independent_income: boolean;
  independent_monthly_income: number | null;
  has_bl_1503: boolean;
  remaining_vacation_days: number;
  tofes_100_received: boolean;
  employer_confirmation: boolean;
  claim_month: "3.26" | "4.26";
}

export interface ReliefItem {
  id: string;
  title: string;
  desc: string;
  ref: string;
}

export interface DocNeeded {
  id: string;
  label: string;
  status: "required" | "received" | "not_needed";
  how: string;
}

export interface Step {
  n: number;
  action: string;
  detail: string;
  link?: string;
}

export interface ClerkNote {
  type: "instruction" | "warning" | "system";
  text: string;
}

export interface ChalatResult {
  eligible: boolean;
  status: "approved" | "denied" | "pending_review" | "pending_docs";
  headline: string;
  explanation: string;
  reliefs: ReliefItem[];
  docs: DocNeeded[];
  steps: Step[];
  clerk_notes: ClerkNote[];
  warnings: string[];
  calc: {
    akshara_threshold: number;
    akshara_actual: number;
    chalat_days: number;
    chalat_min: number;
    waiting_days_waived: boolean;
    vacation_waived: boolean;
    independent_method: string | null;
    returning_extension: boolean;
  };
}

const OP_START = "2026-02-28";
const OP_END = "2026-04-14";

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function inPeriod(d: string): boolean {
  return d >= OP_START && d <= OP_END;
}

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

  // === RULE 1: Chalat minimum duration ===
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
    reliefs.push({
      id: "R1_SHORT_CHALAT",
      title: 'קיצור תקופת חל"ת ל-10 ימים',
      desc: 'במקום 30 יום, נדרשים 10 ימים קלנדריים בלבד בתקופה הקובעת.',
      ref: "סעיף 1 בחוזר"
    });
  }

  // === RULE 2: Self-initiated chalat ===
  if (input.chalat_reason === "self" && !startInPeriod) {
    return makeDenied(input, chalatDays, chalatMin,
      'יציאה לחל"ת ביוזמת העובד מחוץ לתקופה הקובעת אינה מזכה בדמי אבטלה.',
      'רק בתקופה 28.2.26-14.4.26 גם יציאה ביוזמת העובד מזכה.'
    );
  }

  if (input.chalat_reason === "self" && startInPeriod) {
    reliefs.push({
      id: "R_SELF_INIT",
      title: 'חל"ת ביוזמת העובד',
      desc: 'בתקופת הוראת השעה, גם מי שיצא לחל"ת מיוזמתו זכאי לדמי אבטלה.',
      ref: "סעיף 1 בחוזר"
    });
  }

  // === RULE 3: Akshara threshold ===
  const special = isSpecialPop(input);
  let aksharaThreshold: number;
  if (special) {
    aksharaThreshold = 3;
  } else if (startInPeriod) {
    aksharaThreshold = 6;
  } else {
    aksharaThreshold = 12;
  }

  let effectiveAkshara = input.akshara_months;
  if (special && input.akshara_includes_military > 0) {
    effectiveAkshara = Math.min(effectiveAkshara, input.akshara_months);
    if (input.akshara_includes_military > 3) {
      warnings.push("ניתן לכלול עד 3 חודשי שירות סדיר בלבד בתקופת האכשרה המקוצרת.");
    }
  }

  if (effectiveAkshara < aksharaThreshold) {
    return makeDenied(input, chalatDays, chalatMin,
      `תקופת האכשרה (${effectiveAkshara} חודשים) אינה מספיקה. נדרשים ${aksharaThreshold} חודשים לפחות.`,
      special
        ? 'כאוכלוסייה מיוחדת, הסף המופחת הוא 3 חודשים מתוך 18.'
        : startInPeriod
          ? 'בתקופת הוראת השעה, הסף המופחת הוא 6 חודשים מתוך 18.'
          : 'מחוץ לתקופת הוראת השעה, נדרשים 12 חודשים מתוך 18.'
    );
  }

  if (aksharaThreshold === 6) {
    reliefs.push({
      id: "R2_AKSHARA_6",
      title: "קיצור תקופת אכשרה ל-6 חודשים",
      desc: "במקום 12 חודשים, נדרשים 6 חודשי אכשרה בלבד מתוך 18 חודשים.",
      ref: "סעיף 2 בחוזר"
    });
  }
  if (aksharaThreshold === 3) {
    reliefs.push({
      id: "R3_AKSHARA_3",
      title: "קיצור תקופת אכשרה ל-3 חודשים",
      desc: "כאוכלוסייה מיוחדת, נדרשים 3 חודשי אכשרה בלבד מתוך 18 חודשים.",
      ref: "סעיף 3 בחוזר"
    });

    // Special pop documents
    if (input.is_evacuee) {
      docs.push({ id: "D_EVACUEE", label: "אישור מהרשות המקומית על פינוי", status: "required", how: "יש לפנות לרשות המקומית שבתחומה הבית ממנו התפנית." });
    }
    if (input.is_spouse_reserve_120) {
      docs.push({ id: "D_SPOUSE_RESERVE", label: 'אישור ממשרד הביטחון על 120+ ימי מילואים', status: "required", how: "יש לפנות למשרד הביטחון." });
    }
    if (input.is_spouse_wounded) {
      docs.push({ id: "D_SPOUSE_WOUNDED", label: "אישור ממשרד הביטחון או נתוני ביטוח לאומי", status: "required", how: "אישור ממשרד הביטחון או בדיקה במערכות ביטוח לאומי." });
    }
    if (input.is_disability_tax_exempt) {
      docs.push({ id: "D_TAX_EXEMPT", label: "אישור פטור ממס מטעמים רפואיים", status: "required", how: "אישור ממס הכנסה." });
    }

    clerk_notes.push({
      type: "system",
      text: "המערכת לא ערוכה לתיקון חוק זה. יש להזין תקופת עבודה נוספת עד 6 חודשים במסך 162 תחת תיק ניכויים 03. יש להזין את השכר של 3 החודשים גם בתיק 03."
    });
    clerk_notes.push({
      type: "warning",
      text: "בשלב ראשון התביעה תידחה. רק אם המבוטח יפנה וימציא אישורים מתאימים, התביעה תאושר."
    });
  }

  // === RULE 4: Waiting days waiver ===
  const waitingWaived = input.claim_month === "3.26" || input.claim_month === "4.26";
  if (waitingWaived) {
    reliefs.push({
      id: "R4_NO_WAITING",
      title: "ביטול ימי אמתנה",
      desc: "לא ינוכו 5 ימי אמתנה בחודש הראשון לתביעות עם תאריך קובע 3.26 או 4.26.",
      ref: "סעיף 4 בחוזר"
    });
    clerk_notes.push({
      type: "instruction",
      text: "ימי אמתנה ינוכו רק לאחר 4 חודשי התייצבות רציפה. למובטלים פעילים שמקבלים תשלום המשך — ניכוי רגיל."
    });
  }

  // === RULE 5: Vacation days waiver ===
  const vacationWaived = startInPeriod;
  if (vacationWaived && input.remaining_vacation_days > 0) {
    reliefs.push({
      id: "R5_NO_VACATION_DEDUCTION",
      title: "ביטול שלילה בגין ימי חופשה",
      desc: `נותרו ${input.remaining_vacation_days} ימי חופשה. בהתאם להוראת השעה, לא תבוצע שלילה.`,
      ref: "סעיף 5 בחוזר"
    });
  }

  // === RULE 6: Independent income ===
  let independentMethod: string | null = null;
  if (input.has_independent_income) {
    if (input.has_bl_1503 && input.independent_monthly_income !== null) {
      independentMethod = "cpa_monthly";
      reliefs.push({
        id: "R6_INDEPENDENT_CPA",
        title: "חישוב הכנסה עצמאית לפי אישור רו\"ח",
        desc: `הכנסה חודשית מוצהרת: ${input.independent_monthly_income} ש"ח. תנוכה מדמי האבטלה.`,
        ref: "סעיף 6 בחוזר"
      });
      docs.push({ id: "D_BL1503", label: "טופס בל/1503 עם אישור רו\"ח", status: "received", how: "אישור מרואה חשבון או יועץ מס." });
    } else {
      independentMethod = "annual_assessment";
      clerk_notes.push({
        type: "instruction",
        text: "לא הומצא טופס בל/1503. הקיזוז יבוצע לפי המידע במערכת (מקדמות/שומה), בנוהל הרגיל."
      });
      docs.push({ id: "D_BL1503", label: "טופס בל/1503 עם אישור רו\"ח", status: "required", how: "יש לצרף אישור רו\"ח או יועץ מס להכנסה בחודשים 3.26 ו-4.26." });
    }
    clerk_notes.push({
      type: "instruction",
      text: "אין אפשרות לקיזוז חודש חלקי. בחודש 4.26 יקוזז הסכום לכל החודש. לאחר 4.26 — חזרה לקיזוז לפי מקדמות/שומה."
    });
  }

  // === RULE 7: Returning unemployed ===
  let returningExtension = false;
  if (input.is_returning_unemployed && input.exhausted_180_percent) {
    returningExtension = true;
    reliefs.push({
      id: "R7_RETURNING",
      title: "הארכת תקופת תשלום למובטל חוזר",
      desc: "ניצלת את מלוא 180% מימי הזכאות. בהתאם להוראת השעה, תקבל/י דמי אבטלה עד 14.4.26.",
      ref: "סעיף 7 בחוזר"
    });
    clerk_notes.push({
      type: "instruction",
      text: "אם נותרו ימי חוק עד 180% — תשלום מוגבל ב-85% מדמי אבטלה מרביים. לאחר ניצול 180% — תשלום מוגבל בדמי אבטלה מרביים."
    });

    if (input.had_im_klavia) {
      reliefs.push({
        id: "R7B_DOUBLE_OP",
        title: 'הארכה לבעלי שתי הפסקות עבודה (עם כלביא + שאגת הארי)',
        desc: "מי שפוטר/הוצא לחל\"ת גם במבצע עם כלביא (13.6.25-24.6.25) וגם בשאגת הארי — ימשיך לקבל דמי אבטלה עד תום התקופה הקובעת.",
        ref: "סעיף 7ב בחוזר"
      });
    }
  }

  // === Documents: Tofes 100 ===
  if (input.tofes_100_received) {
    docs.push({ id: "D_TOFES100", label: "טופס 100 מהמעסיק", status: "received", how: "התקבל מהמעסיק." });
    clerk_notes.push({
      type: "instruction",
      text: "טופס 100 התקבל. אין לדרוש אישור מעסיק בכתב נוסף. ניתן לאשר זכאות."
    });
  } else if (input.employer_confirmation) {
    docs.push({ id: "D_TOFES100", label: "טופס 100 מהמעסיק", status: "required", how: "טרם התקבל. קיים אישור מעסיק בכתב." });
    clerk_notes.push({
      type: "instruction",
      text: "טופס 100 לא התקבל אך יש אישור מעסיק בכתב. יש להזין תאריכים מהאישור במסך 162. שימו לב: יש להזין יום עבודה אחרון בפועל טרם ההוצאה לחל\"ת ותאריך עבודה ראשון."
    });
    clerk_notes.push({
      type: "warning",
      text: "אם יש שוני בין דיווח טופס 100 לדיווח ידני — יש להזין במסך 162 תאריכים לפי הדיווח האחרון שהגיע."
    });
  } else {
    docs.push({ id: "D_TOFES100", label: "טופס 100 מהמעסיק", status: "required", how: "יש לבקש מהמעסיק להגיש טופס 100 לביטוח לאומי." });
    return makePending(input, chalatDays, chalatMin, aksharaThreshold, effectiveAkshara,
      reliefs, docs, clerk_notes, warnings, waitingWaived, vacationWaived, independentMethod, returningExtension);
  }

  // === Akshara partial month ===
  if (aksharaThreshold === 6 && input.akshara_months === 6) {
    clerk_notes.push({
      type: "instruction",
      text: 'אם החודש השישי הוא חודש חלקי, יש להזין למערכת "כב" (כן לבסיס). אחרת השכר של 5 החודשים האחרים יחולק ב-150.'
    });
  }

  // === Build action steps (citizen) ===
  let sn = 1;
  steps.push({ n: sn++, action: "הירשם/י בשירות התעסוקה", detail: "חובה להירשם לפני הגשת תביעה.", link: "https://www.taasuka.gov.il" });
  if (!input.tofes_100_received && !input.employer_confirmation) {
    steps.push({ n: sn++, action: "בקש/י מהמעסיק להגיש טופס 100", detail: "ללא טופס 100 לא ניתן לעבד את התביעה." });
  }
  if (input.has_independent_income && !input.has_bl_1503) {
    steps.push({ n: sn++, action: 'הכן/י טופס בל/1503 עם אישור רו"ח', detail: "נדרש לחישוב ניכוי הכנסה עצמאית בחודשים 3.26-4.26." });
  }
  const missingDocs = docs.filter(d => d.status === "required");
  if (missingDocs.length > 0) {
    steps.push({ n: sn++, action: "אסוף/י את המסמכים הנדרשים", detail: `חסרים ${missingDocs.length} מסמכים.` });
  }
  steps.push({ n: sn++, action: "הגש/י תביעה לדמי אבטלה", detail: "באתר ביטוח לאומי, בסניף, או בטלפון *6050.", link: "https://www.btl.gov.il" });

  // === Build result ===
  const status = missingDocs.length > 0 ? "pending_docs" as const : "approved" as const;
  const headline = status === "approved"
    ? "נמצא כי ייתכן שהנך זכאי/ת לדמי אבטלה"
    : "נמצאה זכאות אפשרית. נדרשים מסמכים נוספים.";

  const explanationParts: string[] = [];
  explanationParts.push(`תקופת חל"ת: ${chalatDays} ימים (מינימום נדרש: ${chalatMin}).`);
  explanationParts.push(`תקופת אכשרה: ${effectiveAkshara} חודשים (מינימום נדרש: ${aksharaThreshold}).`);
  if (waitingWaived) explanationParts.push("ימי אמתנה: לא ינוכו.");
  if (vacationWaived) explanationParts.push("ימי חופשה: לא תבוצע שלילה.");
  if (independentMethod === "cpa_monthly") explanationParts.push(`הכנסה עצמאית: תנוכה לפי אישור רו"ח (${input.independent_monthly_income} ש"ח/חודש).`);
  if (returningExtension) explanationParts.push("מובטל חוזר: הארכת תשלום עד 14.4.26.");

  return {
    eligible: true,
    status,
    headline,
    explanation: explanationParts.join("\n"),
    reliefs, docs, steps, clerk_notes, warnings,
    calc: {
      akshara_threshold: aksharaThreshold,
      akshara_actual: effectiveAkshara,
      chalat_days: chalatDays,
      chalat_min: chalatMin,
      waiting_days_waived: waitingWaived,
      vacation_waived: vacationWaived,
      independent_method: independentMethod,
      returning_extension: returningExtension,
    }
  };
}

function makeDenied(input: ChalatInput, days: number, min: number, headline: string, explanation: string): ChalatResult {
  return {
    eligible: false, status: "denied", headline, explanation,
    reliefs: [], docs: [], clerk_notes: [], warnings: [],
    steps: [
      { n: 1, action: "פנה/י לסניף ביטוח לאומי לבירור", detail: "ניתן גם להתקשר ל-*6050.", link: "https://www.btl.gov.il" },
    ],
    calc: {
      akshara_threshold: 12, akshara_actual: input.akshara_months,
      chalat_days: days, chalat_min: min,
      waiting_days_waived: false, vacation_waived: false,
      independent_method: null, returning_extension: false,
    }
  };
}

function makePending(
  input: ChalatInput, days: number, min: number, threshold: number, akshara: number,
  reliefs: ReliefItem[], docs: DocNeeded[], clerk_notes: ClerkNote[], warnings: string[],
  waitW: boolean, vacW: boolean, indM: string | null, retE: boolean
): ChalatResult {
  return {
    eligible: true, status: "pending_docs",
    headline: "נמצאה זכאות אפשרית. ממתין לטופס 100 מהמעסיק.",
    explanation: `תקופת חל"ת: ${days} ימים. תקופת אכשרה: ${akshara} חודשים. טופס 100 טרם התקבל.`,
    reliefs, docs, clerk_notes, warnings,
    steps: [
      { n: 1, action: "בקש/י מהמעסיק להגיש טופס 100", detail: "ללא טופס 100 לא ניתן לעבד את התביעה." },
      { n: 2, action: "הירשם/י בשירות התעסוקה", detail: "חובה להירשם.", link: "https://www.taasuka.gov.il" },
      { n: 3, action: "הגש/י תביעה לאחר קבלת טופס 100", detail: "באתר ביטוח לאומי או בסניף.", link: "https://www.btl.gov.il" },
    ],
    calc: {
      akshara_threshold: threshold, akshara_actual: akshara,
      chalat_days: days, chalat_min: min,
      waiting_days_waived: waitW, vacation_waived: vacW,
      independent_method: indM, returning_extension: retE,
    }
  };
}
