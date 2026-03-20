"use client";

import React from "react";

interface StepWrapperProps {
  question: string;
  hint?: string;
  children: React.ReactNode;
  fieldsetLegend?: string;
}

export function StepWrapper({ question, hint, children, fieldsetLegend }: StepWrapperProps) {
  return (
    <div className="bg-white border border-[#c8d0db] mt-4 p-6">
      <h2 className="text-xl font-semibold text-[#1a1a1a] mb-1 leading-snug">
        {question}
      </h2>
      {hint && (
        <p className="text-sm text-[#4a5568] mb-5 leading-relaxed border-r-4 border-[#003f8a] pr-3 bg-[#eef3fb] py-2 mt-2">
          {hint}
        </p>
      )}
      {fieldsetLegend ? (
        <fieldset className="border-0 p-0 m-0">
          <legend className="sr-only">{fieldsetLegend}</legend>
          <div className="space-y-2 mt-4">{children}</div>
        </fieldset>
      ) : (
        <div className="space-y-3 mt-4">{children}</div>
      )}
    </div>
  );
}

interface ChoiceButtonProps {
  label: string;
  description?: string;
  onClick: () => void;
  selected?: boolean;
}

export function ChoiceButton({ label, description, onClick, selected }: ChoiceButtonProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      aria-pressed={selected}
      className={[
        "w-full text-right p-4 border-2 transition-colors min-h-[52px] font-medium text-[15px] cursor-pointer",
        selected
          ? "border-[#003f8a] bg-[#e8f0fb] text-[#002d63]"
          : "border-[#c8d0db] bg-white text-[#1a1a1a] hover:border-[#003f8a] hover:bg-[#f0f5fc]",
      ].join(" ")}
    >
      <span className="flex items-start gap-3">
        <span
          className={[
            "mt-0.5 w-5 h-5 shrink-0 border-2 rounded-full flex items-center justify-center",
            selected ? "border-[#003f8a] bg-[#003f8a]" : "border-[#9aabb8] bg-white",
          ].join(" ")}
          aria-hidden="true"
        >
          {selected && <span className="w-2 h-2 rounded-full bg-white block" />}
        </span>
        <span>
          <span className="block">{label}</span>
          {description && (
            <span className="block text-sm text-[#4a5568] font-normal mt-0.5">{description}</span>
          )}
        </span>
      </span>
    </button>
  );
}

interface NextButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

export function NextButton({ onClick, label = "המשך", disabled = false }: NextButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={[
        "w-full mt-4 py-3 px-6 text-base font-semibold text-center min-h-[48px] transition-colors",
        disabled
          ? "bg-[#9aabb8] border-2 border-[#9aabb8] text-white cursor-not-allowed"
          : "bg-[#003f8a] border-2 border-[#003f8a] text-white hover:bg-[#002d63] hover:border-[#002d63] cursor-pointer",
      ].join(" ")}
      aria-disabled={disabled}
    >
      {label}
    </button>
  );
}

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, hint, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-[#1a1a1a]">
        {label}
      </label>
      {hint && <p className="text-xs text-[#4a5568]">{hint}</p>}
      {children}
      {error && (
        <p role="alert" className="text-sm text-[#8b1a1a] mt-1 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

// Shared input class — use this string directly in input elements
export const govInputClass =
  "w-full border-2 border-[#c8d0db] bg-white px-3 py-2.5 text-[15px] text-[#1a1a1a] min-h-[48px] focus:border-[#003f8a] focus:outline-none focus:ring-2 focus:ring-[#003f8a]/20 font-[inherit]";
