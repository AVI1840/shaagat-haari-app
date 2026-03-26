"use client";
import { useState } from "react";
import { useChalatStore } from "@/store/chalat-store";
import { Section, Btn, Field, Input, Check } from "../ui";

export function DatesStep() {
  const { input, setFields, next } = useChalatStore();
  const [start, setStart] = useState(input.chalat_start || "");
  const [end, setEnd] = useState(input.chalat_end || "");
  const [ongoing, setOngoing] = useState(false);
  const [month, setMonth] = useState<"3.26" | "4.26">(input.claim_month || "3.26");

  const go = () => {
    if (!start) return;
    setFields({
      chalat_start: start,
      chalat_end: ongoing ? null : end || null,
      claim_month: month,
    });
    next();
  };

  return (
    <Section question='מתי החלה תקופת החל"ת?' hint='יש להזין את תאריך תחילת החל"ת. בהתאם להוראת השעה, נדרשים 10 ימים קלנדריים לפחות (במקום 30).'>
      <Field label='תאריך תחילת חל"ת' id="cs">
        <Input id="cs" type="date" value={start} onChange={(e) => setStart(e.target.value)} aria-required="true" />
      </Field>
      <Check id="ongoing" label='עדיין בחל"ת (טרם חזרתי לעבודה)' checked={ongoing} onChange={setOngoing} />
      {!ongoing && (
        <Field label="תאריך חזרה לעבודה" id="ce">
          <Input id="ce" type="date" value={end} onChange={(e) => setEnd(e.target.value)} min={start} />
        </Field>
      )}
      <Field label="חודש התאריך הקובע" id="cm" hint="החודש שבו הוגשה או תוגש התביעה">
        <div className="flex gap-3">
          <button type="button" onClick={() => setMonth("3.26")}
            className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold min-h-[44px] cursor-pointer transition-colors ${month === "3.26" ? "border-[#0368b0] bg-[#e8f3ff] text-[#0c3058]" : "border-black/10 bg-white text-[#0c3058] hover:border-[#0368b0]"}`}
            aria-pressed={month === "3.26"}>מרץ 2026</button>
          <button type="button" onClick={() => setMonth("4.26")}
            className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold min-h-[44px] cursor-pointer transition-colors ${month === "4.26" ? "border-[#0368b0] bg-[#e8f3ff] text-[#0c3058]" : "border-black/10 bg-white text-[#0c3058] hover:border-[#0368b0]"}`}
            aria-pressed={month === "4.26"}>אפריל 2026</button>
        </div>
      </Field>
      <Btn onClick={go} disabled={!start} />
    </Section>
  );
}
