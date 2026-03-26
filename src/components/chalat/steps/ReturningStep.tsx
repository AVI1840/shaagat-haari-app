"use client";
import { useState } from "react";
import { useChalatStore } from "@/store/chalat-store";
import { Section, Choice, Btn, Check } from "../ui";

export function ReturningStep() {
  const { input, setFields, next } = useChalatStore();
  const [ret, setRet] = useState(input.is_returning_unemployed || false);
  const [exh, setExh] = useState(input.exhausted_180_percent || false);
  const [klav, setKlav] = useState(input.had_im_klavia || false);

  const go = () => {
    setFields({
      is_returning_unemployed: ret,
      exhausted_180_percent: ret ? exh : false,
      had_im_klavia: ret ? klav : false,
    });
    next();
  };

  return (
    <Section
      question="האם קיבלת דמי אבטלה ב-4 השנים האחרונות?"
      hint="מובטל חוזר שניצל את מלוא 180% מימי הזכאות יכול לקבל הארכת תשלום עד 14.4.26."
    >
      <Choice label="כן, קיבלתי דמי אבטלה ב-4 השנים האחרונות" selected={ret} onClick={() => setRet(true)} />
      <Choice label="לא" selected={!ret} onClick={() => setRet(false)} />

      {ret && (
        <div className="border border-black/10 bg-[#f5f6f8] p-4 rounded-lg mt-2 space-y-2">
          <Check id="exh180" label="ניצלתי את מלוא 180% מימי הזכאות" checked={exh} onChange={setExh} />
          <Check id="klav" label='הוצאתי לחל"ת גם במבצע "עם כלביא" (13.6.25-24.6.25)' checked={klav} onChange={setKlav} />
        </div>
      )}
      <Btn onClick={go} />
    </Section>
  );
}
