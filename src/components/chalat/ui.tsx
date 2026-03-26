"use client";
import React from "react";

/* [BTL-ADAPTED] All components use BTL Design System colors and WCAG 2.1 AA */

const inputCls = "w-full border border-[#0368b0]/30 bg-white px-3 py-2.5 text-[15px] text-[#0c3058] min-h-[48px] rounded-lg focus:border-[#0068f5] focus:outline-none focus:ring-2 focus:ring-[#0068f5]/20";

export function Section({ question, hint, legend, children }: {
  question: string; hint?: string; legend?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-black/10 rounded-lg shadow-[0_2px_8px_rgba(6,77,173,0.08)] mt-4 p-6">
      <h2 className="text-xl font-semibold text-[#0c3058] mb-1 leading-snug">{question}</h2>
      {hint && (
        <p className="text-sm text-[#266794] mb-5 leading-relaxed border-r-4 border-[#0368b0] pr-3 bg-[#e8f3ff] py-2 mt-2 rounded-sm">
          {hint}
        </p>
      )}
      {legend ? (
        <fieldset className="border-0 p-0 m-0">
          <legend className="sr-only">{legend}</legend>
          <div className="space-y-2 mt-3">{children}</div>
        </fieldset>
      ) : (
        <div className="space-y-3 mt-3">{children}</div>
      )}
    </div>
  );
}

export function Choice({ label, desc, onClick, selected }: {
  label: string; desc?: string; onClick: () => void; selected?: boolean;
}) {
  return (
    <button onClick={onClick} type="button" aria-pressed={selected}
      className={[
        "w-full text-right p-4 border-2 rounded-lg transition-colors min-h-[52px] font-medium text-[15px] cursor-pointer",
        selected
          ? "border-[#0368b0] bg-[#e8f3ff] text-[#0c3058]"
          : "border-black/10 bg-white text-[#0c3058] hover:border-[#0368b0] hover:bg-[#f5f9ff]",
      ].join(" ")}>
      <span className="flex items-start gap-3">
        <span className={["mt-0.5 w-5 h-5 shrink-0 border-2 rounded-full flex items-center justify-center",
          selected ? "border-[#0368b0] bg-[#0368b0]" : "border-[#0368b0]/40 bg-white"
        ].join(" ")} aria-hidden="true">
          {selected && <span className="w-2 h-2 rounded-full bg-white block" />}
        </span>
        <span>
          <span className="block">{label}</span>
          {desc && <span className="block text-sm text-[#266794] font-normal mt-0.5">{desc}</span>}
        </span>
      </span>
    </button>
  );
}

export function Btn({ onClick, label = "המשך", disabled = false }: {
  onClick: () => void; label?: string; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} type="button" aria-disabled={disabled}
      className={[
        "w-full mt-4 py-3 px-6 text-base font-semibold text-center min-h-[48px] rounded-lg transition-colors",
        disabled
          ? "bg-[#0368b0]/40 text-white cursor-not-allowed"
          : "bg-[#0368b0] text-[#f5f9ff] hover:bg-[#025a8f] cursor-pointer focus:ring-2 focus:ring-[#0068f5] focus:ring-offset-2",
      ].join(" ")}>
      {label}
    </button>
  );
}

export function Field({ label, id, hint, error, children }: {
  label: string; id: string; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-semibold text-[#0c3058]">
        {label} <span className="text-[#c0392b]" aria-hidden="true">*</span>
        <span className="sr-only">(שדה חובה)</span>
      </label>
      {hint && <p className="text-xs text-[#266794]">{hint}</p>}
      {children}
      {error && <p role="alert" className="text-sm text-[#c0392b] mt-1 font-medium">{error}</p>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className || ""}`} />;
}

export function Check({ id, label, checked, onChange }: {
  id: string; label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 accent-[#0368b0] border-2 border-[#0368b0]/30 rounded cursor-pointer" />
      <label htmlFor={id} className="text-sm text-[#0c3058] cursor-pointer">{label}</label>
    </div>
  );
}
