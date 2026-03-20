import type { CitizenProfile } from "@/schemas/citizen-profile";
import rulesData from "@/data/rules.normalized.json";

interface Condition {
  variable?: string;
  comparator?: string;
  value?: unknown;
  operator?: string;
  operands?: Condition[];
  timeline_comparison?: {
    type: string;
    date_variable: string;
    window_end_variable?: string;
    reference_date?: string;
  };
}

interface RuleResult {
  eligibility_status: string;
  benefit_type: string;
  calculation_reference: string | null;
  required_documents: string[];
  reason_code: string;
  explanation: string;
  fallback_action?: string;
  gender_specific_notes?: Record<string, string>;
}

interface Rule {
  rule_id: string;
  priority: number;
  description: string;
  benefit_type: string | null;
  conditions: Condition;
  result: RuleResult;
}

function compareValues(
  actual: unknown,
  comparator: string,
  expected: unknown
): boolean {
  if (actual === undefined || actual === null) return false;

  switch (comparator) {
    case "==":
      return actual === expected;
    case "!=":
      return actual !== expected;
    case ">":
      return (actual as number) > (expected as number);
    case ">=":
      return (actual as number) >= (expected as number);
    case "<":
      return (actual as number) < (expected as number);
    case "<=":
      if (typeof expected === "string") {
        return String(actual) <= expected;
      }
      return (actual as number) <= (expected as number);
    case "is_not_null":
      return actual !== null && actual !== undefined;
    default:
      return false;
  }
}

function evaluateCondition(
  condition: Condition,
  profile: CitizenProfile
): boolean {
  if (condition.operator) {
    const operands = condition.operands || [];
    switch (condition.operator) {
      case "AND":
        return operands.every((op) => evaluateCondition(op, profile));
      case "OR":
        return operands.some((op) => evaluateCondition(op, profile));
      case "NOT":
        return !operands.every((op) => evaluateCondition(op, profile));
      default:
        return false;
    }
  }

  if (condition.timeline_comparison) {
    return evaluateTimelineComparison(condition.timeline_comparison, profile);
  }

  if (condition.variable && condition.comparator !== undefined) {
    const value = (profile as Record<string, unknown>)[condition.variable];
    return compareValues(value, condition.comparator, condition.value);
  }

  return false;
}

function evaluateTimelineComparison(
  tc: NonNullable<Condition["timeline_comparison"]>,
  profile: CitizenProfile
): boolean {
  const dateVal = (profile as Record<string, unknown>)[
    tc.date_variable
  ] as string;
  if (!dateVal) return false;

  const date = new Date(dateVal);

  if (tc.type === "date_within_window" && tc.window_end_variable) {
    const windowEnd = (profile as Record<string, unknown>)[
      tc.window_end_variable
    ] as string;
    if (!windowEnd) return false;
    return date <= new Date(windowEnd);
  }

  if (tc.type === "date_before" && tc.reference_date) {
    return date < new Date(tc.reference_date);
  }

  return false;
}

export function evaluateRules(profile: CitizenProfile): {
  matchedRule: Rule | null;
  allMatched: Rule[];
} {
  const rules = (rulesData.rules as Rule[]).sort(
    (a, b) => a.priority - b.priority
  );
  const allMatched: Rule[] = [];

  for (const rule of rules) {
    if (evaluateCondition(rule.conditions, profile)) {
      allMatched.push(rule);
    }
  }

  return {
    matchedRule: allMatched.length > 0 ? allMatched[0] : null,
    allMatched,
  };
}

export type { Rule, RuleResult, Condition };
