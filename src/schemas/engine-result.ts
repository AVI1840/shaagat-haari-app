import { z } from "zod";

export const EligibilityStatusEnum = z.enum([
  "approved",
  "approved_with_deduction",
  "requires_edge_case_handling",
  "pending_secondary_review",
  "denied",
]);

export const ConfidenceLevelEnum = z.enum(["high", "medium", "low"]);

export const ClaimReadinessEnum = z.enum([
  "ready_to_submit",
  "missing_documents",
  "missing_information",
  "not_eligible",
  "requires_review",
]);

const ActionStepSchema = z.object({
  step_number: z.number(),
  action: z.string(),
  detail: z.string().optional(),
  link: z.string().optional(),
  completed: z.boolean().default(false),
});

const DocumentItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(["provided", "missing", "not_required"]),
  how_to_get: z.string().optional(),
});

export const EngineResultSchema = z.object({
  eligibility_status: EligibilityStatusEnum,
  benefit_type: z.string(),
  benefit_label: z.string(),
  calculation_reference: z.string().nullable(),
  confidence_level: ConfidenceLevelEnum,
  claim_readiness: ClaimReadinessEnum,

  headline: z.string(),
  explanation_for_citizen: z.string(),
  action_steps: z.array(ActionStepSchema),
  documents: z.array(DocumentItemSchema),

  amount_estimate: z.string().nullable(),
  internal_reason_codes: z.array(z.string()),
  flags: z.array(z.string()).optional(),
  fallback_action: z.string().nullable().optional(),
  timeline_notes: z.string().nullable().optional(),
  calculation_result: z.record(z.string(), z.unknown()).nullable().optional(),
  missing_information: z.array(z.string()).optional(),
});

export type EngineResult = z.infer<typeof EngineResultSchema>;
export type EligibilityStatus = z.infer<typeof EligibilityStatusEnum>;
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelEnum>;
export type ActionStep = z.infer<typeof ActionStepSchema>;
export type DocumentItem = z.infer<typeof DocumentItemSchema>;
