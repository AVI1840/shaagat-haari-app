# Shaagat HaAri Rights Assistant

Production-grade MVP for Israeli National Insurance eligibility support during Operation Shaagat HaAri (March 2026).

## Architecture

The system uses a **deterministic rules engine** driven entirely by JSON policy files. No LLM decides eligibility.

```
src/
  data/           # Normalized JSON policy datasets (source of truth)
  engine/         # Pure TypeScript rules engine
    rule-evaluator.ts       # Evaluates conditions from rules.normalized.json
    timeline-evaluator.ts   # Date overlap, chalath duration, maternity freeze
    calculation-service.ts  # Senior grant, employer comp, overtime validation
    edge-case-handler.ts    # Maternity-chalath intersection, dual status, etc.
    document-resolver.ts    # Maps document IDs to Hebrew labels
    hebrew-translator.ts    # Translates engine output to citizen-friendly Hebrew
    index.ts                # Main entry: validates with Zod, runs full pipeline
  schemas/        # Zod schemas for CitizenProfile and EngineResult
  store/          # Zustand wizard state with localStorage persistence
  components/
    wizard/       # Step-by-step Hebrew RTL wizard (one question per screen)
    action-card/  # Final result card with status, docs, calculation, next steps
  tests/          # Vitest test suite (16 scenarios)
```

## How It Works

1. Citizen answers questions one at a time in Hebrew
2. Wizard adapts path based on answers (age 67+ routes to senior grant, etc.)
3. Engine validates input with Zod, computes timeline, evaluates edge cases, matches rules by priority
4. Returns deterministic result: status, benefit type, calculation, documents, next action

## Policy Updates

All policy values live in `src/data/*.normalized.json`. To update:

1. Edit the relevant JSON file (rules, calculations, edge cases, or variables)
2. Ensure cross-references are consistent (variable names, calculation IDs)
3. Run `npx vitest run` to validate
4. No code changes needed for threshold/date/formula updates

## Running

```bash
npm install
npm run dev        # Development server
npx vitest run     # Test suite
npm run build      # Production build
```

## Outcomes

The engine produces one of: `approved`, `approved_with_deduction`, `requires_edge_case_handling`, `pending_secondary_review`, `denied`.

## Benefits Covered

- Emergency unemployment (Chalath) with standard/evacuee/PWD/soldier thresholds
- Senior citizen emergency grant (age 67+)
- Employer reserve compensation
- Spousal reserve absence and protected leave
- Maternity transport reimbursement (MDA monopoly override)
- Pregnancy preservation continuity
- Expanded overtime authorization
- Spousal termination protection
- Income support fallback (Haftachat Hachnasa)
